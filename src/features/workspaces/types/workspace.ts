export enum WorkspaceSubscriptionPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export enum WorkspaceSubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled'
}

export enum WorkspaceMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

export enum WorkspaceMemberStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DECLINED = 'declined'
}

export enum WorkspaceInvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  slug: string;
  logoUrl?: string;
  settings: Record<string, any>;
  subscriptionPlan: WorkspaceSubscriptionPlan;
  subscriptionStatus: WorkspaceSubscriptionStatus;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  members?: WorkspaceMember[];
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceMemberRole;
  permissions: Record<string, any>;
  invitedBy?: string;
  invitedAt?: string;
  acceptedAt?: string;
  status: WorkspaceMemberStatus;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profileImageUrl?: string;
  };
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceMemberRole;
  invitedBy: string;
  token: string;
  expiresAt: string;
  status: WorkspaceInvitationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceDto {
  name: string;
  description?: string;
  logoUrl?: string;
  subscriptionPlan?: WorkspaceSubscriptionPlan;
}

export interface UpdateWorkspaceDto {
  name?: string;
  description?: string;
  logoUrl?: string;
  subscriptionPlan?: WorkspaceSubscriptionPlan;
}

export interface InviteMemberDto {
  email: string;
  role?: WorkspaceMemberRole;
}

export interface UpdateMemberRoleDto {
  role: WorkspaceMemberRole;
}

// Types pour les permissions
export interface WorkspacePermissions {
  canViewProjects: boolean;
  canCreateProjects: boolean;
  canEditProjects: boolean;
  canDeleteProjects: boolean;
  canViewClients: boolean;
  canCreateClients: boolean;
  canEditClients: boolean;
  canDeleteClients: boolean;
  canViewTeam: boolean;
  canInviteMembers: boolean;
  canManageMembers: boolean;
  canViewReports: boolean;
  canCreateReports: boolean;
  canEditReports: boolean;
  canDeleteReports: boolean;
  canViewDocuments: boolean;
  canUploadDocuments: boolean;
  canDeleteDocuments: boolean;
  canManageWorkspace: boolean;
}

// Fonction utilitaire pour obtenir les permissions selon le rôle
export function getWorkspacePermissions(role: WorkspaceMemberRole): WorkspacePermissions {
  switch (role) {
    case WorkspaceMemberRole.OWNER:
      return {
        canViewProjects: true,
        canCreateProjects: true,
        canEditProjects: true,
        canDeleteProjects: true,
        canViewClients: true,
        canCreateClients: true,
        canEditClients: true,
        canDeleteClients: true,
        canViewTeam: true,
        canInviteMembers: true,
        canManageMembers: true,
        canViewReports: true,
        canCreateReports: true,
        canEditReports: true,
        canDeleteReports: true,
        canViewDocuments: true,
        canUploadDocuments: true,
        canDeleteDocuments: true,
        canManageWorkspace: true,
      };
    case WorkspaceMemberRole.ADMIN:
      return {
        canViewProjects: true,
        canCreateProjects: true,
        canEditProjects: true,
        canDeleteProjects: true,
        canViewClients: true,
        canCreateClients: true,
        canEditClients: true,
        canDeleteClients: true,
        canViewTeam: true,
        canInviteMembers: true,
        canManageMembers: true,
        canViewReports: true,
        canCreateReports: true,
        canEditReports: true,
        canDeleteReports: true,
        canViewDocuments: true,
        canUploadDocuments: true,
        canDeleteDocuments: true,
        canManageWorkspace: false,
      };
    case WorkspaceMemberRole.MEMBER:
      return {
        canViewProjects: true,
        canCreateProjects: true,
        canEditProjects: true,
        canDeleteProjects: false,
        canViewClients: true,
        canCreateClients: true,
        canEditClients: true,
        canDeleteClients: false,
        canViewTeam: true,
        canInviteMembers: false,
        canManageMembers: false,
        canViewReports: true,
        canCreateReports: true,
        canEditReports: true,
        canDeleteReports: false,
        canViewDocuments: true,
        canUploadDocuments: true,
        canDeleteDocuments: false,
        canManageWorkspace: false,
      };
    case WorkspaceMemberRole.VIEWER:
      return {
        canViewProjects: true,
        canCreateProjects: false,
        canEditProjects: false,
        canDeleteProjects: false,
        canViewClients: true,
        canCreateClients: false,
        canEditClients: false,
        canDeleteClients: false,
        canViewTeam: true,
        canInviteMembers: false,
        canManageMembers: false,
        canViewReports: true,
        canCreateReports: false,
        canEditReports: false,
        canDeleteReports: false,
        canViewDocuments: true,
        canUploadDocuments: false,
        canDeleteDocuments: false,
        canManageWorkspace: false,
      };
    default:
      return {
        canViewProjects: false,
        canCreateProjects: false,
        canEditProjects: false,
        canDeleteProjects: false,
        canViewClients: false,
        canCreateClients: false,
        canEditClients: false,
        canDeleteClients: false,
        canViewTeam: false,
        canInviteMembers: false,
        canManageMembers: false,
        canViewReports: false,
        canCreateReports: false,
        canEditReports: false,
        canDeleteReports: false,
        canViewDocuments: false,
        canUploadDocuments: false,
        canDeleteDocuments: false,
        canManageWorkspace: false,
      };
  }
} 