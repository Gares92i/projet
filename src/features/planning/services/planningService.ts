import { Task, Group, ExportOptions } from "@/features/planning/types/planning";
import { TaskProgress } from "@/app/styles";
import { createApiClient } from "@/features/common/services/apiClient";

export const planningService = {
  // Récupérer toutes les tâches d'un planning de projet
  getProjectPlanning: async (projectId: string): Promise<{ tasks: Task[], groups: Group[] }> => {
    const api = createApiClient();

    try {
      const planning = await api.get<{ tasks: Task[], groups: Group[] }>(
        `/projects/${projectId}/planning`
      );
      return planning;
    } catch (error) {
      console.error(`Erreur lors de la récupération du planning du projet ${projectId}:`, error);
      
      // Fallback sur localStorage
      const stored = localStorage.getItem(`project_${projectId}_planning`);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Valeur par défaut si rien n'est stocké
      return { tasks: [], groups: [] };
    }
  },
  
  // Sauvegarder le planning complet
  savePlanning: async (
    projectId: string, 
    planning: { tasks: Task[], groups: Group[] }
  ): Promise<boolean> => {
    const api = createApiClient();
    
    try {
      await api.put(`/projects/${projectId}/planning`, planning);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde du planning du projet ${projectId}:`, error);
      
      // Fallback: sauvegarde locale
      localStorage.setItem(`project_${projectId}_planning`, JSON.stringify(planning));
      return true;
    }
  },
  
  // Ajouter une tâche au planning
  addTask: async (projectId: string, task: Omit<Task, "id">): Promise<Task> => {
    const api = createApiClient();
    
    try {
      return await api.post<Task>(`/projects/${projectId}/planning/tasks`, task);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tâche au planning:", error);
      
      // Fallback: ajout local
      const stored = localStorage.getItem(`project_${projectId}_planning`);
      const planning = stored ? JSON.parse(stored) : { tasks: [], groups: [] };
      
      const newTask = {
        ...task,
        id: `local-${Date.now()}`
      } as Task;
      
      planning.tasks.push(newTask);
      localStorage.setItem(`project_${projectId}_planning`, JSON.stringify(planning));
      
      return newTask;
    }
  },
  
  // Ajouter un groupe au planning
  addGroup: async (projectId: string, group: Omit<Group, "id">): Promise<Group> => {
    const api = createApiClient();
    
    try {
      return await api.post<Group>(`/projects/${projectId}/planning/groups`, group);
    } catch (error) {
      console.error("Erreur lors de l'ajout du groupe au planning:", error);
      
      // Fallback: ajout local
      const stored = localStorage.getItem(`project_${projectId}_planning`);
      const planning = stored ? JSON.parse(stored) : { tasks: [], groups: [] };
      
      const newGroup = {
        ...group,
        id: `local-${Date.now()}`
      } as Group;
      
      planning.groups.push(newGroup);
      localStorage.setItem(`project_${projectId}_planning`, JSON.stringify(planning));
      
      return newGroup;
    }
  },
  
  // Mettre à jour une tâche existante
  updateTask: async (projectId: string, taskId: string, updates: Partial<Task>): Promise<Task> => {
    const api = createApiClient();
    
    try {
      return await api.put<Task>(`/projects/${projectId}/planning/tasks/${taskId}`, updates);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la tâche ${taskId}:`, error);
      
      // Fallback: mise à jour locale
      const stored = localStorage.getItem(`project_${projectId}_planning`);
      if (!stored) throw error;
      
      const planning = JSON.parse(stored);
      const taskIndex = planning.tasks.findIndex((t: Task) => t.id === taskId);
      
      if (taskIndex === -1) throw new Error(`Tâche ${taskId} non trouvée`);
      
      planning.tasks[taskIndex] = {
        ...planning.tasks[taskIndex],
        ...updates
      };
      
      localStorage.setItem(`project_${projectId}_planning`, JSON.stringify(planning));
      
      return planning.tasks[taskIndex];
    }
  },
  
  // Récupérer les avancements de lots depuis le planning
  getTaskProgressFromPlanning: async (projectId: string): Promise<TaskProgress[]> => {
    try {
      console.log(`Récupération des avancements de lots depuis la planification pour le projet ${projectId}`);
      
      // Récupérer les données du planning
      const savedData = localStorage.getItem(`project_${projectId}_planning`);
      if (!savedData) {
        console.log("Aucune donnée de planning trouvée dans le localStorage");
        return [];
      }
      
      // Parser les données sauvegardées
      const planningData = JSON.parse(savedData);
      
      // Vérifier si les données sont valides
      if (!planningData.groups || !planningData.items) {
        console.log("Structure de données de planning invalide");
        return [];
      }
      
      const { groups, items } = planningData;
      const tasks: TaskProgress[] = [];

      // Trouver tous les lots (groupes sans parentId)
      const lots = groups.filter(group => !group.parentId);
      
      lots.forEach(lot => {
        const lotId = lot.id;
        // Récupérer le titre du lot sans le numéro
        const lotTitle = lot.title.includes(". ") ? lot.title.split(". ")[1] : lot.title;
        const lotColor = lot.lotColor;
        const lotNumber = lot.title.split(". ")[0];
        
        // Trouver l'item d'en-tête du lot pour voir sa progression
        const lotHeaderItem = items.find(item => item.group === lotId && item.isHeader);
        
        // Trouver toutes les tâches de ce lot
        const lotTasks = items.filter(item => {
          const taskGroupId = item.group;
          const taskGroup = groups.find(g => g.id === taskGroupId);
          return taskGroup && taskGroup.parentId === lotId;
        });
        
        // Calculer la progression moyenne du lot
        let progress = 0;
        if (lotTasks.length > 0) {
          progress = Math.round(
            lotTasks.reduce((sum, task) => sum + (task.progress || 0), 0) /
            lotTasks.length
          );
        } else if (lotHeaderItem && lotHeaderItem.progress !== undefined) {
          progress = lotHeaderItem.progress;
        }
        
        // Ajouter le lot à la liste des tâches
        tasks.push({
          id: lotId,
          number: lotNumber,
          title: lotTitle,
          progress: progress,
          color: lotColor || getDefaultLotColor(lotNumber)
        });
      });
      
      return tasks;
    } catch (error) {
      console.error("Erreur lors de la récupération des avancements depuis la planification:", error);
      return [];
    }
  },
  
  // Exporter le planning (génération PDF, etc.)
  exportPlanning: async (
    projectId: string, 
    options: ExportOptions
  ): Promise<string> => {
    const api = createApiClient();
    
    try {
      const response = await api.post<{ fileUrl: string }>(
        `/projects/${projectId}/planning/export`, 
        options
      );
      return response.fileUrl;
    } catch (error) {
      console.error("Erreur lors de l'export du planning:", error);
      throw new Error("L'export du planning a échoué. Veuillez réessayer plus tard.");
    }
  }
};

// Fonction utilitaire pour générer une couleur par défaut basée sur le numéro de lot
function getDefaultLotColor(lotNumber: string | number | undefined): string {
  const colors = [
    "#78909C", // Gris bleuté
    "#4CAF50", // Vert
    "#2196F3", // Bleu
    "#9C27B0", // Violet
    "#FF9800", // Orange
    "#F44336", // Rouge
    "#009688", // Turquoise
    "#795548", // Marron
    "#607D8B", // Bleu-gris
  ];
  
  if (lotNumber === undefined) {
    return colors[0];
  }
  
  const num = typeof lotNumber === 'string' ? 
    parseInt(lotNumber.replace(/\D/g, ''), 10) || 0 : 
    lotNumber || 0;
  
  return colors[num % colors.length];
}

// Exporter les fonctions individuelles pour la compatibilité avec le code existant
export const getProjectPlanning = planningService.getProjectPlanning;
export const savePlanning = planningService.savePlanning;
export const addPlanningTask = planningService.addTask;
export const addPlanningGroup = planningService.addGroup;
export const updatePlanningTask = planningService.updateTask;
export const exportPlanning = planningService.exportPlanning;
export const fetchTaskProgressFromPlanning = planningService.getTaskProgressFromPlanning;