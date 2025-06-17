import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Participant } from "@/types";
import { TeamMember } from "@/types/team";
// Importer directement depuis le service existant
import { getProjectMembers } from "@/services/team/teamProjectRelationService";
import { syncLocalMembersWithReports } from "@/components/services/teamService";
interface TeamMemberSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onMembersSelected: (participants: Participant[]) => void;
  existingParticipantIds: string[];
}

export const TeamMemberSelectionDialog: React.FC<TeamMemberSelectionDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  onMembersSelected,
  existingParticipantIds,
}) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Charger les membres du projet
  useEffect(() => {
    const loadMembers = async () => {
      if (!open) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log("Chargement des membres pour le projet:", projectId);
        
        // Utiliser directement la fonction du service
        const projectMembers = await getProjectMembers(projectId);
        console.log("Membres chargés:", projectMembers.length);
        
        // Filtrer les membres déjà dans les participants
        const filteredMembers = projectMembers.filter(
          member => !existingParticipantIds.includes(member.id)
        );
        
        setMembers(filteredMembers);
      } catch (error) {
        console.error("Erreur lors du chargement des membres:", error);
        setError("Impossible de charger les membres du projet");
      } finally {
        setLoading(false);
      }
    };
    
    loadMembers();
  }, [open, projectId, existingParticipantIds]);
  
  const handleToggleMember = (memberId: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };
  
  // Ajouter cette fonction avant handleConfirm
  const ensureMembersAreSaved = (selectedMembers: TeamMember[]) => {
    try {
      // Récupérer tous les membres existants
      const storedData = localStorage.getItem('teamMembersData');
      const existingMembers = storedData ? JSON.parse(storedData) : [];
      let modified = false;
      
      // Pour chaque membre sélectionné, vérifier s'il existe déjà
      for (const member of selectedMembers) {
        const existingIndex = existingMembers.findIndex(m => m.id === member.id);
        if (existingIndex === -1) {
          // Si le membre n'existe pas, l'ajouter
          existingMembers.push(member);
          modified = true;
          console.log("Ajout du membre manquant à teamMembersData:", member.name);
        }
      }
      
      // Si des modifications ont été faites, sauvegarder
      if (modified) {
        localStorage.setItem('teamMembersData', JSON.stringify(existingMembers));
        // Synchroniser pour les rapports
        syncLocalMembersWithReports();
      }
    } catch (error) {
      console.error("Erreur lors de la synchronisation des membres:", error);
    }
  };

  // Puis modifier handleConfirm pour utiliser cette fonction:
  const handleConfirm = () => {
    const selectedMembersData = members.filter(member => 
      selectedMemberIds.includes(member.id)
    );
    
    // Assurer que ces membres sont bien sauvegardés
    ensureMembersAreSaved(selectedMembersData);
    
    const selectedParticipants = selectedMembersData.map(member => ({
      id: member.id,
      role: member.role || "",
      contact: member.name || "",
      address: "",
      email: member.email || "",
      phone: member.phone || "",
      presence: "P" as "P" | "R" | "A" | "E",
    }));
    
    onMembersSelected(selectedParticipants);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sélectionner des membres de l'équipe</DialogTitle>
          <DialogDescription>
            Choisissez les membres à ajouter comme participants au rapport.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="bg-red-50 p-3 rounded text-red-700 text-center">
            {error}
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-6">
            Chargement des membres...
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {existingParticipantIds.length > 0
              ? "Tous les membres de l'équipe sont déjà ajoutés."
              : "Aucun membre dans l'équipe du projet."}
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-3 p-2 rounded hover:bg-muted">
                  <Checkbox
                    id={`member-${member.id}`}
                    checked={selectedMemberIds.includes(member.id)}
                    onCheckedChange={() => handleToggleMember(member.id)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`member-${member.id}`}
                      className="text-sm font-medium cursor-pointer">
                      {member.name}
                    </label>
                    <div className="text-xs text-muted-foreground">
                      {member.role && <span>{member.role} · </span>}
                      {member.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedMemberIds.length === 0 || loading}>
            Ajouter{" "}
            {selectedMemberIds.length > 0 && `(${selectedMemberIds.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
