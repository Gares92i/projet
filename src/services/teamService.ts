import { TeamMember } from "@/types/team";
import { createApiClient } from "./apiClient";

// Fonction utilitaire pour normaliser les données de membre d'équipe
export function normalizeTeamMember(member: any): TeamMember {
  return {
    id: member.id || `temp-${Date.now()}`,
    name: member.name || '',
    role: member.role || 'autre',
    email: member.email || '',
    phone: member.phone || '',
    avatar: member.avatar || '',
    status: member.status || 'active',
    team_id: member.team_id || null,
    user_id: member.user_id || null,
    created_at: member.created_at || new Date().toISOString()
  };
}

// Service pour gérer les membres d'équipe avec l'API Railway
export const teamService = {
  // Récupérer tous les membres d'équipe
  getAllTeamMembers: async (): Promise<TeamMember[]> => {
    const api = createApiClient();
    
    try {
      const members = await api.get<TeamMember[]>("/team-members");
      return members.map(normalizeTeamMember);
    } catch (error) {
      console.error("Erreur lors de la récupération des membres:", error);
      
      // Fallback sur localStorage
      const stored = localStorage.getItem("teamMembersData");
      const members = stored ? JSON.parse(stored) : [];
      return members.map(normalizeTeamMember);
    }
  },
  
  // Récupérer un membre par son ID
  getTeamMemberById: async (id: string): Promise<TeamMember | null> => {
    const api = createApiClient();
    
    try {
      const member = await api.get<TeamMember>(`/team-members/${id}`);
      return normalizeTeamMember(member);
    } catch (error) {
      console.error(`Erreur lors de la récupération du membre ${id}:`, error);
      
      // Fallback sur localStorage
      const stored = localStorage.getItem("teamMembersData");
      if (!stored) return null;
      
      const members = JSON.parse(stored);
      const member = members.find((m: any) => m.id === id);
      return member ? normalizeTeamMember(member) : null;
    }
  },
  
  // Ajouter un nouveau membre
  addTeamMember: async (member: Omit<TeamMember, "id">): Promise<TeamMember> => {
    const api = createApiClient();
    
    try {
      const newMember = await api.post<TeamMember>("/team-members", member);
      return normalizeTeamMember(newMember);
    } catch (error) {
      console.error("Erreur lors de l'ajout du membre:", error);
      
      // Fallback: création locale temporaire
      const newMember = {
        ...member,
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      
      // Stocker localement
      const stored = localStorage.getItem("teamMembersData");
      const members = stored ? JSON.parse(stored) : [];
      members.push(newMember);
      localStorage.setItem("teamMembersData", JSON.stringify(members));
      
      return normalizeTeamMember(newMember);
    }
  },
  
  // Mettre à jour un membre existant
  updateTeamMember: async (id: string, updates: Partial<TeamMember>): Promise<TeamMember | null> => {
    const api = createApiClient();
    
    try {
      const updatedMember = await api.put<TeamMember>(`/team-members/${id}`, updates);
      return normalizeTeamMember(updatedMember);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du membre ${id}:`, error);
      
      // Fallback: mise à jour locale
      const stored = localStorage.getItem("teamMembersData");
      if (!stored) return null;
      
      const members = JSON.parse(stored);
      const index = members.findIndex((m: any) => m.id === id);
      
      if (index === -1) return null;
      
      members[index] = {
        ...members[index],
        ...updates
      };
      
      localStorage.setItem("teamMembersData", JSON.stringify(members));
      return normalizeTeamMember(members[index]);
    }
  },
  
  // Supprimer un membre
  deleteTeamMember: async (id: string): Promise<boolean> => {
    const api = createApiClient();
    
    try {
      await api.delete(`/team-members/${id}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du membre ${id}:`, error);
      
      // Fallback: suppression locale
      const stored = localStorage.getItem("teamMembersData");
      if (!stored) return false;
      
      const members = JSON.parse(stored);
      const newMembers = members.filter((m: any) => m.id !== id);
      
      localStorage.setItem("teamMembersData", JSON.stringify(newMembers));
      return true;
    }
  }
};

// Exporter les fonctions individuelles pour la compatibilité avec le code existant
export const getAllTeamMembers = teamService.getAllTeamMembers;
export const getTeamMemberById = teamService.getTeamMemberById;
export const addTeamMember = teamService.addTeamMember;
export const updateTeamMember = teamService.updateTeamMember;
export const deleteTeamMember = teamService.deleteTeamMember;