import { Link, useLocation } from "react-router-dom";
import { cn } from "@lib/utils";
import {
  Building,
  Calendar,
  ClipboardList,
  FileText,
  FolderOpen,
  Home,
  MessagesSquare,
  Settings,
  Users,
  Menu,
  LayoutDashboard
} from "lucide-react";
import { ScrollArea } from "@ui/scroll-area";
import { useAuth } from "@features/auth/services/authService";

interface SidebarProps {
  open?: boolean;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavItem = ({ to, icon, label, active }: NavItemProps) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-800",
      active ? "bg-gray-100 dark:bg-gray-800 text-primary font-medium" : "text-gray-600 dark:text-gray-400"
    )}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default function Sidebar({ open = true }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  if (!open) return null;

  return (
    <div className="hidden md:flex md:w-64 md:flex-col h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex flex-col h-full">
        {/* Logo et titre */}
        <div className="flex h-14 items-center border-b px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-lg">WorkBuilder</span>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            <NavItem
              to="/"
              icon={<Home className="h-5 w-5" />}
              label="Tableau de bord"
              active={location.pathname === "/"}
            />
            <NavItem
              to="/projects"
              icon={<FolderOpen className="h-5 w-5" />}
              label="Projets"
              active={location.pathname.startsWith("/projects")}
            />
            <NavItem
              to="/clients"
              icon={<Building className="h-5 w-5" />}
              label="Clients"
              active={location.pathname.startsWith("/clients")}
            />
            <NavItem
              to="/tasks"
              icon={<ClipboardList className="h-5 w-5" />}
              label="Tâches"
              active={location.pathname.startsWith("/tasks")}
            />
            <NavItem
              to="/calendar"
              icon={<Calendar className="h-5 w-5" />}
              label="Calendrier"
              active={location.pathname.startsWith("/calendar")}
            />
            <NavItem
              to="/documents"
              icon={<FileText className="h-5 w-5" />}
              label="Documents"
              active={location.pathname.startsWith("/documents")}
            />
            <NavItem
              to="/chat"
              icon={<MessagesSquare className="h-5 w-5" />}
              label="Chat"
              active={location.pathname.startsWith("/chat")}
            />
            <NavItem
              to="/team"
              icon={<Users className="h-5 w-5" />}
              label="Équipe"
              active={location.pathname.startsWith("/team")}
            />
            <NavItem
              to="/settings"
              icon={<Settings className="h-5 w-5" />}
              label="Paramètres"
              active={location.pathname.startsWith("/settings")}
            />
          </nav>
        </ScrollArea>

        {/* Infos utilisateur */}
        {user && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.fullName || 'Avatar'} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-500">
                    {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.fullName}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{user.email}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}