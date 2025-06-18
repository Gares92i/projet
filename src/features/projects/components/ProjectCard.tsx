import { Building, Calendar, Clock, MapPin, MoreHorizontal, Users } from "lucide-react";
import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Badge } from "@/ui/badge";
import { Progress } from "@/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
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
import { deleteProject } from "@/services/projectService";
import { toast } from "sonner";

// Ajout des propriétés manquantes dans l'interface ProjectCardProps
export interface ProjectCardProps {
  id: string;
  name: string;
  client: string;
  clientId: string;
  location: string;
  startDate?: string;
  
  endDate?: string;
  status: "planning" | "design" | "construction" | "completed" | "on-hold";
  progress?: number; // Garder cette propriété car elle est utilisée dans la vue liste
  teamSize: number;
  teamMembers: TeamMemberInfo[];
  imageUrl?: string;
  milestones?: MilestoneInfo[];
  projectType?: string;  // Nouvelle propriété
  projectArea?: number;  // Nouvelle propriété
  roomCount?: number;    // Nouvelle propriété
}

// Ajoutez l'interface MilestoneInfo si elle n'existe pas
export interface MilestoneInfo {
  id: string;
  title: string;
  completed: boolean;
  inProgress: boolean;
  dueDate?: string;
}

// Modifier l'interface ProjectMilestone pour inclure tous les champs nécessaires
interface ProjectMilestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  inProgress: boolean;
  projectId: string;
}

// Type auxiliaire pour les membres d'équipe
export interface TeamMemberInfo {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

// Fonction utilitaire pour normaliser les membres
export function normalizeTeamMembers(members: (string | TeamMemberInfo)[]): TeamMemberInfo[] {
  if (!members || members.length === 0) return [];

  return members.map(member => {
    if (typeof member === 'string') {
      // C'est un ID de membre, créer un objet minimal
      return {
        id: member,
        name: "Membre",
        role: "non spécifié"
      };
    }
    return member;
  });
}

const statusConfig = {
  "planning": { label: "Planification", color: "bg-blue-500" },
  "design": { label: "Conception", color: "bg-purple-500" },
  "construction": { label: "Construction", color: "bg-yellow-500" },
  "completed": { label: "Terminé", color: "bg-green-500" },
  "on-hold": { label: "En pause", color: "bg-gray-500" },
};

const ProjectCard = ({
  id,
  name,
  client,
  location,
  startDate,
  endDate,
  progress,
  status,
  teamSize,
  teamMembers,
  projectType,
  projectArea,
  roomCount,
  imageUrl,
  milestones = [], // Valeur par défaut pour éviter les erreurs
}: ProjectCardProps) => {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const processedTeamMembers = normalizeTeamMembers(teamMembers);
  const { label, color } = statusConfig[status] || statusConfig["planning"];

  // Trouver le jalon en cours
  const currentMilestone = milestones?.find(m => m.inProgress);
  // Trouver le prochain jalon (non terminé, non en cours)
  const nextMilestone = milestones?.find(m => !m.completed && !m.inProgress);

  const formatDate = (dateString: string | undefined | null): string => {
    // Vérifier si la date est définie
    if (!dateString) return "Non définie";
    
    try {
      // Essayer de créer un objet Date
      const date = new Date(dateString);
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        return "Date invalide";
      }
      
      // Formater la date correctement
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error("Erreur de formatage de date:", error, dateString);
      return "Date invalide";
    }
  };

  const handleDeleteProject = async () => {
    try {
      setIsDeleting(true);
      await deleteProject(id);
      setIsDeleteDialogOpen(false);
      // Forcer le rechargement de la page pour mettre à jour la liste des projets
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la suppression du projet:", error);
      toast.error("Impossible de supprimer le projet");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditProject = () => {
    navigate(`/projects/${id}/edit`);
  };

  return (
    <>
      <Card className="hover-lift overflow-hidden">
        <CardHeader className="px-0 pt-0 relative">
          <div 
            className="h-32 bg-gradient-to-b from-architect-200 to-architect-100 dark:from-architect-800 dark:to-architect-900 flex items-end"
            style={
              imageUrl 
                ? { 
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  } 
                : {}
            }
          >
            <div className="absolute right-3 top-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/projects/${id}`}>Ouvrir le projet</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEditProject}>Modifier</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <Badge className={`${color} text-white px-2 py-0.5`}>{label}</Badge>
              <div className="text-sm text-muted-foreground">{progress}%</div>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
          
          {/* Afficher le jalon en cours s'il existe */}
          {currentMilestone && (
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">
                  En cours: {currentMilestone.title}
                </span>
              </div>
            </div>
          )}
          
          {/* Affichage du prochain jalon si aucun n'est en cours */}
          {!currentMilestone && nextMilestone && (
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">
                  À venir: {nextMilestone.title}
                </span>
              </div>
            </div>
          )}
          
          <h3 className="text-lg font-medium mb-2 line-clamp-1">{name}</h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{client}</p>
          
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center text-sm">
              <MapPin className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground line-clamp-1">{location}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">
                {formatDate(startDate)} - {formatDate(endDate)}
              </span>
            </div>
            
            <div className="flex items-center text-sm">
              <Users className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">{teamSize} membres</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to={`/projects/${id}`}>Voir les détails</Link>
          </Button>
        </CardFooter>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce projet ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données associées à ce projet seront supprimées définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProjectCard;
