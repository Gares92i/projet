import { Project } from "@/features/projects/types/project";
import { createApiClient } from "@/features/common/services/apiClient";
import { ProjectMilestone } from "@/features/projects/types/project";

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
    
    // Créer une copie des updates sans les images volumineuses
    const cleanUpdates: any = { ...updates };
    
    // Supprimer les champs d'image si ils contiennent des données volumineuses
    if (cleanUpdates.imageUrl && (
      cleanUpdates.imageUrl.startsWith('data:image/') || 
      cleanUpdates.imageUrl.startsWith('placeholder://') ||
      cleanUpdates.imageUrl.length > 1000 // Si l'URL est trop longue (probablement base64)
    )) {
      delete cleanUpdates.imageUrl;
    }
    
    if (cleanUpdates.image_url && (
      cleanUpdates.image_url.startsWith('data:image/') || 
      cleanUpdates.image_url.startsWith('placeholder://') ||
      cleanUpdates.image_url.length > 1000
    )) {
      delete cleanUpdates.image_url;
    }
    
    return await api.patch<Project>(`/projects/${id}`, cleanUpdates);
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
  const api = createApiClient();
  
  const formData = new FormData();
  formData.append('file', file);

  try {
    console.log(`Tentative d'upload d'image pour le projet ${projectId}:`, file.name, file.size, file.type);
    
    const response = await api.post<{ imageUrl: string }>(`/projects/${projectId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Upload réussi, URL reçue:', response.imageUrl);
    return response.imageUrl;
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    throw new Error(`Erreur lors de l'upload de l'image: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}