import { ProjectMilestone } from "./index";

export interface PlanningItem {
  id: string;
  title: string;
  startDate: string;      // Format ISO "YYYY-MM-DD" ou "YYYY-MM-DDTHH:mm:ss.sssZ"
  endDate: string;        // Format ISO "YYYY-MM-DD" ou "YYYY-MM-DDTHH:mm:ss.sssZ"
  description?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'delayed';
  projectId: string;
  color?: string;         // Pour la visualisation (optionnel)
  group?: string;         // Pour le regroupement des éléments (optionnel)

  // Relations avec d'autres entités
  milestoneId?: string;   // Lien éventuel avec un jalon
  taskId?: string;        // Lien éventuel avec une tâche
  assignees?: string[];   // IDs des personnes assignées
  
  // Métadonnées
  createdAt?: string;
  updatedAt?: string;
}

// Types auxiliaires si nécessaire
export interface PlanningGroup {
  id: string;
  name: string;
  color?: string;
}