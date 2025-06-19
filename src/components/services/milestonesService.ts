import { ProjectMilestone } from '@/types/project';

// Base de données simulée pour les jalons
const milestonesDB: Record<string, ProjectMilestone[]> = {};

// Obtenir tous les jalons d'un projet
export const getMilestonesByProjectId = async (projectId: string): Promise<ProjectMilestone[]> => {
  return milestonesDB[projectId] || [];
};

// Ajouter ou mettre à jour les jalons d'un projet
export const updateProjectMilestones = async (projectId: string, milestones: ProjectMilestone[]): Promise<ProjectMilestone[]> => {
  milestonesDB[projectId] = milestones;
  return milestones;
};

// Obtenir le jalon en cours d'un projet
export const getCurrentMilestone = async (projectId: string): Promise<ProjectMilestone | null> => {
  const milestones = milestonesDB[projectId] || [];
  return milestones.find(m => m.inProgress) || null;
};

// Obtenir le prochain jalon non commencé d'un projet
export const getNextMilestone = async (projectId: string): Promise<ProjectMilestone | null> => {
  const milestones = milestonesDB[projectId] || [];
  return milestones.find(m => !m.completed && !m.inProgress) || null;
};