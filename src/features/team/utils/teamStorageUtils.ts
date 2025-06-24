import { TeamMember } from '@/features/team/types/team';

/**
 * Sauvegarde les membres d'équipe dans le localStorage
 */
export function saveTeamMembers(teamId: string, members: TeamMember[]): void {
  localStorage.setItem(`team-${teamId}-members`, JSON.stringify(members));
}

/**
 * Récupère les membres d'équipe depuis le localStorage
 */
export function getTeamMembers(teamId: string): TeamMember[] {
  const stored = localStorage.getItem(`team-${teamId}-members`);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Ajoute un membre à l'équipe
 */
export function addTeamMember(teamId: string, member: TeamMember): TeamMember {
  const members = getTeamMembers(teamId);
  
  // Générer un ID si non fourni
  if (!member.id) {
    member.id = `member-${Date.now()}`;
  }
  
  // Ajouter le membre
  members.push(member);
  
  // Sauvegarder
  saveTeamMembers(teamId, members);
  
  return member;
}

/**
 * Met à jour un membre de l'équipe
 */
export function updateTeamMember(teamId: string, memberId: string, updates: Partial<TeamMember>): TeamMember | null {
  const members = getTeamMembers(teamId);
  const index = members.findIndex(m => m.id === memberId);
  
  if (index === -1) {
    return null;
  }
  
  // Mettre à jour le membre
  members[index] = { ...members[index], ...updates };
  
  // Sauvegarder
  saveTeamMembers(teamId, members);
  
  return members[index];
}

/**
 * Supprime un membre de l'équipe
 */
export function removeTeamMember(teamId: string, memberId: string): boolean {
  const members = getTeamMembers(teamId);
  const index = members.findIndex(m => m.id === memberId);
  
  if (index === -1) {
    return false;
  }
  
  // Supprimer le membre
  members.splice(index, 1);
  
  // Sauvegarder
  saveTeamMembers(teamId, members);
  
  return true;
}

// Interface pour les données brutes de localStorage
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

// Charger les membres d'équipe depuis le localStorage
export const loadTeamMembersFromStorage = (): StoredTeamMember[] => {
  try {
    const stored = localStorage.getItem('teamMembersData');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Erreur lors du chargement des membres d'équipe:", error);
    return [];
  }
};

// Sauvegarder les membres d'équipe dans le localStorage
export const saveTeamMembersToStorage = (members: StoredTeamMember[]): void => {
  try {
    localStorage.setItem('teamMembersData', JSON.stringify(members));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des membres d'équipe:", error);
  }
};

// Obtenir les membres d'équipe par défaut
export const getDefaultTeamMembers = (): StoredTeamMember[] => {
  return [
    {
      id: 'default_1',
      name: 'Architecte Principal',
      email: 'architecte@example.com',
      role: 'architecte',
      status: 'active',
      team_id: 'default',
      user_id: 'architecte_1',
      avatar: '',
      phone: '',
      activity: 'Disponible',
      projects: []
    },
    {
      id: 'default_2',
      name: 'Ingénieur Structure',
      email: 'ingenieur@example.com',
      role: 'ingenieur',
      status: 'active',
      team_id: 'default',
      user_id: 'ingenieur_1',
      avatar: '',
      phone: '',
      activity: 'Disponible',
      projects: []
    }
  ];
};