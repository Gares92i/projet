import { Project } from "@/types/project";
import { createApiClient } from "./apiClient";

// Service pour gérer les projets avec l'API Railway
export const projectService = {
  // Récupérer tous les projets
  getAllProjects: async (): Promise<Project[]> => {
    const api = createApiClient();
    
    try {
      // Récupérer depuis l'API
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
      const stored = localStorage.getItem("projectsData");
      if (!stored) return null;
      
      const projects = JSON.parse(stored);
      return projects.find((p: Project) => p.id === id) || null;
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
      const stored = localStorage.getItem("projectsData");
      if (!stored) return false;
      
      const projects = JSON.parse(stored);
      const newProjects = projects.filter((p: Project) => p.id !== id);
      
      localStorage.setItem("projectsData", JSON.stringify(newProjects));
      return true;
    }
  }
};

// Exporter les fonctions individuelles pour la compatibilité avec le code existant
export const getAllProjects = projectService.getAllProjects;
export const getProjectById = projectService.getProjectById;
export const addProject = projectService.addProject;
export const updateProject = projectService.updateProject;
export const deleteProject = projectService.deleteProject;