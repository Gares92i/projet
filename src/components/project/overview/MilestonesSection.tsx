import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectMilestone } from "../tabs/types"; // Correction du chemin d'importation

interface MilestonesSectionProps {
  projectMilestones: ProjectMilestone[];
  formatDate: (dateString: string) => string;
  onViewAllClick: () => void; // Ajout d'une prop pour gérer le clic sur "Voir tout"
}

export const MilestonesSection = ({
  projectMilestones,
  formatDate,
  onViewAllClick
}: MilestonesSectionProps) => {
  // Trier les jalons par date (les plus proches d'abord)
  const sortedMilestones = [...projectMilestones].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Filtrer pour afficher d'abord les jalons non complétés, puis les complétés récents
  const priorityMilestones = [
    ...sortedMilestones.filter(m => !m.completed),
    ...sortedMilestones.filter(m => m.completed)
  ].slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Jalons du projet</CardTitle>
          <Button
            variant="ghost" 
            size="sm" 
            className="text-sm"
            onClick={onViewAllClick}
          >
            Voir tout
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {priorityMilestones.length > 0 ? (
          <div className="space-y-4">
            {priorityMilestones.map(milestone => (
              <div key={milestone.id} className="flex items-center gap-4">
                <div 
                  className={`w-3 h-3 rounded-full ${
                    milestone.completed ? 'bg-green-500' :
                    new Date(milestone.date) < new Date() ? 'bg-amber-500' : 'bg-gray-300'
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="font-medium">{milestone.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(milestone.date) < new Date() && !milestone.completed
                      ? "En retard - "
                      : ""}
                    {formatDate(milestone.date)}
                  </p>
                </div>
                <Badge
                  variant={milestone.completed ? "default" : 
                          new Date(milestone.date) < new Date() ? "destructive" : "outline"}
                >
                  {milestone.completed ? "Terminé" : 
                   new Date(milestone.date) < new Date() ? "En retard" : "À venir"}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            Aucun jalon n'est défini pour ce projet
          </div>
        )}
      </CardContent>
    </Card>
  );
};
