import React from 'react';
import { TeamMember } from "@/types/team";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, MoreHorizontal } from "lucide-react"; // Ajout d'icônes
import {
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"; // Ajout de DropdownMenu

// Fonction pour obtenir les initiales
const getInitials = (name: string | undefined): string => {
  if (!name) return "??";
  
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

interface TeamMemberDisplayProps {
  members: TeamMember[];
  isLoading: boolean;
  viewMode: "grid" | "list";
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
}

export const TeamMemberDisplay: React.FC<TeamMemberDisplayProps> = ({
  members,
  isLoading,
  viewMode,
  onEdit,
  onDelete
}) => {
  if (isLoading) {
    return <div className="text-center py-8">Chargement des membres...</div>;
  }

  if (!members || members.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg">
        <p className="text-lg mb-2">Aucun membre trouvé</p>
        <p className="text-sm text-gray-500">Ajoutez des membres à votre équipe pour les voir ici</p>
      </div>
    );
  }

  // Vue liste
  if (viewMode === "list") {
    return (
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left py-3 px-4 font-medium">Nom</th>
              <th className="text-left py-3 px-4 font-medium">Email</th>
              <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Rôle</th>
              <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Statut</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {member.avatar ? (
                        <AvatarImage src={member.avatar} alt={member.name || "Membre"} />
                      ) : null}
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      {member.activity && (
                        <p className="text-xs text-muted-foreground">{member.activity}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">{member.email}</td>
                <td className="py-3 px-4 hidden md:table-cell capitalize">{member.role}</td>
                <td className="py-3 px-4 hidden lg:table-cell">
                  <Badge 
                    variant={member.status === "active" ? "default" : "secondary"}
                    className={`${
                      member.status === "active" 
                        ? "bg-green-100 text-green-800 hover:bg-green-100" 
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {member.status === "active" ? "Actif" : "Inactif"}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  {/* Remplacer les boutons par des icônes */}
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEdit(member)}
                      className="h-8 w-8 text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDelete(member)}
                      className="h-8 w-8 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Vue grille
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member) => (
        <div key={member.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {member.avatar ? (
                  <AvatarImage src={member.avatar} alt={member.name || "Membre"} />
                ) : null}
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.email}</p>
                <p className="text-sm capitalize">{member.role}</p>
                {member.activity && (
                  <p className="text-xs text-muted-foreground mt-1">{member.activity}</p>
                )}
              </div>
            </div>
            
            {/* Menu déroulant d'actions avec icônes */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(member)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(member)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
};