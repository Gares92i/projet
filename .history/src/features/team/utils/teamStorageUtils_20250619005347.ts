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