import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TaskProgress } from "@/app/styles";

interface TaskProgressDisplayProps {
  taskProgress: TaskProgress[];
}

export const TaskProgressDisplay: React.FC<TaskProgressDisplayProps> = ({
  taskProgress = [],
}) => {
  if (!taskProgress || taskProgress.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Avancement des lots</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="py-2 px-4 text-left">N°</th>
              <th className="py-2 px-4 text-left">Lot</th>
              <th className="py-2 px-4 text-right">Avancement</th>
            </tr>
          </thead>
          <tbody>
            {taskProgress.map((task, index) => (
              <tr key={task.id || index} className="border-t">
                <td className="py-3 px-4">
                  <Badge
                    className="w-8 h-8 rounded-full flex items-center justify-center font-medium"
                    style={{ backgroundColor: task.color }}
                  >
                    {task.number}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <div>{task.title}</div>
                  <div className="mt-1 pr-4">
                    <Progress
                      value={task.progress}
                      className="h-2"
                      indicatorColor={task.color}
                    />
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <Badge variant="outline" className="font-medium">
                    {task.progress} %
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};