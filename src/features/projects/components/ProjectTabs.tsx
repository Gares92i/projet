import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { ProjectOverviewTab } from "./ProjectOverviewTab";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/ui/table";
import { Badge } from "@/ui/badge";
import { TasksTab } from "./tabs/TasksTab";
import { TeamTab } from "./tabs/TeamTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { MilestonesTab } from "./tabs/MilestonesTab";
import { ReportsTab } from "./tabs/ReportsTab";
import { AnnotationsTab } from "./tabs/AnnotationsTab";
import { PlanningTab } from "@/features/planning/components/PlanningTab";
import { Task } from "@/features/projects/types/gantt";
import { Document } from "@/features/documents/components/DocumentsList";
import { Annotation } from "@/features/annotations/types/annotation";
import { TeamMember } from "@/features/team/types/team";
import { ClipboardPen } from "lucide-react";

// Types locaux pour éviter les imports manquants
interface ProjectMilestone {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed?: boolean;
  inProgress?: boolean;
}

interface ProjectStats {
  budgetTotal: number;
  budgetUsed: number;
  timelineProgress: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksTodo: number;
  documentsCount: number;
  commentsCount: number;
  meetingsCount: number;
  projectId: string;
  projectType?: string;
  projectArea?: number;
  roomCount?: number;
}
import { Button } from "@/ui/button";
import { useNavigate } from "react-router-dom";
import { LotTravaux, DescriptifData } from "@/features/projects/types/project";
import { useLocalStorage } from '@/features/storage/hooks/useLocalStorage';

type DataUpdatePayload =
  | { type: "milestones"; data: ProjectMilestone[] }
  | { type: "team"; data: TeamMember[] }
  | { type: "documents"; data: Document[] }
  | { type: "annotations"; data: Annotation[] }
  | { type: "descriptif"; data: LotTravaux[] };

interface ProjectTabsProps {
  projectId: string;
  projectTasks: Task[];
  teamMembers: TeamMember[];
  projectMilestones: any[];
  projectDocuments: Document[];
  projectStats: ProjectStats;
  tasks: Task[];
  formatDate: (dateString: string) => string;
  projectAnnotations: Annotation[];
  onDataUpdate?: (payload?: DataUpdatePayload) => void;
  descriptifData?: LotTravaux[];
  startDate?: string;
  endDate?: string;
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
  projectAnnotations,
  onDataUpdate,
  descriptifData = [],
  startDate,
  endDate,
}: ProjectTabsProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const [localDescriptifData, setLocalDescriptifData] = useLocalStorage<LotTravaux[]>(
    `descriptif-data-${projectId}`,
    descriptifData.length > 0 ? descriptifData : []
  );

  const [planningDates, setPlanningDates] = useLocalStorage(
    `planning-dates-${projectId}`,
    {}
  );

  const prevDescriptifDataRef = useRef<string>("");

  useEffect(() => {
    if (activeTab !== "descriptif") return;

    const storedDescriptifData = localStorage.getItem(`descriptif-data-${projectId}`);
    if (!storedDescriptifData) return;

    try {
      const parsedData = JSON.parse(storedDescriptifData);
      if (!Array.isArray(parsedData)) return;

      const parsedDataStr = JSON.stringify(parsedData);
      const currentLocalData = JSON.stringify(localDescriptifData);

      if (parsedDataStr !== currentLocalData && parsedDataStr !== prevDescriptifDataRef.current) {
        console.log("Nouvelles données descriptif détectées, mise à jour locale");
        setLocalDescriptifData(parsedData);

        prevDescriptifDataRef.current = parsedDataStr;

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
  }, [activeTab, projectId]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleDescriptifUpdate = (updatedData: LotTravaux[]) => {
    setLocalDescriptifData(updatedData);

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
        <TabsTrigger value="planning">Planning</TabsTrigger>
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
          handleNavigateToMilestonesPage={() => setActiveTab("milestones")}
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
              onDataUpdate(payload);
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
            completed: milestone.completed || false,
            inProgress: milestone.completed === false
          }))}
          formatDate={formatDate}
          onDataUpdate={(updatedMilestones) => {
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
            {(() => {
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
                <span className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-10">
                  {localDescriptifData.length} lot(s)
                </span>
              ) : (
                <span className="absolute -top-3 -right-3 bg-amber-500 text-white text-xs px-2 py-1 rounded-full z-10">
                  À créer
                </span>
              );
            })()}

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

              {localDescriptifData && localDescriptifData.length > 0 && (
                <div className="absolute top-1 right-1 w-6 h-6 bg-white/30 rounded-full blur-sm"></div>
              )}

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
