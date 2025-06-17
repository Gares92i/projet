import { useEffect, useState } from "react";
import { getArchitectInfo } from "@/components/services/reportService";
import { getProjectById } from "@/components/services/projectService";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building, MapPin, User, Calendar, FileText } from "lucide-react";
import { Project } from "@/types/project";
import { ArchitectInfo } from "@/types";

interface DescriptifHeaderProps {
  projectId: string;
  reportNumber?: string;
  // Ajouter un type plus précis avec valeur par défaut
  visitDate: string;
}

const DescriptifHeader = ({
  projectId,
  reportNumber,
  // Fournir une date par défaut
  visitDate = new Date().toISOString(),
}: DescriptifHeaderProps) => {
  const [architectInfo, setArchitectInfo] = useState<ArchitectInfo | null>(
    null
  );

  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const info = await getArchitectInfo();
        setArchitectInfo(info);

        if (projectId) {
          const projectData = await getProjectById(projectId);
          setProject({
            ...projectData,
            startDate: projectData.startDate || new Date().toISOString(),
            endDate: projectData.endDate || new Date().toISOString()
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [projectId]);

  // Modifier la fonction formatDate
  const formatDate = (dateString?: string | null) => {
    // Vérifier si la date existe
    if (!dateString) return "Non spécifiée";

    try {
      // Essayer de créer un objet Date
      const date = new Date(dateString);

      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        return "Date invalide";
      }

      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch (error) {
      console.error("Erreur de formatage de la date:", error);
      return "Date invalide";
    }
  };

  if (!architectInfo) {
    return <div>Chargement...</div>;
  }

  return (
    <Card className="mb-6 print:shadow-none print:border-none">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="mr-4">
              {architectInfo.logo && (
                <img
                  src={architectInfo.logo}
                  alt="Logo"
                  className="h-16 w-16 object-contain"
                />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{architectInfo.name}</h2>
              <p className="text-sm text-muted-foreground">
                {architectInfo.address}
              </p>
              <p className="text-sm text-muted-foreground">
                {architectInfo.phone}
              </p>
              <p className="text-sm text-muted-foreground">
                {architectInfo.email}
              </p>
            </div>
          </div>

          <div className="text-right">
            <h3 className="font-bold text-lg">DESCRIPTIF TRAVAUX</h3>

            <div className="flex items-center justify-end mt-1">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">
                Date: {formatDate(visitDate)}
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {project && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Projet</h3>
              <p className="text-lg">{project.name}</p>
              <div className="flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {project.location}
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Client</h3>
              <p className="text-lg">{project.client}</p>
              <div className="flex items-center mt-1">
                <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Période:{" "}
                  {project.startDate
                    ? formatDate(project.startDate)
                    : "Non spécifiée"}{" "}
                  -{" "}
                  {project.endDate ? formatDate(project.endDate) : "Non spécifiée"}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DescriptifHeader;
