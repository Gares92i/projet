import { createApiClient } from "@/services/apiClient";
import { TeamMember } from "@/types";

/**
 * Récupère les membres d'équipe associés à un projet spécifique
 * @param projectId Identifiant du projet
 * @returns Liste des membres d'équipe associés au projet
 */
export const getProjectMembers = async (projectId: string): Promise<TeamMember[]> => {
  try {
    const api = createApiClient();
    const members = await api.get<TeamMember[]>(`/projects/${projectId}/team`);
    return members;
  } catch (error) {
    console.error(`Erreur lors de la récupération des membres de l'équipe pour le projet ${projectId}:`, error);
    
    // Fallback: chercher dans tous les membres ceux qui ont ce projet
    try {
      // Récupérer les données depuis le localStorage si disponible
      const storedMembers = localStorage.getItem('team_members');
      if (storedMembers) {
        const allMembers: TeamMember[] = JSON.parse(storedMembers);
        
        // Filtrer les membres qui ont ce projet dans leur liste de projets
        return allMembers.filter(member => 
          member.projects && member.projects.includes(projectId)
        );
      }
    } catch (fallbackError) {
      console.error('Erreur lors du fallback localStorage:', fallbackError);
    }
    
    return [];
  }
};

/**
 * Ajoute un membre d'équipe à un projet
 * @param projectId Identifiant du projet
 * @param memberId Identifiant du membre à ajouter
 */
export const addMemberToProject = async (projectId: string, memberId: string): Promise<boolean> => {
  try {
    const api = createApiClient();
    await api.post(`/projects/${projectId}/team`, { memberId });
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'ajout du membre ${memberId} au projet ${projectId}:`, error);
    
    // Fallback: modification locale
    try {
      const storedMembers = localStorage.getItem('team_members');
      if (storedMembers) {
        const allMembers: TeamMember[] = JSON.parse(storedMembers);
        
        // Trouver le membre et ajouter le projet à sa liste
        const memberIndex = allMembers.findIndex(m => m.id === memberId);
        if (memberIndex !== -1) {
          if (!allMembers[memberIndex].projects) {
            allMembers[memberIndex].projects = [];
          }
          
          if (!allMembers[memberIndex].projects!.includes(projectId)) {
            allMembers[memberIndex].projects!.push(projectId);
            localStorage.setItem('team_members', JSON.stringify(allMembers));
          }
          
          return true;
        }
      }
    } catch (fallbackError) {
      console.error('Erreur lors du fallback localStorage:', fallbackError);
    }
    
    return false;
  }
};

/**
 * Supprime un membre d'équipe d'un projet
 * @param projectId Identifiant du projet
 * @param memberId Identifiant du membre à supprimer
 */
export const removeMemberFromProject = async (projectId: string, memberId: string): Promise<boolean> => {
  try {
    const api = createApiClient();
    await api.delete(`/projects/${projectId}/team/${memberId}`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression du membre ${memberId} du projet ${projectId}:`, error);
    
    // Fallback: modification locale
    try {
      const storedMembers = localStorage.getItem('team_members');
      if (storedMembers) {
        const allMembers: TeamMember[] = JSON.parse(storedMembers);
        
        // Trouver le membre et retirer le projet de sa liste
        const memberIndex = allMembers.findIndex(m => m.id === memberId);
        if (memberIndex !== -1 && allMembers[memberIndex].projects) {
          allMembers[memberIndex].projects = allMembers[memberIndex].projects!.filter(p => p !== projectId);
          localStorage.setItem('team_members', JSON.stringify(allMembers));
          return true;
        }
      }
    } catch (fallbackError) {
      console.error('Erreur lors du fallback localStorage:', fallbackError);
    }
    
    return false;
  }
};