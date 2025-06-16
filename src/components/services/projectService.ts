import { toast } from "sonner";
import { TaskProgress } from "@/types";

// Type pour les projets
export interface ProjectCardProps {
  id: string;
  name: string;
  client: string;
  clientId: string;
  location: string;
  startDate?: string;
  endDate?: string;
  progress: number;
  status:  "planning" | "design" | "construction" | "completed" | "on-hold";
  teamSize: number;
  description: string;
   deadline: string;
  budget: number;
  tags: string[];
  teamMembers: string[] | TeamMemberInfo[];
  imageUrl?: string;
  milestones?: ProjectMilestone[];
}

// Si TeamMemberInfo n'est pas défini, ajoutez-le également :
export interface TeamMemberInfo {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

// Assurez-vous que cette interface est bien exportée
export interface ProjectMilestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  inProgress: boolean;  // Nouveau champ pour "en cours"
  projectId: string;
}

// Créer une fonction pour charger les projets depuis localStorage
const loadProjectsFromStorage = (): ProjectCardProps[] => {
  try {
    const savedProjects = localStorage.getItem('projectsData');
    if (savedProjects) {
      return JSON.parse(savedProjects);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des projets depuis localStorage:", error);
  }
  return [];
};

// Fonction pour sauvegarder les projets dans localStorage
const saveProjectsToStorage = (projects: ProjectCardProps[]): void => {
  try {
    // Limiter les données avant de sauvegarder
    const trimmedProjects = projects.map(project => {
      // Enlever les champs volumineux
      const { description, ...rest } = project;
      return {
        ...rest,
        description: description?.substring(0, 200) || ''
      };
    });

    localStorage.setItem('projectsData', JSON.stringify(trimmedProjects));
  } catch (error) {
    console.error("Erreur:", error);
    toast.error("Problème de stockage, certaines données pourraient être perdues");
  }
};

// Utiliser let au lieu de const pour permettre la réassignation
let projectsData: ProjectCardProps[] = loadProjectsFromStorage();

// Si aucun projet n'est défini, créer des données par défaut
if (projectsData.length === 0) {
  projectsData = [
    {
      id: "1",
      name: "Résidence Dupont",
      client: "Famille Dupont",
      clientId: "c1",
      description: "Construction d'une maison familiale de 150m²",
      status: "planning",
      progress: 35,
      imageUrl: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      teamMembers: ["1", "2"],
      teamSize: 2,
      deadline: "2023-12-31",
      location: "Paris, France",
      budget: 350000,
      tags: ["résidentiel", "neuf"]
    },
    // autres projets par défaut...
  ];
  saveProjectsToStorage(projectsData);
}

// Récupérer tous les projets
export const getAllProjects = async (): Promise<ProjectCardProps[]> => {
  try {
    // Simulation d'un appel API
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Projets récupérés:", projectsData.length);
        resolve([...projectsData]); // Retourne une copie pour éviter les problèmes de référence
      }, 300);
    }).then(projects => {
      // Avant de retourner les projets, normaliser les teamMembers
      return projects.map(project => ({
        ...project,
        teamMembers: project.teamMembers || []
      }));
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    return [];
  }
};

// Récupérer un projet par ID
export const getProjectById = async (id: string): Promise<ProjectCardProps | null> => {
  // Simulation d'un appel API
  return new Promise((resolve) => {
    const project = projectsData.find(p => p.id === id);
    setTimeout(() => resolve(project ? {...project} : null), 300); // Retourne une copie
  });
};

// Ajouter un nouveau projet
export const addProject = async (project: Omit<ProjectCardProps, "id">): Promise<ProjectCardProps> => {
  const newProject: ProjectCardProps = {
    ...project,
    id: Date.now().toString(), // Génération d'un ID unique
  };


  // S'assurer que tous les champs nécessaires sont présents
  if (!newProject.progress) newProject.progress = 0;
  if (!newProject.teamSize) newProject.teamSize = 0;
  if (!newProject.teamMembers) newProject.teamMembers = [];

  console.log("Ajout d'un nouveau projet:", newProject);

  projectsData = [...projectsData, newProject];
  saveProjectsToStorage(projectsData); // Sauvegarder dans localStorage

  // Ajouter le projet à chaque membre d'équipe associé
  if (newProject.teamMembers && newProject.teamMembers.length > 0) {
    for (const memberId of newProject.teamMembers) {
      await addProjectToMember(memberId, newProject.id);
    }
  }

  // Ajouter le projet au client
  if (newProject.clientId) {
    await addProjectToClient(newProject.clientId, newProject.id);
  }

  toast.success(`Projet "${newProject.name}" créé avec succès`);

  return {...newProject}; // Retourne une copie
};

// Mettre à jour un projet existant
export const updateProject = async (id: string, updates: Partial<ProjectCardProps>): Promise<ProjectCardProps> => {
  const projectIndex = projectsData.findIndex(project => project.id === id);

  if (projectIndex === -1) {
    throw new Error(`Projet avec l'ID ${id} non trouvé`);
  }

  const oldProject = projectsData[projectIndex];
  const updatedProject = { ...oldProject, ...updates };

  // Mettre à jour teamSize en fonction du nombre de membres d'équipe
  if (updates.teamMembers) {
    updatedProject.teamSize = updates.teamMembers.length;

    // Gérer les changements de membres d'équipe
    // Supprimer le projet des membres qui ne sont plus associés
    for (const memberId of oldProject.teamMembers || []) {
      if (!updatedProject.teamMembers.includes(memberId)) {
        await removeProjectFromMember(memberId, id);
      }
    }

    // Ajouter le projet aux nouveaux membres
    for (const memberId of updatedProject.teamMembers) {
      if (!(oldProject.teamMembers || []).includes(memberId)) {
        await addProjectToMember(memberId, id);
      }
    }
  }

  // Gérer le changement de client
  if (updates.clientId && oldProject.clientId !== updates.clientId) {
    // Supprimer le projet de l'ancien client
    if (oldProject.clientId) {
      await removeProjectFromClient(oldProject.clientId, id);
    }

    // Ajouter le projet au nouveau client
    await addProjectToClient(updates.clientId, id);
  }

  projectsData = [
    ...projectsData.slice(0, projectIndex),
    updatedProject,
    ...projectsData.slice(projectIndex + 1)
  ];

  saveProjectsToStorage(projectsData); // Sauvegarder dans localStorage

  console.log("Projet mis à jour:", updatedProject);
  toast.success(`Projet "${updatedProject.name}" mis à jour avec succès`);
  return {...updatedProject}; // Retourne une copie
};

// Supprimer un projet
export const deleteProject = async (id: string): Promise<boolean> => {
  const projectIndex = projectsData.findIndex(project => project.id === id);
  
  if (projectIndex === -1) {
    throw new Error(`Projet avec l'ID ${id} non trouvé`);
  }
  
  const project = projectsData[projectIndex];
  const projectName = project.name;
  
  // Supprimer le projet de tous les membres d'équipe associés
  if (project.teamMembers && project.teamMembers.length > 0) {
    for (const memberId of project.teamMembers) {
      await removeProjectFromMember(memberId, id);
    }
  }
  
  // Supprimer le projet du client
  if (project.clientId) {
    await removeProjectFromClient(project.clientId, id);
  }

  projectsData = [
    ...projectsData.slice(0, projectIndex),
    ...projectsData.slice(projectIndex + 1)
  ];

  saveProjectsToStorage(projectsData); // Sauvegarder dans localStorage
  
  console.log(`Projet "${projectName}" supprimé`);
  toast.success(`Projet "${projectName}" supprimé avec succès`);
  return true;
};

// Fonctions pour gérer les relations entre projets et membres/clients

// Fonction pour retirer un projet d'un membre
export const removeProjectFromMember = async (memberId: string, projectId: string): Promise<boolean> => {
  try {
    console.log(`Retrait du projet ${projectId} du membre ${memberId}`);
    
    // Récupérer tous les membres
    const membersData = localStorage.getItem('teamMembersData');
    if (!membersData) return false;
    
    const members = JSON.parse(membersData);
    const memberIndex = members.findIndex((m: any) => m.id === memberId);
    
    if (memberIndex === -1) return false;
    
    // Retirer le projet de la liste des projets du membre
    const member = members[memberIndex];
    const memberProjects = member.projects || [];
    
    members[memberIndex] = {
      ...member,
      projects: memberProjects.filter((p: string) => p !== projectId)
    };
    
    // Sauvegarder
    localStorage.setItem('teamMembersData', JSON.stringify(members));
    
    return true;
  } catch (error) {
    console.error(`Erreur lors du retrait du projet ${projectId} du membre ${memberId}:`, error);
    return false;
  }
};

// Fonction pour ajouter un projet à un client
export const addProjectToClient = async (clientId: string, projectId: string): Promise<boolean> => {
  try {
    console.log(`Ajout du projet ${projectId} au client ${clientId}`);
    // Implémentation réelle ici si nécessaire
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'ajout du projet ${projectId} au client ${clientId}:`, error);
    return false;
  }
};

// Fonction pour retirer un projet d'un client
export const removeProjectFromClient = async (clientId: string, projectId: string): Promise<boolean> => {
  try {
    console.log(`Retrait du projet ${projectId} du client ${clientId}`);
    // Implémentation réelle ici si nécessaire
    return true;
  } catch (error) {
    console.error(`Erreur lors du retrait du projet ${projectId} du client ${clientId}:`, error);
    return false;
  }
};

// Vérifier les droits d'accès d'un utilisateur sur un projet
export const getProjectAccessRights = async (projectId: string, userId: string) => {
  try {
    // Comme les autres fonctions utilisent localStorage, nous allons faire pareil
    const project = await getProjectById(projectId);
    
    if (!project) {
      return { canUpload: false, canEdit: false, isOwner: false, isAdmin: false };
    }
    
    // Vérifier si l'utilisateur est membre de l'équipe du projet
    const isMember = project.teamMembers?.includes(userId);
    
    // Simuler les droits d'accès basés sur l'appartenance à l'équipe
    return {
      canUpload: isMember || true, // Pour éviter les erreurs, on autorise temporairement tout le monde
      canEdit: isMember || true,    // à télécharger et éditer
      isOwner: false, // Dans un système réel, vérifieriez le créateur du projet
      isAdmin: false  // Dans un système réel, vérifieriez les rôles utilisateur
    };
  } catch (error) {
    console.error("Erreur lors de la vérification des droits d'accès:", error);
    // En cas d'erreur, on autorise quand même (pour éviter de bloquer les utilisateurs)
    return { canUpload: true, canEdit: true, isOwner: false, isAdmin: false };
  }
};

/**
 * Ajoute un projet à un membre
 */
export const addProjectToMember = async (memberId: string, projectId: string): Promise<boolean> => {
  // Utiliser la fonction de teamProjectRelationService à la place
  const { assignMemberToProject } = await import('@/services/team/teamProjectRelationService');
  return assignMemberToProject(memberId, projectId);
};

// Fonctions pour gérer les jalons directement dans projectService
const projectMilestonesDB: Record<string, ProjectMilestone[]> = {};

export const getProjectMilestones = async (projectId: string): Promise<ProjectMilestone[]> => {
  return projectMilestonesDB[projectId] || [];
};

export const updateProjectMilestones = async (
  projectId: string, 
  milestones: ProjectMilestone[]
): Promise<ProjectMilestone[]> => {
  projectMilestonesDB[projectId] = milestones;
  
  // Mettre également à jour le projet pour qu'il contienne les jalons
  const projectIndex = projectsData.findIndex(p => p.id === projectId);
  if (projectIndex !== -1) {
    projectsData[projectIndex] = {
      ...projectsData[projectIndex],
      milestones
    };
    saveProjectsToStorage(projectsData);
  }
  
  return milestones;
};

// Ajouter cette fonction au fichier existant

// Remplacer la fonction problématique par cette version compatible
export const fetchTasks = async (projectId: string): Promise<TaskProgress[]> => {
  try {
    console.log(`Récupération des tâches pour le projet ${projectId}`);
    
    const tasksData = localStorage.getItem('projectTasks');
    const allTasks = tasksData ? JSON.parse(tasksData) : {};
    
    return allTasks[projectId] || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des tâches:", error);
    return [];
  }
};

// Ajouter cette fonction pour sauvegarder les tâches
export const saveTasks = async (projectId: string, tasks: TaskProgress[]): Promise<boolean> => {
  try {
    const tasksData = localStorage.getItem('projectTasks');
    const allTasks = tasksData ? JSON.parse(tasksData) : {};
    
    allTasks[projectId] = tasks;
    
    localStorage.setItem('projectTasks', JSON.stringify(allTasks));
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des tâches:", error);
    return false;
  }
};

// Supprimer la fonction problématique
// export const fetchProjectTasks = async (projectId: string) => { ... }