import { useState, useEffect, useCallback } from "react";
import { TeamMember } from '@/app/styles'; // Importer depuis le point central
import {
  getAllTeamMembers,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  // syncLocalMembersWithReports
} from "@/features/team/services/teamService"; // Utiliser les fonctions Supabase
import { toast } from 'sonner';

export const useTeamMemberManager = () => {
  const [membersData, setMembersData] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);

  // États pour les modales et dialogues
  const [isAddMemberSheetOpen, setIsAddMemberSheetOpen] = useState(false);
  const [isEditMemberSheetOpen, setIsEditMemberSheetOpen] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const openAddMemberSheet = useCallback(() => {
    setIsAddMemberSheetOpen(true);
  }, []);

  // ID d'équipe par défaut
  const teamId = localStorage.getItem('default_team_id') || 'default';

  // Charger les membres avec la bonne fonction
  useEffect(() => {
    const loadMembers = async () => {
      setIsLoading(true);
      try {
        console.log("Chargement des membres...");
        const members = await getAllTeamMembers();
        console.log(`${members.length} membres chargés`);
        setMembersData(members);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger les membres");
      } finally {
        setIsLoading(false);
      }
    };

    loadMembers();
  }, []);

  // Filtrage des membres
  const filteredMembers = membersData.filter(member => {
    // Filtrage par recherche
    const matchesSearch = searchQuery === "" || 
      (member.name && member.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.email && member.email.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filtrage par catégorie
    let matchesFilter = activeFilter === "all";

    if (activeFilter === "active") {
      matchesFilter = member.status === "active";
    } else if (activeFilter === "inactive") {
      matchesFilter = member.status === "inactive";
    } else if (["architecte", "chef_de_projet", "ingenieur", "designer", "entreprise", "assistant"].includes(activeFilter)) {
      matchesFilter = member.role === activeFilter;
    }

    return matchesSearch && matchesFilter;
  });

  // Adapter les membres pour le filtrage si nécessaire
  const adaptMembersForFilter = (members: TeamMember[]) => {
    return members;
  };

  // Fonctions CRUD
  const handleEditMember = (member: TeamMember) => {
    setCurrentMember(member);
    setIsEditMemberSheetOpen(true);
  };

  const handleDeleteMember = (member: TeamMember) => {
    setCurrentMember(member);
    setConfirmDeleteDialogOpen(true);
  };

  const handleCreateMember = async (memberData: Partial<TeamMember>) => {
    try {
      const success = await addTeamMember(memberData);
      if (success) {
        // Ajouter cette ligne pour synchroniser avec les rapports
        // syncLocalMembersWithReports();

        toast.success("Membre ajouté avec succès");
        // Recharger les membres après ajout
        const updatedMembers = await getAllTeamMembers();
        setMembersData(updatedMembers);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'ajout");
      return false;
    }
  };

  const handleUpdateMember = async (member: TeamMember) => {
    try {
      const updatedMember = await updateTeamMember(member);
      if (updatedMember) {
        // Mettre à jour l'état local directement
        setMembersData(prev => 
          prev.map(m => m.id === member.id ? updatedMember : m)
        );
        toast.success("Membre mis à jour avec succès");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du membre:", error);
      toast.error("Erreur lors de la mise à jour du membre");
      return false;
    }
  };

  const confirmDeleteMember = async () => {
    if (!currentMember) return false;
    
    try {
      const success = await deleteTeamMember(currentMember.id);
      if (success) {
        // Supprimer de l'état local directement
        setMembersData(prev => prev.filter(m => m.id !== currentMember.id));
        setConfirmDeleteDialogOpen(false);
        toast.success("Membre supprimé avec succès");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erreur lors de la suppression du membre:", error);
      toast.error("Erreur lors de la suppression du membre");
      return false;
    }
  };

  return {
    membersData,
    isLoading,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filteredMembers,
    openAddMemberSheet,
    isAddMemberSheetOpen,
    setIsAddMemberSheetOpen,
    isEditMemberSheetOpen,
    setIsEditMemberSheetOpen,
    confirmDeleteDialogOpen,
    setConfirmDeleteDialogOpen,
    currentMember,
    teamId,
    handleEditMember,
    handleDeleteMember,
    handleCreateMember,
    handleUpdateMember,
    confirmDeleteMember,
    adaptMembersForFilter,
  };
};
