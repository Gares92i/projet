import { Task, Group, ExportOptions } from "@/components/project/types/planning";
import { createApiClient } from "./apiClient";

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

// Exporter les fonctions individuelles pour la compatibilité avec le code existant
export const getProjectPlanning = planningService.getProjectPlanning;
export const savePlanning = planningService.savePlanning;
export const addPlanningTask = planningService.addTask;
export const addPlanningGroup = planningService.addGroup;
export const updatePlanningTask = planningService.updateTask;
export const exportPlanning = planningService.exportPlanning;