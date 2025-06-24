import { useAuth } from "@/features/auth/contexts/AuthContext";
// import { useProfile } from "@/features/profile/hooks/useProfile";
import { useRoles } from "@/features/team/hooks/useRoles";
// import { useSubscription } from "@/features/subscription/hooks/useSubscription";
import { Button } from "@/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { CreditCard, LogOut, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/ui/badge";

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  // const { profile, getUserFullName, getInitials } = useProfile();
  const { roles, getPrimaryRole } = useRoles();

  // Générer le nom complet à partir de user
  const getUserFullName = () => {
    if (!user) return "Utilisateur inconnu";
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    if (user.username) return user.username;
    if (user.email) return user.email.split("@")[0];
    return "Utilisateur";
  };

  // Générer les initiales à partir du nom ou de l'email
  const getInitials = () => {
    if (!user) return "?";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) return user.firstName[0].toUpperCase();
    if (user.lastName) return user.lastName[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return "?";
  };

  const getPlanBadgeVariant = () => {
    // Badge fictif pour l'abonnement
    return "secondary";
  };

  const getRoleBadge = () => {
    if (!roles || roles.length === 0) return null;

    const primaryRole = getPrimaryRole();
    if (!primaryRole) return null;

    // Configuration for role badges
    const roleConfig: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      admin: { label: "Admin", variant: "destructive" },
      architect: { label: "Architecte", variant: "default" },
      client: { label: "Client", variant: "secondary" },
      contractor: { label: "Entrepreneur", variant: "outline" },
    };

    const config = roleConfig[primaryRole];
    if (!config) return null;

    return (
      <Badge variant={config.variant} className="ml-2">
        {config.label}
      </Badge>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.avatar || user?.imageUrl || undefined}
              alt={getUserFullName()}
            />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {getUserFullName()}
              {getRoleBadge()}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            {/* Badge d'abonnement fictif */}
            <div className="mt-2">
              <Badge variant={getPlanBadgeVariant()} className="mt-1">
                Plan Basique
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/pricing">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Abonnement</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
