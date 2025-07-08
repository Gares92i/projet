import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getProjectById, updateProject } from '@/features/projects/services/projectService';
import { getAllClients } from '@/features/clients/services/clientService';
import { getAllTeamMembers } from '@/features/team/services/teamService';
import { Project } from '@/features/projects/types/project';
import { Client } from '@/features/clients/types/client';
import { TeamMember } from '@/features/team/types/team';
import { uploadProjectImage } from '@/features/projects/services/projectService';

export const useEditProject = (projectId: string | undefined) => {
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Charger les données du projet
  const loadProject = async () => {
    if (!projectId) return;
    
    try {
      setIsLoading(true);
      
      // Charger le projet
      const projectData = await getProjectById(projectId);
      if (!projectData) {
        toast.error("Projet non trouvé");
        navigate("/projects");
        return;
      }
      
      setProject(projectData);
      
      // Charger les clients
      const clientsData = await getAllClients();
      setClients(clientsData);
      
      // Charger les membres d'équipe
      const teamMembersData = await getAllTeamMembers();
      setTeamMembers(teamMembersData);
      
      // Initialiser les membres sélectionnés
      if (projectData.teamMembers && Array.isArray(projectData.teamMembers)) {
        setSelectedTeamMembers(projectData.teamMembers.map(member => member.id));
      }
      
    } catch (error) {
      console.error("Erreur lors du chargement du projet:", error);
      toast.error("Erreur lors du chargement du projet");
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder le projet
  const saveProject = async (updates: Partial<Project>) => {
    if (!projectId || !project) return;
    
    try {
      setIsSaving(true);
      
      // Préparer les données à sauvegarder
      const dataToSave = {
        ...updates,
        // S'assurer que les membres d'équipe sont correctement formatés
        teamMembers: selectedTeamMembers.map(memberId => {
          const member = teamMembers.find(m => m.id === memberId);
          return member ? { id: member.id, name: member.name, role: member.role } : null;
        }).filter(Boolean)
      };
      
      // Sauvegarder via l'API
      const updatedProject = await updateProject(projectId, dataToSave);
      
      // Mettre à jour l'état local
      setProject(updatedProject);
      
      toast.success("Projet mis à jour avec succès");
      
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde du projet");
    } finally {
      setIsSaving(false);
    }
  };

  // Gérer les changements d'input
  const handleInputChange = (field: keyof Project, value: any) => {
    if (!project) return;
    
    setProject(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
  };

  // Gérer la sélection des membres d'équipe
  const handleSelectTeamMember = (memberId: string, isSelected: boolean) => {
    setSelectedTeamMembers(prev => {
      if (isSelected) {
        return prev.includes(memberId) ? prev : [...prev, memberId];
      } else {
        return prev.filter(id => id !== memberId);
      }
    });
  };

  // Gérer l'upload d'image
  const handleImageUploaded = async (file: File) => {
    if (!projectId) return;
    
    try {
      const imageUrl = await uploadProjectImage(projectId, file);
      
      // Mettre à jour le projet avec la nouvelle image
      setProject(prev => prev ? {
        ...prev,
        imageUrl
      } : null);
      
      toast.success("Image mise à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de l'upload de l'image:", error);
      toast.error("Erreur lors de l'upload de l'image");
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  return {
    project,
    clients,
    teamMembers,
    selectedTeamMembers,
    isLoading,
    isSaving,
    handleInputChange,
    handleSelectTeamMember,
    handleImageUploaded,
    handleSaveProject: saveProject
  };
};
