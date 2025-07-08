import React, { useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Workspace, WorkspaceMemberRole } from '../types/workspace';
import { Button } from '@/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/dialog';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Textarea } from '@/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import { Plus, Settings, Users, Building2, Trash2, UserPlus, Crown, Shield, User, Eye } from 'lucide-react';
import { toast } from 'sonner';

const Workspaces: React.FC = () => {
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    inviteMember,
    updateMemberRole,
    removeMember,
    leaveWorkspace,
    currentMember,
    hasPermission,
    canManageWorkspace,
    canInviteMembers,
    canManageMembers,
  } = useWorkspace();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceMemberRole>(WorkspaceMemberRole.MEMBER);
  const [isCreating, setIsCreating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast.error('Le nom du workspace est requis');
      return;
    }

    try {
      setIsCreating(true);
      await createWorkspace(newWorkspaceName.trim(), newWorkspaceDescription.trim());
      setNewWorkspaceName('');
      setNewWorkspaceDescription('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast.error('L\'email est requis');
      return;
    }

    try {
      setIsInviting(true);
      await inviteMember(inviteEmail.trim(), inviteRole);
      setInviteEmail('');
      setInviteRole(WorkspaceMemberRole.MEMBER);
      setIsInviteDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'invitation:', error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeleteWorkspace = async (workspace: Workspace) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le workspace "${workspace.name}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      await deleteWorkspace(workspace.id);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleLeaveWorkspace = async () => {
    if (!currentWorkspace) return;

    if (!confirm(`Êtes-vous sûr de vouloir quitter le workspace "${currentWorkspace.name}" ?`)) {
      return;
    }

    try {
      await leaveWorkspace();
    } catch (error) {
      console.error('Erreur lors du départ:', error);
    }
  };

  const getRoleIcon = (role: WorkspaceMemberRole) => {
    switch (role) {
      case WorkspaceMemberRole.OWNER:
        return <Crown className="h-4 w-4" />;
      case WorkspaceMemberRole.ADMIN:
        return <Shield className="h-4 w-4" />;
      case WorkspaceMemberRole.MEMBER:
        return <User className="h-4 w-4" />;
      case WorkspaceMemberRole.VIEWER:
        return <Eye className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: WorkspaceMemberRole) => {
    switch (role) {
      case WorkspaceMemberRole.OWNER:
        return 'Propriétaire';
      case WorkspaceMemberRole.ADMIN:
        return 'Administrateur';
      case WorkspaceMemberRole.MEMBER:
        return 'Membre';
      case WorkspaceMemberRole.VIEWER:
        return 'Lecteur';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: WorkspaceMemberRole) => {
    switch (role) {
      case WorkspaceMemberRole.OWNER:
        return 'bg-red-100 text-red-800';
      case WorkspaceMemberRole.ADMIN:
        return 'bg-orange-100 text-orange-800';
      case WorkspaceMemberRole.MEMBER:
        return 'bg-blue-100 text-blue-800';
      case WorkspaceMemberRole.VIEWER:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workspaces</h1>
          <p className="text-muted-foreground">
            Gérez vos espaces de travail et vos équipes
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau workspace
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau workspace</DialogTitle>
              <DialogDescription>
                Un workspace vous permet de collaborer avec votre équipe sur vos projets.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="workspace-name">Nom du workspace</Label>
                <Input
                  id="workspace-name"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Mon workspace"
                  maxLength={50}
                />
              </div>
              
              <div>
                <Label htmlFor="workspace-description">Description (optionnel)</Label>
                <Textarea
                  id="workspace-description"
                  value={newWorkspaceDescription}
                  onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                  placeholder="Description de votre workspace..."
                  maxLength={200}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreating}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateWorkspace}
                disabled={isCreating || !newWorkspaceName.trim()}
              >
                {isCreating ? 'Création...' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((workspace) => (
          <Card key={workspace.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={workspace.logoUrl} alt={workspace.name} />
                    <AvatarFallback>
                      <Building2 className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{workspace.name}</CardTitle>
                    <CardDescription>
                      {workspace.description || 'Aucune description'}
                    </CardDescription>
                  </div>
                </div>
                
                {currentWorkspace?.id === workspace.id && (
                  <Badge variant="secondary">Actuel</Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Statistiques */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{workspace.members?.length || 0} membre{workspace.members?.length !== 1 ? 's' : ''}</span>
                  </div>
                  <Badge variant="outline" className={getRoleBadgeColor(currentMember?.role || WorkspaceMemberRole.VIEWER)}>
                    {getRoleLabel(currentMember?.role || WorkspaceMemberRole.VIEWER)}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWorkspace(workspace)}
                    className="flex-1"
                  >
                    Ouvrir
                  </Button>
                  
                  {canManageWorkspace() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSettingsDialogOpen(true)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {currentMember?.role === WorkspaceMemberRole.OWNER ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteWorkspace(workspace)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLeaveWorkspace}
                      className="text-destructive hover:text-destructive"
                    >
                      Quitter
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog d'invitation */}
      {currentWorkspace && canInviteMembers() && (
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Inviter un membre
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Inviter un membre</DialogTitle>
              <DialogDescription>
                Invitez quelqu'un à rejoindre votre workspace.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="collegue@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="invite-role">Rôle</Label>
                <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as WorkspaceMemberRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={WorkspaceMemberRole.MEMBER}>
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(WorkspaceMemberRole.MEMBER)}
                        <span>Membre</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={WorkspaceMemberRole.VIEWER}>
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(WorkspaceMemberRole.VIEWER)}
                        <span>Lecteur</span>
                      </div>
                    </SelectItem>
                    {currentMember?.role === WorkspaceMemberRole.OWNER && (
                      <SelectItem value={WorkspaceMemberRole.ADMIN}>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(WorkspaceMemberRole.ADMIN)}
                          <span>Administrateur</span>
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsInviteDialogOpen(false)}
                disabled={isInviting}
              >
                Annuler
              </Button>
              <Button
                onClick={handleInviteMember}
                disabled={isInviting || !inviteEmail.trim()}
              >
                {isInviting ? 'Envoi...' : 'Inviter'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Membres du workspace actuel */}
      {currentWorkspace && (
        <Card>
          <CardHeader>
            <CardTitle>Membres du workspace</CardTitle>
            <CardDescription>
              Gérez les membres de votre équipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentWorkspace.members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={member.user?.profileImageUrl} alt={member.user?.firstName} />
                      <AvatarFallback>
                        {member.user?.firstName?.charAt(0) || member.user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.user?.firstName} {member.user?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.user?.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getRoleBadgeColor(member.role)}>
                      <div className="flex items-center space-x-1">
                        {getRoleIcon(member.role)}
                        <span>{getRoleLabel(member.role)}</span>
                      </div>
                    </Badge>
                    
                    {canManageMembers() && member.userId !== currentMember?.userId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMember(member.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Workspaces; 