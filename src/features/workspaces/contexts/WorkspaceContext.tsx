import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { Workspace, WorkspaceMember, WorkspaceMemberRole, getWorkspacePermissions, WorkspacePermissions } from '../types/workspace';
import { workspaceService } from '../services/workspaceService';
import { toast } from 'sonner';

interface WorkspaceContextType {
  // État des workspaces
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentMember: WorkspaceMember | null;
  currentPermissions: WorkspacePermissions;
  isLoading: boolean;
  
  // Actions
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  createWorkspace: (name: string, description?: string) => Promise<Workspace>;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  inviteMember: (email: string, role?: WorkspaceMemberRole) => Promise<void>;
  updateMemberRole: (memberId: string, role: WorkspaceMemberRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  leaveWorkspace: () => Promise<void>;
  acceptInvitation: (token: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  
  // Utilitaires
  hasPermission: (permission: keyof WorkspacePermissions) => boolean;
  canManageWorkspace: () => boolean;
  canInviteMembers: () => boolean;
  canManageMembers: () => boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [currentMember, setCurrentMember] = useState<WorkspaceMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calculer les permissions actuelles
  const currentPermissions = currentMember 
    ? getWorkspacePermissions(currentMember.role)
    : getWorkspacePermissions(WorkspaceMemberRole.VIEWER);

  // Charger les workspaces de l'utilisateur
  const loadWorkspaces = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const userWorkspaces = await workspaceService.getAllWorkspaces();
      setWorkspaces(userWorkspaces);
      
      // Si aucun workspace n'est sélectionné et qu'il y en a au moins un, sélectionner le premier
      if (!currentWorkspace && userWorkspaces.length > 0) {
        setCurrentWorkspace(userWorkspaces[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des workspaces:', error);
      toast.error('Impossible de charger les workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  // Mettre à jour le membre actuel quand le workspace change
  useEffect(() => {
    if (currentWorkspace && user) {
      const member = currentWorkspace.members?.find(m => m.userId === user.id);
      setCurrentMember(member || null);
    } else {
      setCurrentMember(null);
    }
  }, [currentWorkspace, user]);

  // Charger les workspaces au montage et quand l'utilisateur change
  useEffect(() => {
    loadWorkspaces();
  }, [user]);

  // Créer un nouveau workspace
  const createWorkspace = async (name: string, description?: string): Promise<Workspace> => {
    try {
      const newWorkspace = await workspaceService.createWorkspace({ name, description });
      setWorkspaces(prev => [...prev, newWorkspace]);
      setCurrentWorkspace(newWorkspace);
      toast.success('Workspace créé avec succès');
      return newWorkspace;
    } catch (error) {
      toast.error('Erreur lors de la création du workspace');
      throw error;
    }
  };

  // Mettre à jour un workspace
  const updateWorkspace = async (id: string, updates: Partial<Workspace>): Promise<void> => {
    try {
      await workspaceService.updateWorkspace(id, updates);
      setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
      if (currentWorkspace?.id === id) {
        setCurrentWorkspace(prev => prev ? { ...prev, ...updates } : null);
      }
      toast.success('Workspace mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du workspace');
      throw error;
    }
  };

  // Supprimer un workspace
  const deleteWorkspace = async (id: string): Promise<void> => {
    try {
      await workspaceService.deleteWorkspace(id);
      setWorkspaces(prev => prev.filter(w => w.id !== id));
      if (currentWorkspace?.id === id) {
        setCurrentWorkspace(null);
      }
      toast.success('Workspace supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression du workspace');
      throw error;
    }
  };

  // Inviter un membre
  const inviteMember = async (email: string, role: WorkspaceMemberRole = WorkspaceMemberRole.MEMBER): Promise<void> => {
    if (!currentWorkspace) throw new Error('Aucun workspace sélectionné');
    
    try {
      await workspaceService.inviteMember(currentWorkspace.id, { email, role });
      toast.success('Invitation envoyée avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'invitation');
      throw error;
    }
  };

  // Mettre à jour le rôle d'un membre
  const updateMemberRole = async (memberId: string, role: WorkspaceMemberRole): Promise<void> => {
    if (!currentWorkspace) throw new Error('Aucun workspace sélectionné');
    
    try {
      await workspaceService.updateMemberRole(currentWorkspace.id, memberId, { role });
      // Mettre à jour l'état local
      setCurrentWorkspace(prev => {
        if (!prev) return null;
        return {
          ...prev,
          members: prev.members?.map(m => 
            m.id === memberId ? { ...m, role } : m
          ) || []
        };
      });
      toast.success('Rôle mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du rôle');
      throw error;
    }
  };

  // Retirer un membre
  const removeMember = async (memberId: string): Promise<void> => {
    if (!currentWorkspace) throw new Error('Aucun workspace sélectionné');
    
    try {
      await workspaceService.removeMember(currentWorkspace.id, memberId);
      // Mettre à jour l'état local
      setCurrentWorkspace(prev => {
        if (!prev) return null;
        return {
          ...prev,
          members: prev.members?.filter(m => m.id !== memberId) || []
        };
      });
      toast.success('Membre retiré avec succès');
    } catch (error) {
      toast.error('Erreur lors du retrait du membre');
      throw error;
    }
  };

  // Quitter le workspace
  const leaveWorkspace = async (): Promise<void> => {
    if (!currentWorkspace) throw new Error('Aucun workspace sélectionné');
    
    try {
      await workspaceService.leaveWorkspace(currentWorkspace.id);
      setWorkspaces(prev => prev.filter(w => w.id !== currentWorkspace.id));
      setCurrentWorkspace(null);
      toast.success('Workspace quitté avec succès');
    } catch (error) {
      toast.error('Erreur lors du départ du workspace');
      throw error;
    }
  };

  // Accepter une invitation
  const acceptInvitation = async (token: string): Promise<void> => {
    try {
      await workspaceService.acceptInvitation(token);
      await loadWorkspaces(); // Recharger les workspaces
      toast.success('Invitation acceptée avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'acceptation de l\'invitation');
      throw error;
    }
  };

  // Rafraîchir les workspaces
  const refreshWorkspaces = async (): Promise<void> => {
    await loadWorkspaces();
  };

  // Utilitaires pour les permissions
  const hasPermission = (permission: keyof WorkspacePermissions): boolean => {
    return currentPermissions[permission];
  };

  const canManageWorkspace = (): boolean => {
    return hasPermission('canManageWorkspace');
  };

  const canInviteMembers = (): boolean => {
    return hasPermission('canInviteMembers');
  };

  const canManageMembers = (): boolean => {
    return hasPermission('canManageMembers');
  };

  const value: WorkspaceContextType = {
    workspaces,
    currentWorkspace,
    currentMember,
    currentPermissions,
    isLoading,
    setCurrentWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    inviteMember,
    updateMemberRole,
    removeMember,
    leaveWorkspace,
    acceptInvitation,
    refreshWorkspaces,
    hasPermission,
    canManageWorkspace,
    canInviteMembers,
    canManageMembers,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}; 