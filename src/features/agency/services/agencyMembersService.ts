import { createApiClient } from "@/features/common/services/apiClient";

export interface AgencyMember {
  id?: string;
  userId: string;
  ownerId?: string;
  role: 'member' | 'admin';
  status: 'pending' | 'active' | 'revoked';
  createdAt?: Date;
  updatedAt?: Date;
  // Informations utilisateur (à récupérer via users_clerk)
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
  };
}

export const agencyMembersService = {
  // Récupérer tous les membres de l'agence
  getAllAgencyMembers: async (): Promise<AgencyMember[]> => {
    const api = createApiClient();
    
    try {
      const response = await api.get('/agency-members');
      return response;
    } catch (error) {
      console.error("Erreur lors de la récupération des membres d'agence:", error);
      
      // Fallback sur localStorage
      const stored = localStorage.getItem("agencyMembersData");
      return stored ? JSON.parse(stored) : [];
    }
  },

  // Récupérer un membre par son ID
  getAgencyMemberById: async (id: string): Promise<AgencyMember | null> => {
    const api = createApiClient();
    
    try {
      const member = await api.get<AgencyMember>(`/agency-members/${id}`);
      return member;
    } catch (error) {
      console.error(`Erreur lors de la récupération du membre ${id}:`, error);
      
      // Fallback sur localStorage
      const stored = localStorage.getItem("agencyMembersData");
      if (!stored) return null;
      
      const members = JSON.parse(stored);
      const member = members.find((m: any) => m.id === id);
      return member || null;
    }
  },

  // Ajouter un nouveau membre
  addAgencyMember: async (member: Omit<AgencyMember, "id">): Promise<AgencyMember> => {
    const api = createApiClient();
    try {
      // Construction dynamique du payload
      const payload: any = {
        userId: member.userId,
        role: member.role,
        status: member.status,
      };
      if (member.ownerId && typeof member.ownerId === 'string' && member.ownerId.length > 0) payload.ownerId = member.ownerId;
      // On n'envoie pas le champ user (objet)
      const newMember = await api.post<AgencyMember>("/agency-members", payload);
      // Sauvegarder en localStorage comme backup
      const stored = localStorage.getItem("agencyMembersData");
      const members = stored ? JSON.parse(stored) : [];
      members.push(newMember);
      localStorage.setItem("agencyMembersData", JSON.stringify(members));
      return newMember;
    } catch (error) {
      console.error("Erreur lors de l'ajout du membre:", error);
      throw error;
    }
  },

  // Mettre à jour un membre existant
  updateAgencyMember: async (id: string, updates: Partial<AgencyMember>): Promise<AgencyMember | null> => {
    const api = createApiClient();
    try {
      // Construction dynamique du payload
      const payload: any = {};
      if (updates.userId && typeof updates.userId === 'string' && updates.userId.length > 0) payload.userId = updates.userId;
      if (updates.role) payload.role = updates.role;
      if (updates.status) payload.status = updates.status;
      if (updates.ownerId && typeof updates.ownerId === 'string' && updates.ownerId.length > 0) payload.ownerId = updates.ownerId;
      // On n'envoie pas le champ user (objet)
      const updatedMember = await api.put<AgencyMember>(`/agency-members/${id}`, payload);
      
      // Mettre à jour le localStorage
      const stored = localStorage.getItem("agencyMembersData");
      if (stored) {
        const members = JSON.parse(stored);
        const index = members.findIndex((m: any) => m.id === id);
        if (index !== -1) {
          members[index] = { ...members[index], ...updatedMember };
          localStorage.setItem("agencyMembersData", JSON.stringify(members));
        }
      }
      
      return updatedMember;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du membre ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un membre
  deleteAgencyMember: async (id: string): Promise<boolean> => {
    const api = createApiClient();
    
    try {
      await api.delete(`/agency-members/${id}`);
      
      // Supprimer du localStorage
      const stored = localStorage.getItem("agencyMembersData");
      if (stored) {
        const members = JSON.parse(stored);
        const newMembers = members.filter((m: any) => m.id !== id);
        localStorage.setItem("agencyMembersData", JSON.stringify(newMembers));
      }
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du membre ${id}:`, error);
      throw error;
    }
  }
};

// Exporter les fonctions individuelles pour la compatibilité
export const getAllAgencyMembers = agencyMembersService.getAllAgencyMembers;
export const getAgencyMemberById = agencyMembersService.getAgencyMemberById;
export const addAgencyMember = agencyMembersService.addAgencyMember;
export const updateAgencyMember = agencyMembersService.updateAgencyMember;
export const deleteAgencyMember = agencyMembersService.deleteAgencyMember; 