import { Project } from "@/features/projects/types/project";
import { createApiClient } from "@/features/common/services/apiClient";
import { ProjectMilestone } from "@/app/styles";

// Service pour gérer les projets avec l'API Railway
export const projectService = {
  // Récupérer tous les projets
  getAllProjects: async (): Promise<Project[]> => {
    const api = createApiClient();
    return await api.get<Project[]>("/projects");
  },
  
  // Récupérer un projet par son ID
  getProjectById: async (id: string): Promise<Project | null> => {
    const api = createApiClient();
    return await api.get<Project>(`/projects/${id}`);
  },
  
  // Ajouter un nouveau projet
  addProject: async (project: Omit<Project, "id">): Promise<Project> => {
    const api = createApiClient();
    return await api.post<Project>("/projects", project);
  },
  
  // Mettre à jour un projet existant
  updateProject: async (id: string, updates: Partial<Project>): Promise<Project> => {
    const api = createApiClient();
    return await api.put<Project>(`/projects/${id}`, updates);
  },
  
  // Supprimer un projet
  deleteProject: async (id: string): Promise<boolean> => {
    const api = createApiClient();
    await api.delete(`/projects/${id}`);
    return true;
  },
  
  // Récupérer les jalons d'un projet
  getProjectMilestones: async (projectId: string): Promise<ProjectMilestone[]> => {
    const api = createApiClient();
    return await api.get<ProjectMilestone[]>(`/projects/${projectId}/milestones`);
  },
  
  // Mettre à jour les jalons d'un projet
  updateProjectMilestones: async (
    projectId: string, 
    milestones: ProjectMilestone[]
  ): Promise<ProjectMilestone[]> => {
    const api = createApiClient();
    return await api.put<ProjectMilestone[]>(`/projects/${projectId}/milestones`, milestones);
  }
};

// Exporter les fonctions individuelles pour la compatibilité avec le code existant
export const getAllProjects = projectService.getAllProjects;
export const getProjectById = projectService.getProjectById;
export const addProject = projectService.addProject;
export const updateProject = projectService.updateProject;
export const deleteProject = projectService.deleteProject;
export const getProjectMilestones = projectService.getProjectMilestones;
export const updateProjectMilestones = projectService.updateProjectMilestones;

export async function uploadProjectImage(projectId: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${import.meta.env.VITE_API_URL}/projects/${projectId}/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include', // si besoin d'envoyer les cookies d'auth
  });

  if (!response.ok) {
    throw new Error('Erreur lors de l\'upload');
  }

  const data = await response.json();
  return data.imageUrl;
}