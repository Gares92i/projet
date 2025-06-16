import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getProjectMembers } from "@/services/team/teamProjectRelationService";
import { TeamMember } from "@/types/team";
import { AssignMembersDialog } from "@/components/project/AssignMembersDialog";

type TeamUpdatePayload = {
  type: "team";
  data: TeamMember[];
};

interface TeamTabProps {
  projectId: string;
  teamMembers?: TeamMember[];
  onDataUpdate?: (payload: TeamUpdatePayload) => void;
}

export const TeamTab = ({ projectId, teamMembers: initialMembers, onDataUpdate }: TeamTabProps) => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<TeamMember[]>(initialMembers || []);
  const [isLoading, setIsLoading] = useState(!initialMembers);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  // Charger les membres depuis le service si non fournis
  useEffect(() => {
    const loadProjectMembers = async () => {
      if (initialMembers) return; // Déjà fourni

      try {
        setIsLoading(true);
        const projectMembers = await getProjectMembers(projectId);
        setMembers(projectMembers);
      } catch (error) {
        console.error("Erreur lors du chargement des membres:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectMembers();
  }, [projectId, initialMembers]);

  // Ajouter cet appel après l'initialisation des membres
  useEffect(() => {
    // Charger les membres dès le montage du composant si non fournis
    if (!initialMembers || initialMembers.length === 0) {
      refreshMembers();
    }
  }, []);

  const refreshMembers = async () => {
    try {
      setIsLoading(true);
      const { getProjectMembers } = await import('@/services/team/teamProjectRelationService');
      const projectMembers = await getProjectMembers(projectId);
      
      setMembers(projectMembers);
      
      // IMPORTANT: Corriger ici - payload doit être un objet avec type et data
      if (onDataUpdate) {
        onDataUpdate({
          type: "team",
          data: projectMembers
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const { removeMemberFromProject } = await import(
        "@/services/team/teamProjectRelationService"
      );
      const success = await removeMemberFromProject(memberId, projectId);
      if (success) {
        const updatedMembers = members.filter((m) => m.id !== memberId);
        setMembers(updatedMembers);

        // Mettre à jour les données dans le composant parent avec le bon format
        if (onDataUpdate) {
          onDataUpdate({
            type: "team",
            data: updatedMembers,
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du membre:", error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <CardTitle>Équipe</CardTitle>
              <CardDescription>Membres de l'équipe travaillant sur ce projet</CardDescription>
            </div>
            <Button onClick={() => setIsAssignDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Assigner des membres
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">Chargement des membres...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-6 border rounded-lg">
              <p className="mb-2">Aucun membre assigné à ce projet</p>
              <Button 
                variant="outline"
                onClick={() => setIsAssignDialogOpen(true)}
                className="mt-2"
              >
                Assigner des membres
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map(member => (
                <div key={member.id} className="border rounded-lg p-4 flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16 mb-3">
                    <AvatarImage src={member.avatar || undefined} alt={member.name || "Membre"} />
                    <AvatarFallback>{(member.name || "?").charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-muted-foreground capitalize">{member.role}</p>
                  {member.activity && (
                    <p className="text-sm text-muted-foreground mt-1">{member.activity}</p>
                  )}
                  <Badge 
                    className="mt-2"
                    variant={member.status === "active" ? "default" : "secondary"}
                  >
                    {member.status === "active" ? "Actif" : "Inactif"}
                  </Badge>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/team/${member.id}`)}>
                      Profil
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleRemoveMember(member.id)} // Utiliser la nouvelle fonction ici
                    >
                      Retirer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Boîte de dialogue pour assigner des membres */}
      <AssignMembersDialog
        projectId={projectId}
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        onMembersAssigned={refreshMembers}
      />
    </>
  );
};
