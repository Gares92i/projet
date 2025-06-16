import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, FileText, MessageCircle, ListChecks } from "lucide-react";
import TaskList from "@/components/TaskList";
import { Task } from "@/components/gantt/types";
import { Document } from "@/components/DocumentsList";
import { TeamMember } from "@/types/team";
import { MilestonesSection } from "./overview/MilestonesSection";
// Nous supprimons l'import qui n'existe pas
import { StatisticsSection } from "./overview/StatisticsSection";
import { useEffect, useState } from "react";

interface ProjectMilestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  projectId: string;
}

interface ProjectStats {
  budgetTotal: number;
  budgetUsed: number;
  timelineProgress: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksTodo: number;
  documentsCount: number;
  commentsCount: number;
  meetingsCount: number;
  projectId: string;
}

interface ProjectOverviewTabProps {
  projectTasks: Task[];
  teamMembers: TeamMember[];
  projectMilestones: ProjectMilestone[];
  projectDocuments: Document[];
  projectStats: ProjectStats;
  formatDate: (dateString: string) => string;
  handleNavigateToTasksPage: () => void;
  handleNavigateToMilestonesPage: () => void; 
}

export const ProjectOverviewTab = ({
  projectTasks,
  teamMembers,
  projectMilestones,
  projectDocuments,
  projectStats,
  formatDate,
  handleNavigateToTasksPage,
  handleNavigateToMilestonesPage, 
}: ProjectOverviewTabProps) => {
  const [avatarStatus, setAvatarStatus] = useState("");
  const [userStatus, setUserStatus] = useState("offline");

  useEffect(() => {
    // Simuler un changement de statut utilisateur (à remplacer par une logique réelle)
    const checkUserStatus = () => {
      // Obtenir le statut actuel (exemple : depuis une API ou un contexte)
      const newStatus = Math.random() > 0.5 ? "online" : "offline";
      
      // Ne mettre à jour que si le statut a changé
      if (userStatus !== newStatus) {
        setAvatarStatus(newStatus);
        setUserStatus(newStatus);
      }
    };
    
    // Vérifier le statut initial
    checkUserStatus();
    
    // Vérifier régulièrement (si nécessaire)
    const interval = setInterval(checkUserStatus, 30000);
    
    return () => clearInterval(interval);
  }, [userStatus]); // Dépend de userStatus pour détecter les changements

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Remplacer StatsSection par StatisticsSection */}
        <StatisticsSection projectStats={projectStats} />
        <MilestonesSection
          projectMilestones={projectMilestones}
          formatDate={formatDate} 
          onViewAllClick={handleNavigateToMilestonesPage}
        />
      </div>
      
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Tâches récentes</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleNavigateToTasksPage}>
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TaskList 
              tasks={projectTasks.slice(0, 3)}
              title="Tâches récentes"
              onCompleteTask={() => {}}
              onDeleteTask={() => {}}
            />
          </CardContent>
        </Card>
      </div>
            
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Équipe du projet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.slice(0, 4).map(member => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              ))}
              {teamMembers.length > 4 && (
                <Button variant="ghost" size="sm" className="w-full">
                  Voir tous les membres ({teamMembers.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
              
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Documents récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projectDocuments.slice(0, 3).map(doc => (
                <div key={doc.id} className="flex items-center gap-3 border rounded-md p-2">
                  <div className={`p-2 rounded-md ${
                    doc.type === 'pdf' ? 'bg-red-100 text-red-700' :
                    doc.type === 'xls' ? 'bg-green-100 text-green-700' : 
                    doc.type === 'img' ? 'bg-blue-100 text-blue-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.size} • {formatDate(doc.date!)}</p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full">
                Voir tous les documents ({projectDocuments.length})
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Restaurer la section compte-rendu et annotations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Compte-rendus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-700 p-2 rounded-md">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Réunion technique</p>
                  <p className="text-sm text-muted-foreground">12 janv. 2024</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-700 p-2 rounded-md">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Revue client</p>
                  <p className="text-sm text-muted-foreground">5 janv. 2024</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full">
                Voir tous les CR ({projectStats.meetingsCount})
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Annotations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 text-amber-700 p-2 rounded-md">
                  <ListChecks className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Plans à réviser</p>
                  <p className="text-sm text-muted-foreground">Modifié hier</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 text-amber-700 p-2 rounded-md">
                  <ListChecks className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Questions client</p>
                  <p className="text-sm text-muted-foreground">Modifié il y a 3 jours</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full">
                Voir toutes les annotations (8)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
