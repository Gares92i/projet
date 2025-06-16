import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, GripVertical, RefreshCw } from "lucide-react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getProjectMembers } from "@/services/team/teamProjectRelationService";
import { TeamMember } from "@/types/team";
import { TeamMemberSelectionDialog } from "./TeamMemberSelectionDialog";
import { useParams } from "react-router-dom";
import { syncLocalMembersWithReports } from "@/components/services/teamService";

interface StorageProject {
  id: string;
  name: string;
  teamMembers: (string | { id: string })[];
  teamSize?: number;
  [key: string]: unknown;
}

interface StorageTeamMember {
  id: string;
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  profile?: {
    company?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Fonction directe pour charger les membres depuis localStorage
function loadTeamMembersDirectly(projectId: string): TeamMember[] {
  try {
    // 1. Charger les données du projet
    const projectsData = localStorage.getItem("projectsData");
    if (!projectsData) return [];

    const projects = JSON.parse(projectsData) as StorageProject[];
    const project = projects.find((p: StorageProject) => p.id === projectId);
    if (!project) return [];

    console.log(
      "Projet trouvé:",
      project.name,
      "avec",
      project.teamSize || 0,
      "membres"
    );

    // 2. Extraire les IDs des membres
    let memberIds: string[] = [];
    if (Array.isArray(project.teamMembers)) {
      memberIds = project.teamMembers
        .filter((id): id is string => typeof id === "string")
        .concat(
          project.teamMembers
            .filter(
              (item): item is { id: string } =>
                typeof item === "object" && item !== null && "id" in item
            )
            .map((item) => item.id)
        );
    }

    console.log("IDs des membres trouvés:", memberIds);
    if (memberIds.length === 0) return [];

    // 3. Charger tous les membres
    const teamMembersData = localStorage.getItem("teamMembersData");
    if (!teamMembersData) return [];

    const allMembers = JSON.parse(teamMembersData) as StorageTeamMember[];
    console.log("Nombre total de membres:", allMembers.length);

    // 4. Filtrer les membres qui appartiennent au projet
    const projectMembers = allMembers
      .filter((m: StorageTeamMember) => memberIds.includes(m.id))
      .map(
        (m: StorageTeamMember) =>
          ({
            id: m.id,
            name: m.name || "",
            role: m.role || "",
            email: m.email || "",
            phone: m.phone || "",
            profile: m.profile || {},
            // Ajouter les propriétés manquantes requises par TeamMember
            status: "active",
            avatar: "",
            team_id: "",
            user_id: "",
          } as TeamMember)
      );

    console.log("Membres du projet:", projectMembers.length);
    return projectMembers;
  } catch (error) {
    console.error("Erreur lors du chargement direct des membres:", error);
    return [];
  }
}

interface Participant {
  id: string;
  role: string;
  contact: string;
  address: string;
  email: string;
  phone: string;
  presence: "P" | "R" | "A" | "E";
}

interface ParticipantsSectionProps {
  teamMembers?: TeamMember[]; // Membres d'équipe du projet
  initialParticipants?: Participant[]; // Pour la compatibilité avec les données existantes
  onChange?: (participants: Participant[]) => void; // Pour sauvegarder les modifications
  projectId?: string; // ID du projet pour charger les membres si nécessaire
}

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

export const ParticipantsSection: React.FC<ParticipantsSectionProps> = ({
  initialParticipants,
  onChange,
  projectId: propProjectId,
}) => {
  const { projectId: urlProjectId } = useParams();
  const projectId = propProjectId || urlProjectId;

  // DEBUG: Ajouter des logs pour vérifier les valeurs initiales
  console.log("ParticipantsSection - Mount avec projectId:", projectId);
  console.log(
    "ParticipantsSection - initialParticipants:",
    initialParticipants
  );

  // Utiliser un état pour suivre si le composant a été initialisé avec des données
  const [hasBeenInitialized, setHasBeenInitialized] = useState(false);

  // Utiliser directement initialParticipants au lieu d'un tableau vide par défaut
  const [participants, setParticipants] = useState<Participant[]>(() => {
    // Vérifier si initialParticipants est valide
    if (
      initialParticipants &&
      Array.isArray(initialParticipants) &&
      initialParticipants.length > 0
    ) {
      console.log(
        "ParticipantsSection - Initialisation avec",
        initialParticipants.length,
        "participants"
      );
      return [...initialParticipants]; // Copie pour éviter les mutations
    }
    console.log("ParticipantsSection - Initialisation avec tableau vide");
    return [];
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // IMPORTANT: Ajouter un useEffect spécifique pour l'initialisation
  useEffect(() => {
    if (
      !hasBeenInitialized &&
      initialParticipants &&
      Array.isArray(initialParticipants) &&
      initialParticipants.length > 0
    ) {
      console.log(
        "ParticipantsSection - Première initialisation avec",
        initialParticipants.length,
        "participants"
      );
      setParticipants(initialParticipants);
      setHasBeenInitialized(true);
    }
  }, [initialParticipants, hasBeenInitialized]);

  // Ajouter un useEffect pour mettre à jour le state local quand initialParticipants change
  useEffect(() => {
    // Ne mettre à jour que si les données ont changé et sont non vides
    if (
      initialParticipants &&
      Array.isArray(initialParticipants) &&
      initialParticipants.length > 0
    ) {
      console.log(
        "ParticipantsSection - Mise à jour des participants:",
        initialParticipants
      );

      // Vérifier si les participants sont différents de l'état actuel
      const currentIds = new Set(participants.map((p) => p.id));
      const initialIds = new Set(initialParticipants.map((p) => p.id));

      // Vérifier si les ensembles sont différents
      let needsUpdate = currentIds.size !== initialIds.size;
      if (!needsUpdate) {
        // Vérifier si tous les éléments de initialIds sont dans currentIds
        for (const id of initialIds) {
          if (!currentIds.has(id)) {
            needsUpdate = true;
            break;
          }
        }
      }

      if (needsUpdate) {
        console.log(
          "ParticipantsSection - Mise à jour nécessaire des participants"
        );
        setParticipants(initialParticipants);
      }
    }
  }, [initialParticipants]);

  // Assurer que le onChange est appelé à chaque modification des participants
  useEffect(() => {
    if (onChange) {
      console.log(
        "ParticipantsSection - Notification de changement:",
        participants.length,
        "participants"
      );
      onChange(participants);
    }
  }, [participants, onChange]);

  // Ajouter cette fonction après handleAddParticipants
  const syncParticipantsWithTeam = (currentParticipants: Participant[]) => {
    try {
      // 1. D'abord, sauvegarder les participants comme membres potentiels
      const participantsAsMembers = currentParticipants.map((p) => ({
        id: p.id,
        name: p.contact || "",
        email: p.email || "",
        phone: p.phone || "",
        role: p.role || "autre",
        status: "active",
        team_id: "local-team",
        user_id: `user_${p.id}`,
      }));

      // 2. Récupérer les membres existants
      const storedData = localStorage.getItem("teamMembersData");
      const existingMembers = storedData ? JSON.parse(storedData) : [];

      // 3. Fusionner sans dupliquer
      let updated = false;
      for (const member of participantsAsMembers) {
        if (!existingMembers.some((m) => m.id === member.id)) {
          existingMembers.push(member);
          updated = true;
        }
      }

      // 4. Sauvegarder si modifié
      if (updated) {
        localStorage.setItem("teamMembersData", JSON.stringify(existingMembers));
        console.log("Participants synchronisés avec l'équipe");
      }

      // 5. Appeler la synchronisation existante
      syncLocalMembersWithReports();
    } catch (error) {
      console.error("Erreur lors de la synchronisation participants → équipe:", error);
    }
  };

  const handleAddParticipants = (newParticipants: Participant[]) => {
    console.log(
      "ParticipantsSection - Ajout de",
      newParticipants.length,
      "nouveaux participants"
    );
    const updatedParticipants = [...participants, ...newParticipants];
    setParticipants(updatedParticipants);
    if (onChange) onChange(updatedParticipants);

    // Ajouter cet appel
    syncParticipantsWithTeam(updatedParticipants);
  };

  const handleRemoveParticipant = (id: string) => {
    console.log("ParticipantsSection - Suppression du participant:", id);
    const updatedParticipants = participants.filter((p) => p.id !== id);
    setParticipants(updatedParticipants);
    if (onChange) onChange(updatedParticipants);
  };

  const handleUpdateParticipant = (
    id: string,
    field: keyof Participant,
    value: string
  ) => {
    const newParticipants = participants.map((participant) => {
      if (participant.id === id) {
        if (field === "presence") {
          return {
            ...participant,
            [field]: value as "P" | "R" | "A" | "E",
          };
        }
        return { ...participant, [field]: value };
      }
      return participant;
    });
    setParticipants(newParticipants);
    if (onChange) onChange(newParticipants);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const newParticipants = arrayMove(
        participants,
        participants.findIndex((item) => item.id === active.id),
        participants.findIndex((item) => item.id === over.id)
      );
      setParticipants(newParticipants);
      if (onChange) onChange(newParticipants);
    }
  };

  const handleAddMembersClick = () => {
    console.log(
      "ParticipantsSection - Ouverture du dialogue de sélection des membres"
    );
    console.log("ParticipantsSection - projectId:", projectId);
    setIsDialogOpen(true);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // DEBUG: État actuel des participants
  console.log(
    "ParticipantsSection - État actuel:",
    participants.length,
    "participants"
  );

  return (
    <Card className="mb-8">
      <div
        className="participants-bar"
        style={{
          backgroundColor: "#ffffff",
          padding: "15px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #ccc",
          borderTopLeftRadius: "0.375rem",
          borderTopRightRadius: "0.375rem",
        }}>
        <span
          className="title"
          style={{
            color: "#007bff",
            fontWeight: "bold",
            fontSize: "16px",
            textTransform: "none",
          }}>
          Participants
        </span>

        {projectId && (
          <Button
            variant="outline"
            onClick={handleAddMembersClick}
            className="mr-auto ml-4">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter des membres
          </Button>
        )}

        <div
          className="status-group"
          style={{
            display: "flex",
            gap: "20px",
          }}>
          <span
            className="status present"
            style={{
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
              color: "#28a745",
            }}>
            <span
              className="letter"
              style={{
                display: "inline-block",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                textAlign: "center",
                lineHeight: "20px",
                marginRight: "6px",
                fontWeight: "bold",
                border: "2px solid #28a745",
                color: "#28a745",
              }}>
              P
            </span>{" "}
            Présent
          </span>
          <span
            className="status late"
            style={{
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
              color: "#fd7e14",
            }}>
            <span
              className="letter"
              style={{
                display: "inline-block",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                textAlign: "center",
                lineHeight: "20px",
                marginRight: "6px",
                fontWeight: "bold",
                border: "2px solid #fd7e14",
                color: "#fd7e14",
              }}>
              R
            </span>{" "}
            Retard
          </span>
          <span
            className="status absent"
            style={{
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
              color: "#dc3545",
            }}>
            <span
              className="letter"
              style={{
                display: "inline-block",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                textAlign: "center",
                lineHeight: "20px",
                marginRight: "6px",
                fontWeight: "bold",
                border: "2px solid #dc3545",
                color: "#dc3545",
              }}>
              A
            </span>{" "}
            Absent
          </span>
          <span
            className="status excused"
            style={{
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
              color: "#007bff",
            }}>
            <span
              className="letter"
              style={{
                display: "inline-block",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                textAlign: "center",
                lineHeight: "20px",
                marginRight: "6px",
                fontWeight: "bold",
                border: "2px solid #007bff",
                color: "#007bff",
              }}>
              E
            </span>{" "}
            Excusé
          </span>
        </div>
      </div>

      <CardContent className="pt-6">
        {participants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun participant ajouté
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-7 gap-2 px-10 text-xs font-medium text-muted-foreground">
              <div>Rôle</div>
              <div>Contact</div>
              <div>Adresse</div>
              <div>Email</div>
              <div>Téléphone</div>
              <div className="text-center">Présence</div>
              <div></div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}>
              <SortableContext
                items={participants.map((p) => p.id)}
                strategy={verticalListSortingStrategy}>
                {participants.map((participant) => (
                  <SortableItem key={participant.id} id={participant.id}>
                    <div className="grid grid-cols-7 gap-2 items-center border rounded-md p-2 bg-card">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <Input
                          placeholder="Rôle"
                          value={participant.role}
                          onChange={(e) =>
                            handleUpdateParticipant(
                              participant.id,
                              "role",
                              e.target.value
                            )
                          }
                          className="w-full"
                        />
                      </div>
                      <Input
                        placeholder="Contact"
                        value={participant.contact}
                        onChange={(e) =>
                          handleUpdateParticipant(
                            participant.id,
                            "contact",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        placeholder="Adresse"
                        value={participant.address}
                        onChange={(e) =>
                          handleUpdateParticipant(
                            participant.id,
                            "address",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        placeholder="Email"
                        value={participant.email}
                        onChange={(e) =>
                          handleUpdateParticipant(
                            participant.id,
                            "email",
                            e.target.value
                          )
                        }
                        type="email"
                      />
                      <Input
                        placeholder="Téléphone"
                        value={participant.phone}
                        onChange={(e) =>
                          handleUpdateParticipant(
                            participant.id,
                            "phone",
                            e.target.value
                          )
                        }
                      />
                      <Select
                        value={participant.presence}
                        onValueChange={(value) =>
                          handleUpdateParticipant(
                            participant.id,
                            "presence",
                            value as "P" | "R" | "A" | "E"
                          )
                        }>
                        <SelectTrigger className="w-20">
                          <SelectValue placeholder="Présence" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="P">Présent</SelectItem>
                          <SelectItem value="R">Représenté</SelectItem>
                          <SelectItem value="A">Absent</SelectItem>
                          <SelectItem value="E">Excusé</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveParticipant(participant.id)
                          }>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </CardContent>

      <div className="px-6 pb-4">
        <Button
          variant="outline"
          onClick={handleAddMembersClick}
          className="mr-auto ml-4">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter des membres
        </Button>
      </div>

      <TeamMemberSelectionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectId={projectId}
        onMembersSelected={handleAddParticipants}
        existingParticipantIds={participants.map((p) => p.id)}
      />
    </Card>
  );
};
