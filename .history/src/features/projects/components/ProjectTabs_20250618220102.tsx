import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectOverviewTab } from "./ProjectOverviewTab";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TasksTab } from "./tabs/TasksTab";
import { TeamTab } from "./tabs/TeamTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { MilestonesTab } from "./tabs/MilestonesTab";
import { ReportsTab } from "./tabs/ReportsTab";
import { AnnotationsTab } from "./tabs/AnnotationsTab";
import { PlanningTab } from "./tabs/PlanningTab"; // Ajouter l'import du nouveau composant
import { Task } from "@/components/gantt/types";
import { Document } from "@/components/DocumentsList";
import { Annotation } from "@/app/styles";
import { ProjectMilestone, ProjectStats } from "./tabs/types";
import { TeamMember } from "@/types/team";
import { ClipboardPen } from "lucide-react"; // Importer l'icône
import { DescriptifDetailTab } from "./tabs/DescriptifDetailTab"; // Importer le nouveau composant
import { Button } from "@/components/ui/button"; // Importer le composant Button
import { useNavigate } from "react-router-dom"; // Importer le hook useNavigate
import { LotTravaux, DescriptifData } from "@/types/projectTypes";
import { useLocalStorage } from '@/hooks/useLocalStorage'; // Importer le hook useLocalStorage

 // Ajoutez cet import
// Supprimer les définitions locales de LotTravaux et DescriptifData

type DataUpdatePayload =
  | { type: "milestones"; data: ProjectMilestone[] }
  | { type: "team"; data: TeamMember[] }
  | { type: "documents"; data: Document[] }
  | { type: "annotations"; data: Annotation[] }
  | { type: "descriptif"; data: LotTravaux[] }; // Typed properly now

interface ProjectTabsProps {
  projectId: string;
  projectTasks: Task[];
  teamMembers: TeamMember[];
  projectMilestones: ProjectMilestone[];
  projectDocuments: Document[];
  projectStats: ProjectStats;
  tasks: Task[];
  formatDate: (dateString: string) => string;
  projectAnnotations: Annotation[];
  onDataUpdate?: (payload?: DataUpdatePayload) => void; // Modifié ici
  descriptifData?: LotTravaux[]; // Ajoutez cette propriété
  startDate?: string; // Date de début du projet
  endDate?: string; // Date de fin du projet
}

export const ProjectTabs = ({
  projectId,
  projectTasks,
  teamMembers,
  projectMilestones,
  projectDocuments,
  projectStats,
  tasks,
  formatDate,
  projectAnnotations, // ← Vient maintenant du parent
  onDataUpdate,
  descriptifData = [], // Ajoutez ce paramètre
  startDate,
  endDate,
}: ProjectTabsProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate(); // Utiliser le hook useNavigate
  const [localDescriptifData, setLocalDescriptifData] = useLocalStorage<LotTravaux[]>(
    `descriptif-data-${projectId}`,
    descriptifData.length > 0 ? descriptifData : []
  );

  const [planningDates, setPlanningDates] = useLocalStorage(
    `planning-dates-${projectId}`,
    {}
  );

  // Ajouter une référence pour suivre l'état précédent
  const prevDescriptifDataRef = useRef<string>("");

  // Corriger l'useEffect problématique qui provoque la boucle
  useEffect(() => {
    // N'exécuter cette logique que si l'onglet actif est "descriptif" ou s'il vient de changer
    // Cela évite les mises à jour inutiles lors des rendus multiples
    if (activeTab !== "descriptif") return;

    const storedDescriptifData = localStorage.getItem(`descriptif-data-${projectId}`);
    if (!storedDescriptifData) return;

    try {
      const parsedData = JSON.parse(storedDescriptifData);
      // Vérifier si c'est un tableau et qu'il y a des données
      if (!Array.isArray(parsedData)) return;

      // Sérialiser pour comparaison efficace
      const parsedDataStr = JSON.stringify(parsedData);
      const currentLocalData = JSON.stringify(localDescriptifData);

      // Vérifier DEUX conditions avant de mettre à jour:
      // 1. Les données localStorage sont différentes des données actuelles
      // 2. Les données n'ont pas déjà été envoyées (via prevDescriptifDataRef)
      if (parsedDataStr !== currentLocalData && parsedDataStr !== prevDescriptifDataRef.current) {
        console.log("Nouvelles données descriptif détectées, mise à jour locale");
        setLocalDescriptifData(parsedData);

        // Mettre à jour la référence pour éviter des mises à jour redondantes
        prevDescriptifDataRef.current = parsedDataStr;

        // Notifier le parent UNIQUEMENT si nécessaire et avec un type explicite
        if (onDataUpdate) {
          console.log("Notification au parent des nouvelles données descriptif");
          onDataUpdate({ 
            type: "descriptif",
            data: parsedData 
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la lecture des données du descriptif:", error);
    }
  }, [activeTab, projectId]); // Retirer onDataUpdate et localDescriptifData des dépendances

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleDescriptifUpdate = (updatedData: LotTravaux[]) => {
    // Même si updatedData est vide, nous devons le stocker tel quel
    // pour refléter l'intention de l'utilisateur
    setLocalDescriptifData(updatedData);

    // Synchroniser avec localStorage manuellement pour s'assurer que les changements sont enregistrés
    localStorage.setItem(`descriptif-data-${projectId}`, JSON.stringify(updatedData));

    if (onDataUpdate) {
      onDataUpdate({ type: "descriptif", data: updatedData });
    }
  };

  const handleTaskDateUpdate = (taskId: string, startDate: string, endDate: string) => {
    setPlanningDates(prev => ({
      ...prev,
      [taskId]: { startDate, endDate }
    }));

    const updatedData = localDescriptifData.map(lot => ({
      ...lot,
      tasks: lot.tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, startDate, endDate };
        }
        return task;
      })
    }));

    setLocalDescriptifData(updatedData);

    if (onDataUpdate) {
      onDataUpdate({ type: "descriptif", data: updatedData });
    }
  };

  return (
    <Tabs
      defaultValue="overview"
      className="mb-8"
      value={activeTab}
      onValueChange={handleTabChange}>
      <TabsList className="grid grid-cols-9 md:grid-cols-auto w-full bg-muted">
        <TabsTrigger value="overview">Vue générale</TabsTrigger>
        <TabsTrigger value="tasks">Tâches</TabsTrigger>
        <TabsTrigger value="team">Équipe</TabsTrigger>
        <TabsTrigger value="milestones">Jalons</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="planning">Planning</TabsTrigger>{" "}
        {/* Nouvel onglet */}
        <TabsTrigger value="descriptif">Descriptif détaillé</TabsTrigger>
        <TabsTrigger value="reports">Rapports</TabsTrigger>
        <TabsTrigger value="annotations">Annotations</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <ProjectOverviewTab
          projectTasks={projectTasks}
          teamMembers={teamMembers}
          projectMilestones={projectMilestones}
          projectDocuments={projectDocuments}
          projectStats={projectStats}
          formatDate={formatDate}
          handleNavigateToTasksPage={() => setActiveTab("tasks")}
          handleNavigateToMilestonesPage={() => setActiveTab("milestones")} // Ajouter cette ligne
        />
      </TabsContent>
      <TabsContent value="tasks">
        <TasksTab projectId={projectId} tasks={tasks} />
      </TabsContent>
      <TabsContent value="team">
        <TeamTab
          projectId={projectId}
          teamMembers={teamMembers}
          onDataUpdate={(payload) => {
            if (onDataUpdate) {
              onDataUpdate(payload); // Correction: transmettre le payload
            }
          }}
        />
      </TabsContent>
      <TabsContent value="documents">
        <DocumentsTab
          projectDocuments={projectDocuments}
          formatDate={formatDate}
        />
      </TabsContent>
      <TabsContent value="milestones">
        <MilestonesTab
          projectMilestones={projectMilestones.map(milestone => ({
            ...milestone,
            inProgress: milestone.completed === false // Ajouter la propriété manquante
          }))}
          formatDate={formatDate}
          onDataUpdate={(updatedMilestones) => {
            // Mettez à jour l'état global des jalons ici
            // Par exemple: setProjectMilestones(updatedMilestones)
            if (onDataUpdate) {
              onDataUpdate({ type: "milestones", data: updatedMilestones });
            }
          }}
        />
      </TabsContent>
      <TabsContent value="planning">
        <PlanningTab
          projectId={projectId}
          descriptifData={localDescriptifData}
          startDate={startDate}
          endDate={endDate}
          onTaskUpdate={handleTaskDateUpdate}
        />
      </TabsContent>
      <TabsContent value="reports">
        <ReportsTab projectId={projectId} formatDate={formatDate} />
      </TabsContent>

      <TabsContent value="annotations">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              Annotations du projet ({projectAnnotations?.length || 0})
            </h2>
            <Button
              onClick={() => navigate(`/projects/${projectId}/annotations`)}>
              Gérer les annotations
            </Button>
          </div>

          {projectAnnotations && projectAnnotations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Commentaire</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectAnnotations.map((annotation) => (
                  <TableRow key={annotation.id}>
                    <TableCell>{annotation.documentName}</TableCell>
                    <TableCell>
                      {annotation.comment || "Aucun commentaire"}
                    </TableCell>
                    <TableCell>
                      {annotation.resolved ? (
                        <Badge className="bg-green-500">Résolu</Badge>
                      ) : (
                        <Badge className="bg-yellow-500">En attente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/projects/${projectId}/annotations?documentId=${annotation.documentId}&annotationId=${annotation.id}`
                          )
                        }>
                        Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-8 border rounded-md bg-muted/50">
              <p className="text-muted-foreground">
                Aucune annotation pour ce projet
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate(`/projects/${projectId}/annotations`)}>
                Ajouter une annotation
              </Button>
            </div>
          )}
        </div>
      </TabsContent>


   

<TabsContent value="descriptif">
  <div className="p-6 flex flex-col items-center justify-center">
    <div className="relative">
      {/* Badge indiquant si le descriptif existe - IMPLEMENTATION AMÉLIORÉE */}
      {(() => {
        // Vérifier le descriptif local
        const hasLocalDescriptif = localDescriptifData && localDescriptifData.length > 0;
        
        // Vérifier dans le localStorage s'il y a des rapports avec descriptif
        let hasReportWithDescriptif = false;
        try {
          const reportsJSON = localStorage.getItem('siteVisitReports');
          if (reportsJSON) {
            const reports = JSON.parse(reportsJSON);
            hasReportWithDescriptif = reports.some(r => 
              r.projectId === projectId && 
              r.descriptif && 
              Array.isArray(r.descriptif) && 
              r.descriptif.length > 0
            );
          }
        } catch (error) {
          console.error("Erreur lors de la vérification des rapports:", error);
        }
        
        // Afficher le badge approprié selon la présence d'un descriptif
        return hasLocalDescriptif || hasReportWithDescriptif ? (
          <span className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-10">
            {localDescriptifData.length} lot(s)
          </span>
        ) : (
          <span className="absolute -top-3 -right-3 bg-amber-500 text-white text-xs px-2 py-1 rounded-full z-10">
            À créer
          </span>
        );
      })()}

      {/* Icône cliquable avec effet de survol amélioré */}
      <div
        className="relative cursor-pointer group"
        onClick={() => navigate(`/projects/${projectId}/descriptif`)}
      >
        <ClipboardPen 
          className={`w-[190px] h-[114px] transition-colors ${
            localDescriptifData && localDescriptifData.length > 0
              ? "text-primary" 
              : "text-muted-foreground"
          } hover:text-primary/80`}
        />

        {/* Reflet pour indiquer qu'un descriptif existe */}
        {localDescriptifData && localDescriptifData.length > 0 && (
          <div className="absolute top-1 right-1 w-6 h-6 bg-white/30 rounded-full blur-sm"></div>
        )}

        {/* Texte qui apparaît au survol */}
        <span
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2
          bg-background/90 px-4 py-2 rounded-md shadow-lg
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          text-sm font-medium whitespace-nowrap"
        >
          {localDescriptifData && localDescriptifData.length > 0 
            ? "Ouvrir le descriptif détaillé" 
            : "Créer un nouveau descriptif"}
        </span>
      </div>
    </div>

    <p className="text-muted-foreground mt-12 text-sm">
      {(() => {
        // Même vérification que pour le badge
        const hasLocalDescriptif = localDescriptifData && localDescriptifData.length > 0;
        
        let hasReportWithDescriptif = false;
        try {
          const reportsJSON = localStorage.getItem('siteVisitReports');
          if (reportsJSON) {
            const reports = JSON.parse(reportsJSON);
            hasReportWithDescriptif = reports.some(r => 
              r.projectId === projectId && 
              r.descriptif && 
              Array.isArray(r.descriptif) && 
              r.descriptif.length > 0
            );
          }
        } catch (error) {
          console.error("Erreur lors de la vérification des rapports:", error);
        }
        
        return hasLocalDescriptif || hasReportWithDescriptif ? (
          <>
            <span className="font-medium text-foreground">Descriptif disponible</span> - 
            {' '}{localDescriptifData.length} lot{localDescriptifData.length > 1 ? 's' : ''} défini{localDescriptifData.length > 1 ? 's' : ''}
          </>
        ) : (
          "Aucun descriptif n'a encore été créé pour ce projet"
        );
      })()}
    </p>

    {/* Ajouter des informations supplémentaires si un descriptif existe */}
    {localDescriptifData && localDescriptifData.length > 0 && (
      <div className="mt-2 text-xs text-muted-foreground">
        Cliquez sur l'icône pour modifier le descriptif
      </div>
    )}
  </div>
</TabsContent>
    </Tabs>
  );
};
