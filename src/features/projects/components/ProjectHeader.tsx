import React from "react";
import { ProjectCardProps } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MoreHorizontal,
  Clock,
  Calendar,
  Share2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ProjectHeaderProps {
  project: ProjectCardProps | null;
}

export const ProjectHeader = ({ project }: ProjectHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Détermine l'action de retour en fonction du chemin actuel
  const handleGoBack = () => {
    // Si nous sommes sur une sous-route comme /projects/id/annotations
    if (location.pathname.includes('/annotations') || location.pathname.includes('/tasks')) {
      // Extrait l'ID du projet du chemin actuel
      const projectId = location.pathname.split('/')[2];
      navigate(`/projects/${projectId}`);
    } else {
      // Sinon retour à la liste des projets
      navigate("/projects");
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex gap-4 items-center">
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Chargement...</h1>
        </div>
      </div>
    );
  }

  const startDate = project.startDate
    ? new Date(project.startDate).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric" 
      })
    : "Non défini";

  const endDate = project.endDate
    ? new Date(project.endDate).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Non défini";

  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b">
      <div className="flex gap-4 items-center">
        <Button variant="ghost" size="icon" onClick={handleGoBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center">
          {project?.imageUrl && (
            <img
              src={project.imageUrl}
              alt={project.name}
              className="h-12 w-12 rounded-md mr-4 object-cover"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <div className="flex items-center text-muted-foreground gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Début: {startDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Fin: {endDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="hidden md:flex">
          <Calendar className="h-4 w-4 mr-2" />
          Planifier
        </Button>
        <Button variant="outline" size="sm" className="hidden md:flex">
          <Share2 className="h-4 w-4 mr-2" />
          Partager
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Modifier</DropdownMenuItem>
            <DropdownMenuItem>Archiver</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
