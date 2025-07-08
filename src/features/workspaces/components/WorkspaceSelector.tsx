import React, { useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Workspace, WorkspaceMemberRole } from '../types/workspace';
import { Button } from '@/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
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
import { Badge } from '@/ui/badge';
import { Plus, Settings, Users, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export const WorkspaceSelector: React.FC = () => {
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    createWorkspace,
    isLoading,
    currentMember,
  } = useWorkspace();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2">
        <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentWorkspace?.logoUrl} alt={currentWorkspace?.name} />
              <AvatarFallback>
                <Building2 className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{currentWorkspace?.name || 'Sélectionner un workspace'}</span>
              {currentMember && (
                <Badge variant="secondary" className="text-xs">
                  {getRoleLabel(currentMember.role)}
                </Badge>
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => setCurrentWorkspace(workspace)}
              className="flex items-center space-x-3 p-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={workspace.logoUrl} alt={workspace.name} />
                <AvatarFallback>
                  <Building2 className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-medium">{workspace.name}</span>
                {workspace.description && (
                  <span className="text-xs text-muted-foreground truncate">
                    {workspace.description}
                  </span>
                )}
                {workspace.members && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {workspace.members.length} membre{workspace.members.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
              {currentWorkspace?.id === workspace.id && (
                <div className="h-2 w-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un workspace
              </DropdownMenuItem>
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
        </DropdownMenuContent>
      </DropdownMenu>
      
      {currentWorkspace && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Paramètres du workspace
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              Gérer les membres
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}; 