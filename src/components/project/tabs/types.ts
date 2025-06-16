import { Document } from "@/components/DocumentsList";
import { Task } from "@/components/gantt/types";
import { Annotation } from "@/types";
import { TeamMember as BaseTeamMember } from '@/types/team';

// Modifier la définition actuelle pour utiliser le type central
export type TeamMember = BaseTeamMember;

// Alternative: si vous voulez garder certaines propriétés spécifiques à l'UI
// export interface TeamMember extends BaseTeamMember {
//   // Propriétés supplémentaires spécifiques à l'UI si nécessaire
//   isSelected?: boolean;
// }

export interface ProjectMilestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  projectId: string;
}

export interface ProjectStats {
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
}
