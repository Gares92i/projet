import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { ScrollArea } from "@/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { TeamMember } from "@/types/team";
import { toast } from "sonner";
import { assignMemberToProject, removeMemberFromProject, getProjectMembers } from "@/features/team/teamProjectRelationService";

interface AssignMembersDialogProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onMembersAssigned?: () => void;
}

export const AssignMembersDialog: React.FC<AssignMembersDialogProps> = ({
  projectId,
  isOpen,
  onClose,
  onMembersAssigned
}) => {
  const [allMembers, setAllMembers] = useState<TeamMember[]>([]);
  const [projectMembers, setProjectMembers] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Charger tous les membres et ceux déjà assignés
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Utiliser le service pour charger tous les membres
        const { getAllTeamMembers } = await import('@/features/team/services/teamService');
        const allMembers = await getAllTeamMembers();
        setAllMembers(allMembers);

        // Charger les membres assignés au projet
        const projectMembersData = await getProjectMembers(projectId);
        const memberIds = projectMembersData.map(member => member.id);
        setProjectMembers(memberIds);
        setSelectedMembers(memberIds);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Impossible de charger les membres");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [projectId, isOpen]);

  const handleToggleMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Membres à ajouter (dans selectedMembers mais pas dans projectMembers)
      const membersToAdd = selectedMembers.filter(id => !projectMembers.includes(id));

      // Membres à retirer (dans projectMembers mais pas dans selectedMembers)
      const membersToRemove = projectMembers.filter(id => !selectedMembers.includes(id));

      // Ajouter les nouveaux membres
      for (const memberId of membersToAdd) {
        await assignMemberToProject(memberId, projectId);
      }
      
      // Retirer les membres désélectionnés
      for (const memberId of membersToRemove) {
        await removeMemberFromProject(memberId, projectId);
      }

      toast.success("Membres de l'équipe mis à jour avec succès");
      if (onMembersAssigned) {
        // Ajouter un délai pour s'assurer que les données sont bien enregistrées
        setTimeout(() => {
          onMembersAssigned();
        }, 300);
      }
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour des membres:", error);
      toast.error("Impossible de mettre à jour les membres");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assigner des membres au projet</DialogTitle>
          <DialogDescription>
            Sélectionnez les membres que vous souhaitez assigner à ce projet.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-6 text-center">Chargement des membres...</div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {allMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      id={`member-${member.id}`}
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => handleToggleMember(member.id)}
                    />
                    <Avatar className="h-8 w-8">
                      {member.avatar ? (
                        <AvatarImage src={member.avatar} alt={member.name || ""} />
                      ) : null}
                      <AvatarFallback>{(member.name || "").charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <label 
                        htmlFor={`member-${member.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {member.name}
                      </label>
                      <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={member.status === "active" ? "default" : "secondary"}
                    className={`${
                      member.status === "active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {member.status === "active" ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};