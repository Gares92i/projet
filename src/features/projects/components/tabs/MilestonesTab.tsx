import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  CheckCircle,
  Circle,
  Clock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog";
import { Label } from "@/ui/label";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

// Types pour les jalons
interface ProjectMilestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  inProgress?: boolean;
  projectId: string;
}

// Liste des jalons par défaut
const DEFAULT_MILESTONES = [
  "Conception",
  "Consultation",
  "Démarrage travaux",
  "Achèvement travaux",
  "Finitions",
  "Livraison"
];

interface MilestonesTabProps {
  projectMilestones: ProjectMilestone[];
  formatDate: (dateString: string) => string;
  onDataUpdate?: (milestones: ProjectMilestone[]) => void;
}

export const MilestonesTab = ({
  projectMilestones,
  formatDate,
  onDataUpdate
}: MilestonesTabProps) => {
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(projectMilestones);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<ProjectMilestone | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // État pour les valeurs du formulaire
  const [formValues, setFormValues] = useState({
    title: '',
    date: '',
    completed: false,
    inProgress: false
  });

  // Enlever la confirmation lors de l'initialisation
  useEffect(() => {
    if (milestones.length === 0) {
      // Créer automatiquement les jalons par défaut sans confirmation
      createDefaultMilestones();
    }
  }, []);

  // Créer les jalons par défaut
  const createDefaultMilestones = () => {
    const now = new Date();
    const defaultMilestones: ProjectMilestone[] = DEFAULT_MILESTONES.map((title, index) => {
      // Ajouter 30 jours entre chaque jalon
      const date = new Date(now);
      date.setDate(date.getDate() + (index * 30));
      
      return {
        id: `milestone-${Date.now()}-${index}`,
        title,
        date: date.toISOString(),
        completed: false,
        inProgress: index === 0, // Premier jalon en cours par défaut
        projectId: milestones[0]?.projectId || "unknown"
      };
    });
    
    setMilestones(defaultMilestones);
    
    if (onDataUpdate) {
      onDataUpdate(defaultMilestones);
    }
    
    toast.success("Jalons par défaut créés avec succès");
  };

  // Ouvrir le dialog pour ajouter un jalon
  const handleAddMilestone = () => {
    setCurrentMilestone(null);
    setFormValues({
      title: '',
      date: new Date().toISOString().split('T')[0],
      completed: false,
      inProgress: false
    });
    setIsDialogOpen(true);
  };

  // Ouvrir le dialog pour modifier un jalon
  const handleEditMilestone = (milestone: ProjectMilestone) => {
    setCurrentMilestone(milestone);
    setFormValues({
      title: milestone.title,
      date: new Date(milestone.date).toISOString().split('T')[0],
      completed: milestone.completed,
      inProgress: milestone.inProgress || false
    });
    setIsDialogOpen(true);
  };

  // Confirmer la suppression d'un jalon
  const handleDeleteConfirm = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  // Effectuer la suppression d'un jalon
  const handleDelete = () => {
    if (!deleteId) return;
    
    const updatedMilestones = milestones.filter(m => m.id !== deleteId);
    setMilestones(updatedMilestones);
    
    if (onDataUpdate) {
      onDataUpdate(updatedMilestones);
    }
    
    toast.success("Jalon supprimé avec succès");
    setIsDeleteDialogOpen(false);
    setDeleteId(null);
  };

  // Changer le statut "achevé" d'un jalon
  const toggleMilestoneCompleted = (id: string) => {
    const updatedMilestones = milestones.map(milestone => {
      if (milestone.id === id) {
        const newCompleted = !milestone.completed;
        return { 
          ...milestone, 
          completed: newCompleted,
          // Si marqué comme terminé, désactiver "en cours"
          inProgress: newCompleted ? false : milestone.inProgress
        };
      }
      return milestone;
    });
    
    setMilestones(updatedMilestones);
    
    if (onDataUpdate) {
      onDataUpdate(updatedMilestones);
    }
    
    const milestone = milestones.find(m => m.id === id);
    const newStatus = !milestone?.completed;
    toast.success(`Jalon marqué comme ${newStatus ? 'terminé' : 'à faire'}`);
  };

  // Changer le statut "en cours" d'un jalon
  const toggleMilestoneInProgress = (id: string) => {
    const updatedMilestones = milestones.map(milestone => {
      if (milestone.id === id) {
        const newInProgress = !milestone.inProgress;
        return { 
          ...milestone, 
          inProgress: newInProgress,
          // Si un jalon est en cours, désactiver "en cours" pour les autres jalons
          completed: milestone.completed
        };
      } else if (milestone.inProgress && milestone.id !== id) {
        // Désactiver "en cours" pour les autres jalons
        return { ...milestone, inProgress: false };
      }
      return milestone;
    });
    
    setMilestones(updatedMilestones);
    
    if (onDataUpdate) {
      onDataUpdate(updatedMilestones);
    }
    
    const milestone = milestones.find(m => m.id === id);
    const newInProgress = !milestone?.inProgress;
    toast.success(`Jalon marqué comme ${newInProgress ? 'en cours' : 'non en cours'}`);
  };

  // Sauvegarder un jalon (ajout ou modification)
  const handleSaveMilestone = () => {
    if (!formValues.title.trim()) {
      toast.error("Le titre du jalon est requis");
      return;
    }

    if (!formValues.date) {
      toast.error("La date du jalon est requise");
      return;
    }

    let updatedMilestones: ProjectMilestone[];

    if (currentMilestone) {
      // Modification d'un jalon existant
      updatedMilestones = milestones.map(milestone => {
        if (milestone.id === currentMilestone.id) {
          return { 
            ...milestone, 
            title: formValues.title,
            date: new Date(formValues.date).toISOString(),
            completed: formValues.completed,
            inProgress: formValues.inProgress
          };
        } else if (formValues.inProgress && milestone.inProgress && milestone.id !== currentMilestone.id) {
          // Si le jalon actuel est marqué "en cours", désactiver ce statut pour les autres
          return { ...milestone, inProgress: false };
        }
        return milestone;
      });
      toast.success("Jalon modifié avec succès");
    } else {
      // Ajout d'un nouveau jalon
      const newMilestone: ProjectMilestone = {
        id: `milestone-${Date.now()}`,
        title: formValues.title,
        date: new Date(formValues.date).toISOString(),
        completed: formValues.completed,
        inProgress: formValues.inProgress,
        projectId: milestones[0]?.projectId || "unknown"
      };
      
      // Si le nouveau jalon est "en cours", désactiver ce statut pour les autres
      if (formValues.inProgress) {
        updatedMilestones = milestones.map(milestone => ({
          ...milestone,
          inProgress: false
        }));
        updatedMilestones = [...updatedMilestones, newMilestone];
      } else {
        updatedMilestones = [...milestones, newMilestone];
      }
      
      toast.success("Jalon ajouté avec succès");
    }

    // Trier les jalons par date
    updatedMilestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setMilestones(updatedMilestones);
    
    if (onDataUpdate) {
      onDataUpdate(updatedMilestones);
    }
    
    setIsDialogOpen(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Jalons</CardTitle>
            <CardDescription>Progression des étapes clés du projet</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddMilestone}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un jalon
            </Button>
            {milestones.length === 0 && (
              <Button variant="outline" onClick={createDefaultMilestones}>
                <Plus className="h-4 w-4 mr-2" />
                Jalons par défaut
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.length > 0 ? (
            milestones.map((milestone) => (
              <div 
                key={milestone.id} 
                className={`p-4 border rounded-md flex items-center gap-4 ${
                  milestone.completed ? 'bg-green-50 border-l-4 border-l-green-500' : 
                  milestone.inProgress ? 'bg-orange-50 border-l-4 border-l-orange-500' : 
                  'border-l-4 border-l-gray-300'
                }`}
              >
                {/* Icône qui change selon l'état */}
                <div className={`p-2 rounded-full ${
                  milestone.completed ? 'bg-green-100 text-green-700' : 
                  milestone.inProgress ? 'bg-orange-100 text-orange-700' : 
                  'bg-gray-100 text-gray-500'
                }`}>
                  {milestone.completed ? 
                    <CheckCircle className="h-5 w-5" /> : 
                    milestone.inProgress ? 
                      <Clock className="h-5 w-5" /> : 
                      <Circle className="h-5 w-5" />
                  }
                </div>
                
                <div className="flex-1">
                  <p className={`font-medium ${
                    milestone.completed ? 'text-green-700' : 
                    milestone.inProgress ? 'text-orange-700' : ''
                  }`}>
                    {milestone.title}
                    {milestone.inProgress && 
                      <span className="ml-2 text-xs text-orange-600">(En cours)</span>
                    }
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {formatDate(milestone.date)}
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleMilestoneInProgress(milestone.id)}
                    disabled={milestone.completed}
                    className={milestone.inProgress ? "text-orange-600" : ""}
                  >
                    En cours
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleMilestoneCompleted(milestone.id)}
                    disabled={milestone.inProgress && milestone.completed}
                    className={milestone.completed ? "text-green-600" : ""}
                  >
                    {milestone.completed ? "Terminé" : "Marquer comme terminé"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditMilestone(milestone)}
                  >
                    <Pencil className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteConfirm(milestone.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-12 text-muted-foreground">
              Aucun jalon n'a été ajouté au projet.
            </div>
          )}
        </div>
      </CardContent>

      {/* Dialog pour ajouter/modifier un jalon */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentMilestone ? "Modifier le jalon" : "Ajouter un jalon"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du jalon</Label>
              {currentMilestone ? (
                <Input 
                  id="title" 
                  value={formValues.title} 
                  onChange={(e) => setFormValues({...formValues, title: e.target.value})}
                  placeholder="Ex: Livraison des matériaux"
                />
              ) : (
                <Select
                  value={formValues.title}
                  onValueChange={(value) => setFormValues({...formValues, title: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un jalon ou saisissez un titre" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_MILESTONES.map(milestone => (
                      <SelectItem key={milestone} value={milestone}>{milestone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {!currentMilestone && formValues.title && !DEFAULT_MILESTONES.includes(formValues.title) && (
                <Input 
                  className="mt-2"
                  value={formValues.title} 
                  onChange={(e) => setFormValues({...formValues, title: e.target.value})}
                  placeholder="Titre personnalisé"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date du jalon</Label>
              <Input
                id="date" 
                type="date" 
                value={formValues.date} 
                onChange={(e) => setFormValues({...formValues, date: e.target.value})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant={formValues.inProgress ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setFormValues({
                      ...formValues,
                      inProgress: !formValues.inProgress,
                      completed: formValues.inProgress ? formValues.completed : false
                    });
                  }}
                  className={formValues.inProgress ? "bg-orange-500 hover:bg-orange-600" : ""}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {formValues.inProgress ? "En cours" : "Marquer comme en cours"}
                </Button>
                <span className="text-xs text-muted-foreground">Indique le jalon actuellement en cours</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant={formValues.completed ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setFormValues({
                      ...formValues,
                      completed: !formValues.completed,
                      inProgress: formValues.completed ? formValues.inProgress : false
                    });
                  }}
                  className={formValues.completed ? "bg-green-500 hover:bg-green-600" : ""}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {formValues.completed ? "Terminé" : "Marquer comme terminé"}
                </Button>
                <span className="text-xs text-muted-foreground">Indique un jalon achevé</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveMilestone}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce jalon ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDelete}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
