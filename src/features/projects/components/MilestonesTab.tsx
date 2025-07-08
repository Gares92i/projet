import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Checkbox } from '@/ui/checkbox';
import { Calendar, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  inProgress?: boolean;
}

interface MilestonesTabProps {
  projectMilestones: Milestone[];
  formatDate: (dateString: string) => string;
  onDataUpdate: (milestones: Milestone[]) => void;
}

export const MilestonesTab: React.FC<MilestonesTabProps> = ({
  projectMilestones,
  formatDate,
  onDataUpdate,
}) => {
  const [milestones, setMilestones] = useState<Milestone[]>(projectMilestones);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleToggleComplete = (milestoneId: string) => {
    const updatedMilestones = milestones.map(milestone =>
      milestone.id === milestoneId
        ? { ...milestone, completed: !milestone.completed }
        : milestone
    );
    setMilestones(updatedMilestones);
    onDataUpdate(updatedMilestones);
    toast.success('Jalon mis à jour');
  };

  const handleDelete = (milestoneId: string) => {
    const updatedMilestones = milestones.filter(m => m.id !== milestoneId);
    setMilestones(updatedMilestones);
    onDataUpdate(updatedMilestones);
    toast.success('Jalon supprimé');
  };

  const getStatusBadge = (milestone: Milestone) => {
    if (milestone.completed) {
      return <Badge className="bg-green-500">Terminé</Badge>;
    } else if (milestone.inProgress) {
      return <Badge className="bg-blue-500">En cours</Badge>;
    } else {
      return <Badge className="bg-gray-500">En attente</Badge>;
    }
  };

  const getProgressPercentage = () => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Jalons du projet</h2>
          <p className="text-muted-foreground">
            {milestones.length} jalon{milestones.length > 1 ? 's' : ''} • {getProgressPercentage()}% terminé
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un jalon
        </Button>
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      {/* Liste des jalons */}
      <div className="grid gap-4">
        {milestones.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun jalon défini</h3>
              <p className="text-muted-foreground mb-4">
                Ajoutez des jalons pour suivre l'avancement de votre projet
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer le premier jalon
              </Button>
            </CardContent>
          </Card>
        ) : (
          milestones.map((milestone) => (
            <Card key={milestone.id} className={milestone.completed ? 'opacity-75' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <Checkbox
                      checked={milestone.completed}
                      onCheckedChange={() => handleToggleComplete(milestone.id)}
                    />
                    <div className="flex-1">
                      <h3 className={`font-medium ${milestone.completed ? 'line-through' : ''}`}>
                        {milestone.title}
                      </h3>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {milestone.description}
                        </p>
                      )}
                      {milestone.dueDate && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Échéance : {formatDate(milestone.dueDate)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(milestone)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(milestone.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(milestone.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}; 