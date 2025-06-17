import { toast } from 'sonner';
import type { ProjectCardProps } from '@/components/ProjectCard';
import { TeamMember, TeamMemberRole, TeamMemberStatus } from '@/types/team';

// Fonction utilitaire pour normaliser les ID de membres
function normalizeTeamMemberIds(members: any[] | string[] | undefined): string[] {
  if (!members || members.length === 0) return [];

  // Convertir les objets en IDs si nécessaire
  return members.map(member => {
    if (typeof member === 'string') return member;
    if (typeof member === 'object' && member.id) return member.id;
    return '';
  }).filter(id => id !== '');
}

// Récupérer les projets d'un membre
export const getMemberProjects = async (memberId: string): Promise<ProjectCardProps[]> => {
  try {
    // Récupérer tous les projets depuis le localStorage
    const storedProjects = localStorage.getItem('projectsData');
    const allProjects: ProjectCardProps[] = storedProjects ? JSON.parse(storedProjects) : [];
    
    // Filtrer les projets où ce membre est assigné
    return allProjects.filter(project => {
      const memberIds = normalizeTeamMemberIds(project.teamMembers);
      return memberIds.includes(memberId);
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des projets du membre:', error);
    return [];
  }
};

// Assigner un membre à un projet
export const assignMemberToProject = async (memberId: string, projectId: string): Promise<boolean> => {
  try {
    // Récupérer les projets
    const storedProjects = localStorage.getItem('projectsData');
    const projects: ProjectCardProps[] = storedProjects ? JSON.parse(storedProjects) : [];
    
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      toast.error('Projet non trouvé');
      return false;
    }
    
    // Vérifier si le membre est déjà assigné
    const project = projects[projectIndex];
    // S'assurer que teamMembers est un tableau de chaînes
    const teamMembers: string[] = normalizeTeamMemberIds(project.teamMembers);

    if (teamMembers.includes(memberId)) {
      // Déjà assigné
      return true;
    }

    // Ajouter le membre au projet
    projects[projectIndex] = {
      ...project,
      teamMembers: [...teamMembers, memberId], // Stocker uniquement l'ID
      teamSize: (teamMembers.length + 1)
    };

    // Sauvegarder
    localStorage.setItem('projectsData', JSON.stringify(projects));
    toast.success('Membre assigné au projet avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'assignation:', error);
    toast.error('Une erreur est survenue');
    return false;
  }
};

// Retirer un membre d'un projet
export const removeMemberFromProject = async (memberId: string, projectId: string): Promise<boolean> => {
  try {
    const storedProjects = localStorage.getItem('projectsData');
    const projects: ProjectCardProps[] = storedProjects ? JSON.parse(storedProjects) : [];
    
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      toast.error('Projet non trouvé');
      return false;
    }
    
    const project = projects[projectIndex];
    // S'assurer que teamMembers est un tableau de chaînes
    const teamMembers: string[] = normalizeTeamMemberIds(project.teamMembers);

    if (!teamMembers.includes(memberId)) {
      // Membre non assigné
      return true;
    }

    // Retirer le membre
    const updatedMembers = teamMembers.filter(id => id !== memberId);
    projects[projectIndex] = {
      ...project,
      teamMembers: updatedMembers,
      teamSize: updatedMembers.length
    };

    // Sauvegarder
    localStorage.setItem('projectsData', JSON.stringify(projects));
    toast.success('Membre retiré du projet avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors du retrait:', error);
    toast.error('Une erreur est survenue');
    return false;
  }
};

// Récupérer les membres d'un projet
export const getProjectMembers = async (projectId: string): Promise<TeamMember[]> => {
  try {
    // Récupérer le projet
    const storedProjects = localStorage.getItem('projectsData');
    const allProjects = storedProjects ? JSON.parse(storedProjects) : [];
    
    const project = allProjects.find((p: { id: string }) => p.id === projectId);
    if (!project) return [];
    
    // S'assurer que teamMembers est un tableau de chaînes
    const memberIds: string[] = normalizeTeamMemberIds(project.teamMembers);
    if (memberIds.length === 0) return [];
    
    // Récupérer tous les membres
    const storedMembers = localStorage.getItem('teamMembersData');
    const allMembers = storedMembers ? JSON.parse(storedMembers) : [];
    
    // Filtrer et normaliser les membres
    return allMembers
   .filter((member: StoredTeamMember) => memberIds.includes(member.id || ''))
   .map((member: StoredTeamMember) => ({
        id: member.id || "",
        name: member.name || "Sans nom", 
        email: member.email || "",
        phone: member.phone || "",
        role: (member.role as TeamMemberRole) || "autre",  // Cast explicite vers TeamMemberRole
        status: (member.status as TeamMemberStatus) || "active", // Cast explicite vers TeamMemberStatus
        avatar: member.avatar || "",
        team_id: member.team_id || "default",
        user_id: member.user_id || "anonymous",
        activity: member.activity || "",
        projects: member.projects || []
      }));
  } catch (error) {
    console.error('Erreur lors de la récupération des membres du projet:', error);
    return [];
  }
};