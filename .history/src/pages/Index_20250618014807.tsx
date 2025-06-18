import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/card";
import { Button } from "@ui/button";
import { CalendarDays, ClipboardCheck, FolderOpen, BarChart4, Building, Users } from "lucide-react";
import { Skeleton } from "@ui/skeleton";
import { useAuth } from "@features/auth/services/authService";

interface DashboardStats {
  projects: number;
  tasks: {
    total: number;
    completed: number;
  };
  clients: number;
  teamMembers: number;
  recentProjects: Array<{
    id: string;
    name: string;
    progress: number;
  }>;
}

export default function Index() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler une requête API
    const timer = setTimeout(() => {
      setStats({
        projects: 8,
        tasks: {
          total: 24,
          completed: 15,
        },
        clients: 6,
        teamMembers: 4,
        recentProjects: [
          { id: "1", name: "Résidence Les Tilleuls", progress: 65 },
          { id: "2", name: "Bureau Espace Moderne", progress: 30 },
          { id: "3", name: "École Jean Moulin", progress: 85 },
        ],
      });
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Bonjour, {user?.firstName || "utilisateur"}
          </h1>
          <p className="text-muted-foreground">
            Voici un aperçu de votre activité et de vos projets en cours.
          </p>
        </div>

        {/* Cards de statistiques */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Projets"
            value={stats?.projects}
            icon={<FolderOpen className="h-5 w-5" />}
            isLoading={isLoading}
            linkTo="/projects"
          />
          <StatsCard
            title="Tâches"
            value={`${stats?.tasks.completed || 0}/${stats?.tasks.total || 0}`}
            icon={<ClipboardCheck className="h-5 w-5" />}
            isLoading={isLoading}
            linkTo="/tasks"
          />
          <StatsCard
            title="Clients"
            value={stats?.clients}
            icon={<Building className="h-5 w-5" />}
            isLoading={isLoading}
            linkTo="/clients"
          />
          <StatsCard
            title="Équipe"
            value={stats?.teamMembers}
            icon={<Users className="h-5 w-5" />}
            isLoading={isLoading}
            linkTo="/team"
          />
        </div>

        {/* Projets récents */}
        <Card>
          <CardHeader>
            <CardTitle>Projets récents</CardTitle>
            <CardDescription>
              Vos projets les plus récents et leur avancement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 hover:bg-muted rounded-md transition-colors">
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Progression: {project.progress}%
                        </div>
                      </div>
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="pt-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/projects">Voir tous les projets</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Autres sections du dashboard... */}
      </div>
    </MainLayout>
  );
}

interface StatsCardProps {
  title: string;
  value: number | string | undefined;
  icon: React.ReactNode;
  isLoading: boolean;
  linkTo: string;
}

function StatsCard({ title, value, icon, isLoading, linkTo }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <Link
          to={linkTo}
          className="text-xs text-blue-500 hover:underline block mt-2"
        >
          Voir les détails →
        </Link>
      </CardContent>
    </Card>
  );
}