import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/features/layout/components/MainLayout";
import { getTasksByProjectId } from "@/features/tasks/services/taskService";
import { getProjectById, getProjectMilestones, updateProjectMilestones } from "@/features/projects/services/projectService";
import { getProjectMembers } from "@/features/team/services/teamProjectRelationService";
import { Task } from "@/features/projects/types/gantt";
import { toast } from "sonner";
import { ProjectHeader } from "@/features/projects/components/ProjectHeader";
import { ProjectDetailsCard } from "@/features/projects/components/ProjectDetailsCard";
import { ProjectBudgetCard } from "@/features/projects/components/ProjectBudgetCard";
import { ProjectProgressCard } from "@/features/projects/components/ProjectProgressCard";
import { ProjectTabs } from "@/features/projects/components/ProjectTabs";
import { ProjectImageCard } from "@/features/projects/components/edit/ProjectImageCard";
import { getProjectAnnotations } from "@/features/annotations/services/annotationService";
import { ProjectCardProps as UIProjectCardProps } from "@/features/projects/components/ProjectCard";
import { Skeleton } from "@/ui/skeleton";
import { TeamMember } from "@/features/team/types/team";
import { ProjectMilestone } from "@/features/projects/types/project";
import { Annotation } from "@/features/annotations/types/annotation";


// Interface locale pour MilestoneInfo
interface MilestoneInfo {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  inProgress?: boolean;
}

// Ajouter cette interface après les imports
interface LotTravaux {
  id: string;
  name: string;
  tasks: {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }[];
}

// Créer une interface pour définir la structure du payload avec des types discriminés
interface MilestonesUpdatePayload {
  type: "milestones";
  data: ProjectMilestone[];
}

interface TeamUpdatePayload {
  type: "team";
  data: TeamMember[];
}

interface DescriptifUpdatePayload {
  type: "descriptif";
  data: LotTravaux[];
}

// Union de tous les types de payload possibles
type ProjectDataUpdatePayload = MilestonesUpdatePayload | TeamUpdatePayload | DescriptifUpdatePayload;

// Ajoutez cette interface avant la fonction loadAnnotations
interface AnnotationDocument {
  id: string;
  name: string;
  annotations: Annotation[];
  path?: string;
  type?: string;
  url?: string;
}

// Fonction de chargement des annotations avec le type défini
function loadAnnotations(projectId: string): Annotation[] {
  try {
    // Récupérer l'état complet des annotations
    const key = `project_${projectId}_annotationsState`;
    const savedState = localStorage.getItem(key);
    if (!savedState) return [];
    
    const parsedState = JSON.parse(savedState);
    if (!parsedState || !parsedState.documents) return [];

    // Extraire toutes les annotations de tous les documents en utilisant le type défini
    const allAnnotations: Annotation[] = [];
    Object.values(parsedState.documents).forEach((doc: AnnotationDocument) => {
      if (doc.annotations && Array.isArray(doc.annotations)) {
        doc.annotations.forEach((ann: Annotation) => {
          // Ajouter le nom du document à l'annotation pour l'affichage
          allAnnotations.push({
            ...ann,
            documentName: doc.name || "Sans nom"
          });
        });
      }
    });
    
    console.log(`Chargé ${allAnnotations.length} annotations pour le projet ${projectId}`);
    return allAnnotations;
  } catch (error) {
    console.error("Erreur lors du chargement des annotations:", error);
    return [];
  }
}

// Fonction pour convertir les données de l'API en type compatible avec l'interface UI
const convertToProjectCardProps = (data: any): UIProjectCardProps => {
  // Validation que status est une valeur autorisée
  const validStatuses = ["planning", "design", "construction", "completed", "on-hold"];
  const status = validStatuses.includes(data.status) 
    ? data.status as "planning" | "design" | "construction" | "completed" | "on-hold"
    : "planning"; // Valeur par défaut si invalide
  
  return {
    ...data,
    status,
    // S'assurer que teamMembers est un tableau valide
    teamMembers: Array.isArray(data.teamMembers) ? data.teamMembers : [],
    // Garantir que les champs optionnels sont corrects
    progress: typeof data.progress === 'number' ? data.progress : 0,
    projectType: data.projectType || "",
    projectArea: data.projectArea || undefined,
    roomCount: data.roomCount || undefined
  };
};

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<UIProjectCardProps | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]); // Ajout de l'état pour les membres d'équipe
  const [projectAnnotations, setProjectAnnotations] = useState<Annotation[]>(
    []
  ); // États pour stocker les données
  const [projectMilestones, setProjectMilestones] = useState<
    ProjectMilestone[]
  >([]);
  const [descriptifData, setDescriptifData] = useState<LotTravaux[]>([]); // Ajout de l'état pour le descriptif
  const [loading, setLoading] = useState(true);

  // Utiliser une référence pour suivre l'état précédent
  const prevDataRef = useRef(null);

  // Ajouter cette variable de référence en haut du composant ProjectDetails
  const lastDescriptifUpdateRef = useRef<string>("");

  // Déclarer refreshProjectData AVANT son utilisation dans useEffect
  const refreshProjectData = useCallback(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);

        if (!id) return;

        // Récupérer les données du projet
        const projectData = await getProjectById(id);

        // Comparer avec l'état précédent avant de mettre à jour
        if (
          JSON.stringify(prevDataRef.current) !== JSON.stringify(projectData)
        ) {
          prevDataRef.current = projectData;

         if (projectData) {
  setProject(convertToProjectCardProps(projectData));
            // Charger les tâches du projet
            const projectTasks = await getTasksByProjectId(id);
            setTasks(projectTasks);

            // Charger les membres du projet
            const members = await getProjectMembers(id);
            setTeamMembers(members);

            // Récupérer les jalons du projet depuis l'API
            const milestones = await getProjectMilestones(id);
            setProjectMilestones(milestones);
          } else {
            toast.error("Projet non trouvé");
            navigate("/projects");
          }
        }

        // Utiliser le service pour charger les annotations
        const annotations = await getProjectAnnotations(id);
        setProjectAnnotations(annotations);
        console.log(
          `${annotations.length} annotations chargées pour le projet ${id}`
        );
      } catch (error) {
        console.error(
          "Erreur lors du chargement des données du projet :",
          error
        );
        toast.error("Erreur lors du chargement des données du projet");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id, navigate]);

  useEffect(() => {
    console.log("État des annotations après chargement:", projectAnnotations);
  }, [projectAnnotations]);

  // Gestionnaire pour mettre à jour les jalons
  const handleMilestonesUpdate = async (
    updatedMilestones: ProjectMilestone[]
  ) => {
    try {
      const savedMilestones = await updateProjectMilestones(
        id || "",
        updatedMilestones
      );
      setProjectMilestones(savedMilestones);

      // Mettre à jour le projet avec les nouveaux jalons
      if (project) {
        setProject({
          ...project,
          milestones: savedMilestones,
        });
      }
    } catch (error) {
      console.error("Error updating milestones:", error);
      toast.error("Impossible de mettre à jour les jalons du projet");
    }
  };

  // Fonction de conversion pour transformer ProjectMilestone en MilestoneInfo
  const convertToMilestoneInfo = (milestones: ProjectMilestone[]): MilestoneInfo[] => {
    return milestones.map(milestone => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      dueDate: milestone.dueDate,
      completed: milestone.completed || false,
      inProgress: milestone.inProgress || false,
    }));
  };

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Créer des données vides pour les documents (à remplacer par l'API plus tard)
  const projectDocuments: any[] = [];

  // Filter milestones and documents by project ID
  const filteredMilestones = projectMilestones.filter(
    (milestone) => milestone.id && milestone.id.includes(id || "")
  );
  const filteredDocuments = projectDocuments.filter(
    (doc) => doc.projectId === id
  );

  // Modifier la fonction handleDataUpdate
  const handleDataUpdate = useCallback(
    (payload: ProjectDataUpdatePayload) => {
      console.log("Mise à jour reçue:", payload.type);

      // Ne déclencher refreshProjectData que pour certains types de mises à jour
      if (payload.type === "milestones" || payload.type === "team") {
        refreshProjectData();
      }

      // Pour le descriptif, ajouter une vérification pour éviter les mises à jour inutiles
      if (payload.type === "descriptif") {
        // Sérialiser les données pour comparaison
        const serializedData = JSON.stringify(payload.data);

        // Ne mettre à jour que si les données ont changé
        if (serializedData !== lastDescriptifUpdateRef.current) {
          console.log("Descriptif modifié, mise à jour de l'état");
          lastDescriptifUpdateRef.current = serializedData;
          setDescriptifData(payload.data);
        } else {
          console.log("Descriptif identique, mise à jour ignorée");
        }
      }
    },
    [refreshProjectData]
  );

  // Use the project ID for the stats to ensure we're showing project-specific data
  const [projectStats, setProjectStats] = useState({
    budgetTotal: 750000,
    budgetUsed: 425000,
    timelineProgress: 58,
    tasksCompleted: 12,
    tasksInProgress: 8,
    tasksTodo: 15,
    documentsCount: 24,
    commentsCount: 37,
    meetingsCount: 8,
    projectId: id || "",
    projectType: project?.projectType || "Appartement", // Valeur par défaut ou issue du projet
    projectArea: project?.projectArea || 120, // Valeur par défaut ou issue du projet
    roomCount: project?.roomCount || 4, // Valeur par défaut ou issue du projet
  });

  const projectSpecificStats = {
    ...projectStats,
    projectId: id || "",
  };

  // Ajouter cette fonction dans le composant ProjectDetails
  const handleBudgetUpdate = useCallback(
    (updatedBudget: { budgetTotal: number; budgetUsed: number }) => {
      console.log("Budget mis à jour:", updatedBudget);

      // Mettre à jour l'état local
      setProjectStats((prev) => ({
        ...prev,
        budgetTotal: updatedBudget.budgetTotal,
        budgetUsed: updatedBudget.budgetUsed,
      }));

      // Sauvegarder dans le stockage local pour persistance
      localStorage.setItem(
        `project_${id}_budget`,
        JSON.stringify(updatedBudget)
      );

      // Optionnel: appeler une API pour sauvegarder côté serveur
      // saveProjectBudget(id, updatedBudget);

      toast.success("Budget mis à jour avec succès");
    },
    [id]
  );

  // Remplacer l'import statique
  // import { projectStats } from "@/features/projects/components/ProjectData";

  // Par un état local
  useEffect(() => {
    // Dans le useEffect principal, ajoutez ce code
    // Charger le budget sauvegardé
    const savedBudget = localStorage.getItem(`project_${id}_budget`);
    if (savedBudget) {
      try {
        const parsedBudget = JSON.parse(savedBudget);
        setProjectStats((prev) => ({
          ...prev,
          budgetTotal: parsedBudget.budgetTotal,
          budgetUsed: parsedBudget.budgetUsed,
        }));
      } catch (error) {
        console.error("Erreur lors du chargement du budget:", error);
      }
    }
  }, [id]);

  return (
    <MainLayout>
      <ProjectHeader project={project} />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ProjectDetailsCard project={project} formatDate={formatDate} />
          <ProjectBudgetCard
            stats={projectStats}
            onUpdateBudget={handleBudgetUpdate}
          />
          <ProjectProgressCard
            stats={projectSpecificStats}
            projectId={id || ""}
          />
          <ProjectImageCard
            imageUrl={project?.imageUrl}
            projectName={project?.name || "Projet"}
            projectId={id || ""}
            onImageUploaded={(imageUrl) => {
              if (project) {
                setProject({ ...project, imageUrl });
              }
            }}
          />
        </div>
      )}

      <ProjectTabs
        projectId={id || ""}
        projectTasks={tasks}
        teamMembers={teamMembers}
        projectMilestones={convertToMilestoneInfo(filteredMilestones)}
        projectDocuments={filteredDocuments}
        projectStats={projectSpecificStats}
        tasks={tasks}
        formatDate={formatDate}
        projectAnnotations={projectAnnotations}
        descriptifData={descriptifData}
        startDate={project?.startDate}
        endDate={project?.endDate}
        onDataUpdate={handleDataUpdate}
      />

     
      
    </MainLayout>
  );
};

export default ProjectDetails;
