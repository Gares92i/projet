import { toast } from "sonner";
import { loadTeamMembersFromStorage, saveTeamMembersToStorage, getDefaultTeamMembers } from "./teamStorageUtils";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember, TeamMemberRole, TeamMemberStatus, normalizeTeamMember } from "@/types/team";

// Définir une interface pour les données brutes de localStorage
interface StoredTeamMember {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  team_id?: string;
  user_id?: string;
  avatar?: string;
  phone?: string;
  activity?: string;
  projects?: string[];
}

// Explicitement typer teamMembersData comme StoredTeamMember[]
let teamMembersData: StoredTeamMember[] = loadTeamMembersFromStorage();

// Si aucune donnée n'est trouvée, utiliser les données par défaut
if (teamMembersData.length === 0) {
  teamMembersData = getDefaultTeamMembers();
  saveTeamMembersToStorage(teamMembersData);
}

// Fonction pour créer la table si elle n'existe pas déjà
const ensureTableExists = async () => {
  try {
    // Utiliser un cast de type pour l'appel RPC
    const { error } = await supabase.rpc(
      'check_and_create_team_members_table' as any
    );

    if (error) {
      console.warn("Impossible de vérifier/créer la table team_members:", error);
      // Continuer avec localStorage comme fallback
    }
  } catch (error) {
    console.warn("Erreur lors de la vérification de la structure de la table:", error);
  }
};

// Récupérer tous les membres
export const getAllTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const storedMembers = localStorage.getItem('teamMembersData');
    if (storedMembers) {
      const parsedMembers = JSON.parse(storedMembers) as StoredTeamMember[];
      
      // Conversion explicite de StoredTeamMember[] à TeamMember[]
      return parsedMembers.map((member: StoredTeamMember) => ({
        id: member.id || `member_${Date.now()}`,
        name: member.name || 'Sans nom',
        email: member.email || '',
        role: (member.role as TeamMemberRole) || 'autre',
        status: (member.status as TeamMemberStatus) || 'active',
        team_id: member.team_id || 'default',
        user_id: member.user_id || member.email || 'anonymous',
        avatar: member.avatar || '',
        phone: member.phone || '', // Ici la propriété phone est correctement gérée
        activity: member.activity || '',
        projects: member.projects || []
      } as TeamMember)); // Cast explicite vers TeamMember
    }
    return [];
  } catch (error) {
    console.error("Erreur:", error);
    return [];
  }
};

// Ajouter un membre
export const addLegacyTeamMember = async (memberData: Partial<TeamMember>): Promise<TeamMember | null> => {
  try {
    // Vérifier les attributs obligatoires
    if (!memberData.name || !memberData.role) {
      toast.error('Nom et rôle obligatoires');
      return null;
    }
    
    // Créer le membre avec les champs nécessaires
    const newMember: TeamMember = {
      id: memberData.id || `member_${Date.now()}`,
      name: memberData.name,
      email: memberData.email || '',
      role: memberData.role,
      status: memberData.status || 'active',
      team_id: memberData.team_id || 'default',
      user_id: memberData.user_id || memberData.email || `user_${Date.now()}`,
      phone: memberData.phone || '',
      avatar: memberData.avatar || '',
      activity: memberData.activity || ''
    };

    // Récupérer les membres existants
    const members = await getAllTeamMembers();
    
    // Ajouter le nouveau membre
    members.push(newMember);
    
    // Enregistrer
    localStorage.setItem('teamMembersData', JSON.stringify(members));
    toast.success('Membre ajouté avec succès');
    
    return newMember;
  } catch (error) {
    console.error("Erreur:", error);
    toast.error("Impossible d'ajouter le membre");
    return null;
  }
};

// Mise à jour d'un membre
export const updateLegacyTeamMember = async (member: TeamMember): Promise<TeamMember | null> => {
  try {
    const members = await getAllTeamMembers();
    const index = members.findIndex(m => m.id === member.id);
    
    if (index === -1) {
      toast.error('Membre non trouvé');
      return null;
    }
    
    // S'assurer que toutes les propriétés obligatoires sont présentes
    const updatedMember: TeamMember = {
      ...members[index],
      ...member,
      name: member.name || members[index].name,
      role: member.role || members[index].role,
      status: member.status || members[index].status,
      team_id: member.team_id || members[index].team_id,
      user_id: member.user_id || members[index].user_id
    };
    
    members[index] = updatedMember;
    localStorage.setItem('teamMembersData', JSON.stringify(members));
    toast.success('Membre mis à jour avec succès');
    
    return updatedMember;
  } catch (error) {
    console.error("Erreur:", error);
    toast.error("Impossible de mettre à jour le membre");
    return null;
  }
};

// Supprimer un membre
export const deleteTeamMember = async (memberId: string): Promise<boolean> => {
  try {
    const members = await getAllTeamMembers();
    const filteredMembers = members.filter(m => m.id !== memberId);
    
    if (members.length === filteredMembers.length) {
      toast.error('Membre non trouvé');
      return false;
    }
    
    localStorage.setItem('teamMembersData', JSON.stringify(filteredMembers));
    toast.success('Membre supprimé avec succès');
    
    return true;
  } catch (error) {
    console.error("Erreur:", error);
    toast.error("Impossible de supprimer le membre");
    return false;
  }
};

// Récupérer les noms de projets à partir des IDs de projets
export const getProjectNamesFromIds = async (projectIds: string[]): Promise<string[]> => {
  if (!projectIds || projectIds.length === 0) return [];
  
  try {
    const projectNames = [];
    
    // Import dynamique pour éviter les dépendances circulaires
    const { getProjectById } = await import("@/services/projectService");
    
    for (const projectId of projectIds) {
      const project = await getProjectById(projectId);
      if (project) {
        projectNames.push(project.name);
      }
    }
    return projectNames;
  } catch (error) {
    console.error("Erreur lors de la récupération des noms de projets:", error);
    return [];
  }
};

// Ajouter des fonctions exportées de la nouvelle API
export {
  assignMemberToProject as addProjectToMember,
  removeMemberFromProject as removeProjectFromMember 
} from "./teamProjectRelationService";
