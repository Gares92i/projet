import { createApiClient } from '@/features/common/services/apiClient';
import {
  Workspace,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  InviteMemberDto,
  UpdateMemberRoleDto,
  WorkspaceMember,
  WorkspaceInvitation,
} from '../types/workspace';

const api = createApiClient();

export const workspaceService = {
  // Récupérer tous les workspaces de l'utilisateur
  getAllWorkspaces: async (): Promise<Workspace[]> => {
    try {
      const response = await api.get<Workspace[]>('/workspaces');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des workspaces:', error);
      throw error;
    }
  },

  // Récupérer un workspace par ID
  getWorkspaceById: async (id: string): Promise<Workspace> => {
    try {
      const response = await api.get<Workspace>(`/workspaces/${id}`);
      return response;
    } catch (error) {
      console.error(`Erreur lors de la récupération du workspace ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouveau workspace
  createWorkspace: async (workspace: CreateWorkspaceDto): Promise<Workspace> => {
    try {
      const response = await api.post<Workspace>('/workspaces', workspace);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création du workspace:', error);
      throw error;
    }
  },

  // Mettre à jour un workspace
  updateWorkspace: async (id: string, updates: UpdateWorkspaceDto): Promise<Workspace> => {
    try {
      const response = await api.patch<Workspace>(`/workspaces/${id}`, updates);
      return response;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du workspace ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un workspace
  deleteWorkspace: async (id: string): Promise<void> => {
    try {
      await api.delete(`/workspaces/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du workspace ${id}:`, error);
      throw error;
    }
  },

  // Inviter un membre
  inviteMember: async (workspaceId: string, invitation: InviteMemberDto): Promise<WorkspaceInvitation> => {
    try {
      const response = await api.post<WorkspaceInvitation>(`/workspaces/${workspaceId}/invite`, invitation);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'invitation du membre:', error);
      throw error;
    }
  },

  // Accepter une invitation
  acceptInvitation: async (token: string): Promise<WorkspaceMember> => {
    try {
      const response = await api.post<WorkspaceMember>(`/workspaces/invitations/${token}/accept`);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
      throw error;
    }
  },

  // Mettre à jour le rôle d'un membre
  updateMemberRole: async (workspaceId: string, memberId: string, roleUpdate: UpdateMemberRoleDto): Promise<WorkspaceMember> => {
    try {
      const response = await api.patch<WorkspaceMember>(`/workspaces/${workspaceId}/members/${memberId}/role`, roleUpdate);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      throw error;
    }
  },

  // Retirer un membre
  removeMember: async (workspaceId: string, memberId: string): Promise<void> => {
    try {
      await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
    } catch (error) {
      console.error('Erreur lors du retrait du membre:', error);
      throw error;
    }
  },

  // Quitter un workspace
  leaveWorkspace: async (workspaceId: string): Promise<void> => {
    try {
      await api.post(`/workspaces/${workspaceId}/leave`);
    } catch (error) {
      console.error('Erreur lors du départ du workspace:', error);
      throw error;
    }
  },
}; 