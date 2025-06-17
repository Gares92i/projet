import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { TaskProgress } from "@/types";
import { fetchTaskProgressFromPlanning } from "@/components/services/planningService";

interface TaskProgressSelectorProps {
  projectId?: string;
  initialProgress?: TaskProgress[];
  onChange: (tasks: TaskProgress[]) => void;
}

export const TaskProgressSelector: React.FC<TaskProgressSelectorProps> = ({
  projectId,
  initialProgress = [],
  onChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [availableTasks, setAvailableTasks] = useState<TaskProgress[]>([]);

  // Charger les données de planning au chargement du composant
  useEffect(() => {
    if (projectId) {
      setLoading(true);
      fetchTaskProgressFromPlanning(projectId)
        .then((tasks) => {
          setAvailableTasks(tasks);
          // Directement mettre à jour avec tous les lots disponibles
          onChange(tasks);
        })
        .catch((error) => {
          console.error(
            "Erreur lors du chargement des avancements de lots:",
            error
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [projectId, onChange]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            Avancements des lots
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">
              Chargement des lots depuis la planification...
            </span>
          </div>
        ) : availableTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun lot disponible dans la planification du projet.
          </div>
        ) : (
          <div className="grid gap-2">
            {availableTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center border rounded-lg p-3">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Badge
                      className="w-7 h-7 rounded-full flex items-center justify-center font-medium mr-2"
                      style={{ backgroundColor: task.color }}>
                      {task.number}
                    </Badge>
                    <span className="font-medium">{task.title}</span>
                    <Badge className="ml-auto">{task.progress}%</Badge>
                  </div>
                  <Progress
                    value={task.progress}
                    className="h-1.5 mt-2"
                    style={
                      {
                        "--progress-background": task.color,
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};