import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember, LegacyTeamMember } from "@/types/team";
import { loadTeamMembersFromStorage, saveTeamMembersToStorage } from "@/services/team/teamStorageUtils";

// Fonction de récupération de projet temporaire
const getProjectById = async (id: string) => {
  try {
    // D'abord essayer de récupérer depuis l'API
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      return data;
    }
    
    // Fallback: chercher dans localStorage
    try {
      const savedProjects = localStorage.getItem('projectsData');
      if (savedProjects) {
        const projects = JSON.parse(savedProjects);
        return projects.find(p => p.id === id) || null;
      }
    } catch (localError) {
      console.error("Erreur lors de la récupération du projet depuis localStorage:", localError);
    }

    return null;
  } catch (error) {
    console.error(`Erreur lors de la récupération du projet ${id}:`, error);
    return null;
  }
};

// Initialize team members data
const teamMembersData: LegacyTeamMember[] = loadTeamMembersFromStorage();

// Get project names from IDs
export const getProjectNamesFromIds = async (projectIds: string[]): Promise<string[]> => {
  if (!projectIds || projectIds.length === 0) return [];

  try {
    const projectNames = [];
    for (const projectId of projectIds) {
      try {
        const project = await getProjectById(projectId);
        if (project) {
          projectNames.push(project.name);
        }
      } catch (error) {
        console.error(`Error retrieving project ${projectId}:`, error);
        // Continue with other projects even if one fails
      }
    }
    return projectNames;
  } catch (error) {
    console.error("Error retrieving project names:", error);
    toast.error("Impossible de récupérer les noms des projets");
    return [];
  }
};

/**
 * Ajoute un projet à un membre d'équipe
 */
export const addProjectToMember = async (memberId: string, projectId: string): Promise<boolean> => {
  try {
    // D'abord, vérifier si le membre existe
    const members = loadTeamMembersFromStorage();
    const memberIndex = members.findIndex(m => m.id === memberId);
    
    if (memberIndex === -1) {
      console.warn(`Membre avec l'ID ${memberId} non trouvé`);
      return false;
    }
    
    // Vérifier si le projet existe déjà dans la liste des projets du membre
    if (!members[memberIndex].projects) {
      members[memberIndex].projects = [];
    }
    
    if (members[memberIndex].projects!.includes(projectId)) {
      // Le projet est déjà associé au membre
      return true;
    }
    
    // Ajouter le projet au membre
    members[memberIndex].projects!.push(projectId);
    
    // Sauvegarder les modifications
    saveTeamMembersToStorage(members);
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'ajout du projet ${projectId} au membre ${memberId}:`, error);
    return false;
  }
};

/**
 * Retire un projet d'un membre d'équipe
 */
export const removeProjectFromMember = async (memberId: string, projectId: string): Promise<boolean> => {
  try {
    // D'abord, vérifier si le membre existe
    const members = loadTeamMembersFromStorage();
    const memberIndex = members.findIndex(m => m.id === memberId);
    
    if (memberIndex === -1 || !members[memberIndex].projects) {
      console.warn(`Membre avec l'ID ${memberId} non trouvé ou pas de projets`);
      return false;
    }
    
    // Vérifier si le projet existe dans la liste des projets du membre
    const projectIndex = members[memberIndex].projects!.indexOf(projectId);
    
    if (projectIndex === -1) {
      // Le projet n'est pas associé au membre
      return true;
    }
    
    // Supprimer le projet du membre
    members[memberIndex].projects!.splice(projectIndex, 1);
    
    // Sauvegarder les modifications
    saveTeamMembersToStorage(members);
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression du projet ${projectId} du membre ${memberId}:`, error);
    return false;
  }
};

/**
 * Récupère tous les projets d'un membre
 */
export const getMemberProjects = async (memberId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('project_team_members')
      .select('project_id')
      .eq('team_member_id', memberId);

    if (error) {
      console.error("Erreur lors de la récupération des projets du membre:", error);
      return [];
    }

    return data.map(item => item.project_id);
  } catch (error) {
    console.error("Erreur lors de la récupération des projets du membre:", error);
    return [];
  }
};

/**
 * Récupère tous les membres d'un projet
 */
export const getProjectMembers = async (projectId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('project_team_members')
      .select('team_member_id')
      .eq('project_id', projectId);

    if (error) {
      console.error("Erreur lors de la récupération des membres du projet:", error);
      return [];
    }

    return data.map(item => item.team_member_id);
  } catch (error) {
    console.error("Erreur lors de la récupération des membres du projet:", error);
    return [];
  }
};

// Export de la fonction pour utilisation dans d'autres modules
export { getProjectById };
