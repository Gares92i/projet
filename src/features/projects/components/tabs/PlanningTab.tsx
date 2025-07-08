import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Progress } from '@/ui/progress';
import { Calendar, Clock, BarChart3, GanttChart } from 'lucide-react';

interface PlanningTabProps {
  projectId: string;
  descriptifData: any[];
  startDate?: string;
  endDate?: string;
  onTaskUpdate?: (taskId: string, startDate: string, endDate: string) => void;
}

export const PlanningTab: React.FC<PlanningTabProps> = ({ 
  projectId, 
  descriptifData, 
  startDate, 
  endDate, 
  onTaskUpdate 
}) => {
  const [selectedView, setSelectedView] = useState<'gantt' | 'calendar' | 'kanban'>('gantt');

  const calculateProgress = (lot: any) => {
    // Simulation du calcul de progression
    return Math.floor(Math.random() * 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Planning du projet</CardTitle>
            <CardDescription>Gestion du planning et des échéances</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={selectedView === 'gantt' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedView('gantt')}
            >
              <GanttChart className="h-4 w-4 mr-2" />
              Gantt
            </Button>
            <Button 
              variant={selectedView === 'calendar' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedView('calendar')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendrier
            </Button>
            <Button 
              variant={selectedView === 'kanban' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedView('kanban')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Kanban
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Date de début</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {startDate ? new Date(startDate).toLocaleDateString('fr-FR') : 'Non définie'}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Date de fin</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {endDate ? new Date(endDate).toLocaleDateString('fr-FR') : 'Non définie'}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-green-500" />
                <span className="font-medium">Lots de travaux</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {descriptifData.length} lot{descriptifData.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Vue sélectionnée */}
          {selectedView === 'gantt' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Diagramme de Gantt</h3>
              <div className="space-y-3">
                {descriptifData.map((lot, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{lot.title || `Lot ${index + 1}`}</h4>
                      <Badge variant="outline">{calculateProgress(lot)}%</Badge>
                    </div>
                    <Progress value={calculateProgress(lot)} className="h-2" />
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Début: {lot.startDate || 'Non définie'}</span>
                      <span>Fin: {lot.endDate || 'Non définie'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedView === 'calendar' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Vue Calendrier</h3>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Vue calendrier à implémenter</p>
                <p className="text-sm">Affichage des échéances par mois/semaine</p>
              </div>
            </div>
          )}

          {selectedView === 'kanban' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Vue Kanban</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3 text-gray-600">À faire</h4>
                  <div className="space-y-2">
                    {descriptifData.slice(0, 2).map((lot, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded border">
                        <p className="text-sm font-medium">{lot.title || `Lot ${index + 1}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3 text-blue-600">En cours</h4>
                  <div className="space-y-2">
                    {descriptifData.slice(2, 4).map((lot, index) => (
                      <div key={index} className="p-2 bg-blue-50 rounded border">
                        <p className="text-sm font-medium">{lot.title || `Lot ${index + 3}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3 text-green-600">Terminé</h4>
                  <div className="space-y-2">
                    {descriptifData.slice(4, 6).map((lot, index) => (
                      <div key={index} className="p-2 bg-green-50 rounded border">
                        <p className="text-sm font-medium">{lot.title || `Lot ${index + 5}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
