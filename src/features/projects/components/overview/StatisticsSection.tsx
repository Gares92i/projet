import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Progress } from '@/ui/progress';
import { Calendar, FileText, MessageCircle, ListChecks } from 'lucide-react';

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

interface StatisticsSectionProps {
  projectStats: ProjectStats;
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({ projectStats }) => {
  const budgetProgress = Math.round((projectStats.budgetUsed / projectStats.budgetTotal) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Statistiques du projet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progression du projet */}
          <div>
            <div className="flex justify-between mb-1">
              <p className="text-sm text-muted-foreground">Progression globale</p>
              <p className="text-sm font-medium">{projectStats.timelineProgress}%</p>
            </div>
            <Progress value={projectStats.timelineProgress} className="h-2" />
          </div>

          {/* Budget */}
          <div>
            <div className="flex justify-between mb-1">
              <p className="text-sm text-muted-foreground">Budget utilisé</p>
              <p className="text-sm font-medium">{budgetProgress}%</p>
            </div>
            <Progress value={budgetProgress} className="h-2" />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                }).format(projectStats.budgetUsed)}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                }).format(projectStats.budgetTotal)}
              </span>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">{projectStats.tasksCompleted + projectStats.tasksInProgress + projectStats.tasksTodo}</p>
                <p className="text-xs text-muted-foreground">Tâches</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">{projectStats.documentsCount}</p>
                <p className="text-xs text-muted-foreground">Documents</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">{projectStats.commentsCount}</p>
                <p className="text-xs text-muted-foreground">Commentaires</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">{projectStats.meetingsCount}</p>
                <p className="text-xs text-muted-foreground">Réunions</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 