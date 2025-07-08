import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

interface ProjectMilestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  projectId: string;
}

interface MilestonesSectionProps {
  projectMilestones: ProjectMilestone[];
  formatDate: (dateString: string) => string;
  onViewAllClick: () => void;
}

export const MilestonesSection: React.FC<MilestonesSectionProps> = ({
  projectMilestones,
  formatDate,
  onViewAllClick,
}) => {
  const completedMilestones = projectMilestones.filter(m => m.completed);
  const upcomingMilestones = projectMilestones.filter(m => !m.completed).slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Jalons</CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewAllClick}>
            Voir tout
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Progression des jalons */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Progression</span>
            <span className="text-sm font-medium">
              {projectMilestones.length > 0 
                ? Math.round((completedMilestones.length / projectMilestones.length) * 100)
                : 0}%
            </span>
          </div>
          
          {/* Jalons à venir */}
          {upcomingMilestones.length > 0 ? (
            <div className="space-y-2">
              {upcomingMilestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center gap-3 p-2 border rounded-md">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{milestone.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(milestone.date)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    À venir
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Tous les jalons sont terminés !</p>
            </div>
          )}

          {/* Résumé */}
          <div className="pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Terminés</span>
              <span className="font-medium text-green-600">{completedMilestones.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">En attente</span>
              <span className="font-medium text-orange-600">
                {projectMilestones.length - completedMilestones.length}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 