import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Building2, CalendarDays, User2, MapPin, Map, FileText } from "lucide-react";
import { ProjectCardProps } from "@/features/projects/components/ProjectCard";
import { ProjectLocationMap } from "@/features/projects/components/ProjectLocationMap";

interface ProjectDetailsCardProps {
  project: ProjectCardProps | null;
  formatDate: (dateString: string) => string;
}

export const ProjectDetailsCard = ({ project, formatDate }: ProjectDetailsCardProps) => {
  if (!project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Détails du projet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Détails du projet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {project.description && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium">Description</div>
                <div className="text-sm text-muted-foreground">
                  {project.description}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Client</div>
              <div className="text-sm text-muted-foreground">
                {project.client || "Non spécifié"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Map className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Adresse</div>
              <div className="text-sm text-muted-foreground">
                {project.location || "Non spécifiée"}
              </div>
            </div>
          </div>

          {/* Carte si l'adresse est spécifiée */}
          {project.location && (
            <ProjectLocationMap address={project.location} height="180px" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
