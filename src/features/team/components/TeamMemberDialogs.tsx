import React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/ui/sheet";
import { TeamMemberForm } from "@/features/team/components/TeamMemberForm";
import { TeamMember } from "@/features/team/types/team";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/ui/alert-dialog";

interface TeamMemberDialogsProps {
  isAddMemberSheetOpen: boolean;
  setIsAddMemberSheetOpen: (open: boolean) => void;
  isEditMemberSheetOpen: boolean;
  setIsEditMemberSheetOpen: (open: boolean) => void;
  confirmDeleteDialogOpen: boolean;
  setConfirmDeleteDialogOpen: (open: boolean) => void;
  currentMember: TeamMember | null;
  teamId: string;
  handleCreateMember: (member: Partial<TeamMember>) => Promise<boolean>;
  handleUpdateMember: (member: TeamMember) => Promise<boolean>;
  confirmDeleteMember: () => Promise<boolean>;
}

export const TeamMemberDialogs = ({
  isAddMemberSheetOpen,
  setIsAddMemberSheetOpen,
  isEditMemberSheetOpen,
  setIsEditMemberSheetOpen,
  confirmDeleteDialogOpen,
  setConfirmDeleteDialogOpen,
  currentMember,
  teamId,
  handleCreateMember,
  handleUpdateMember,
  confirmDeleteMember
}: TeamMemberDialogsProps) => {
  // Vérifier explicitement si currentMember est défini pour le formulaire d'édition
  // C'est ici que se trouve le problème - s'assurer que les données sont passées correctement
  console.log("Données du membre à modifier:", currentMember);

  return (
    <>
      {/* Dialogue d'ajout d'un membre */}
      <Sheet open={isAddMemberSheetOpen} onOpenChange={setIsAddMemberSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Ajouter un membre</SheetTitle>
            <SheetDescription>Ajoutez un nouveau membre à votre équipe.</SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <TeamMemberForm
              teamId={teamId}
              onSubmit={handleCreateMember}
              onCancel={() => setIsAddMemberSheetOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialogue de modification d'un membre */}
      <Sheet open={isEditMemberSheetOpen} onOpenChange={setIsEditMemberSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Modifier un membre</SheetTitle>
            <SheetDescription>Modifiez les informations du membre.</SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {currentMember && ( // S'assurer que currentMember existe
              <TeamMemberForm
                isEdit={true}
                member={currentMember}
                teamId={teamId}
                onSubmit={handleUpdateMember}
                onCancel={() => setIsEditMemberSheetOpen(false)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={confirmDeleteDialogOpen} onOpenChange={setConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement le membre {currentMember?.name} de votre équipe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMember} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
