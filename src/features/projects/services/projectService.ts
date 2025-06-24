import { Project } from "@/features/projects/types/project";
import { createApiClient } from "@/features/common/services/apiClient";
import { ProjectMilestone } from "@/app/styles";

// Service pour gérer les projets avec l'API Railway
export const projectService = {
  // Récupérer tous les projets
  getAllProjects: async (): Promise<Project[]> => {
    const api = createApiClient();
    
    try {
      return await api.get<Project[]>("/projects");
    } catch (error) {
      console.error("Erreur lors de la récupération des projets:", error);
      
      // Fallback sur localStorage en cas d'erreur
      const stored = localStorage.getItem("projectsData");
      return stored ? JSON.parse(stored) : [];
    }
  },
  
  // Récupérer un projet par son ID
  getProjectById: async (id: string): Promise<Project | null> => {
    const api = createApiClient();
    
    try {
      return await api.get<Project>(`/projects/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la récupération du projet ${id}:`, error);
      
      // Fallback sur localStorage
      try {
        const stored = localStorage.getItem("projectsData");
        if (!stored) return null;
        
        const projects = JSON.parse(stored);
        return projects.find((p: Project) => p.id === id) || null;
      } catch (localError) {
        console.error("Erreur lors de la récupération locale du projet:", localError);
        return null;
      }
    }
  },
  
  // Ajouter un nouveau projet
  addProject: async (project: Omit<Project, "id">): Promise<Project> => {
    const api = createApiClient();
    
    try {
      return await api.post<Project>("/projects", project);
    } catch (error) {
      console.error("Erreur lors de l'ajout du projet:", error);
      
      // Fallback: création locale temporaire
      try {
        const newProject = {
          ...project,
          id: `local-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Stocker localement
        const stored = localStorage.getItem("projectsData");
        const projects = stored ? JSON.parse(stored) : [];
        projects.push(newProject);
        localStorage.setItem("projectsData", JSON.stringify(projects));
        
        return newProject as Project;
      } catch (localError) {
        console.error("Erreur lors de la création locale du projet:", localError);
        throw error;
      }
    }
  },
  
  // Mettre à jour un projet existant
  updateProject: async (id: string, updates: Partial<Project>): Promise<Project> => {
    const api = createApiClient();
    
    try {
      return await api.put<Project>(`/projects/${id}`, updates);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du projet ${id}:`, error);
      
      // Fallback: mise à jour locale
      try {
        const stored = localStorage.getItem("projectsData");
        if (!stored) throw error;
        
        const projects = JSON.parse(stored);
        const index = projects.findIndex((p: Project) => p.id === id);
        
        if (index === -1) throw new Error(`Projet ${id} non trouvé`);
        
        const updatedProject = {
          ...projects[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        projects[index] = updatedProject;
        localStorage.setItem("projectsData", JSON.stringify(projects));
        
        return updatedProject;
      } catch (localError) {
        console.error("Erreur lors de la mise à jour locale du projet:", localError);
        throw error;
      }
    }
  },
  
  // Supprimer un projet
  deleteProject: async (id: string): Promise<boolean> => {
    const api = createApiClient();
    
    try {
      await api.delete(`/projects/${id}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du projet ${id}:`, error);
      
      // Fallback: suppression locale
      try {
        const stored = localStorage.getItem("projectsData");
        if (!stored) return false;
        
        const projects = JSON.parse(stored);
        const newProjects = projects.filter((p: Project) => p.id !== id);
        
        localStorage.setItem("projectsData", JSON.stringify(newProjects));
        return true;
      } catch (localError) {
        console.error("Erreur lors de la suppression locale du projet:", localError);
        return false;
      }
    }
  },
  
  // Récupérer les jalons d'un projet
  getProjectMilestones: async (projectId: string): Promise<ProjectMilestone[]> => {
    const api = createApiClient();
    
    try {
      return await api.get<ProjectMilestone[]>(`/projects/${projectId}/milestones`);
    } catch (error) {
      console.error(`Erreur lors de la récupération des jalons du projet ${projectId}:`, error);
      
      // Fallback sur localStorage
      try {
        const stored = localStorage.getItem(`project_${projectId}_milestones`);
        
        if (stored) return JSON.parse(stored);
        
        // Si pas de jalons spécifiques, vérifier dans les données du projet
        const project = await projectService.getProjectById(projectId);
        if (project && project.milestones) {
          return project.milestones;
        }
        
        return [];
      } catch (localError) {
        console.error("Erreur lors de la récupération locale des jalons:", localError);
        return [];
      }
    }
  },
  
  // Mettre à jour les jalons d'un projet
  updateProjectMilestones: async (
    projectId: string, 
    milestones: ProjectMilestone[]
  ): Promise<ProjectMilestone[]> => {
    const api = createApiClient();
    
    try {
      return await api.put<ProjectMilestone[]>(`/projects/${projectId}/milestones`, milestones);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour des jalons du projet ${projectId}:`, error);
      
      // Fallback: mise à jour locale
      try {
        // Sauvegarder dans le stockage dédié aux jalons
        localStorage.setItem(`project_${projectId}_milestones`, JSON.stringify(milestones));
        
        // Aussi mettre à jour les jalons dans l'objet projet si possible
        const stored = localStorage.getItem("projectsData");
        
        if (stored) {
          const projects = JSON.parse(stored);
          const index = projects.findIndex((p: Project) => p.id === projectId);
          
          if (index !== -1) {
            projects[index] = {
              ...projects[index],
              milestones,
              updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem("projectsData", JSON.stringify(projects));
          }
        }
        
        return milestones;
      } catch (localError) {
        console.error("Erreur lors de la mise à jour locale des jalons:", localError);
        throw error;
      }
    }
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