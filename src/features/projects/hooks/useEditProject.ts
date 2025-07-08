import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ProjectCardProps } from "@/features/projects/components/ProjectCard";
import { getProjectById, updateProject } from "@/features/projects/services/projectService";
import { getAllTeamMembers } from "@/features/team/services/teamService";
import { TeamMember as LegacyTeamMember } from "@/features/team/types/team";
import { getAllClients, ClientData } from "@/features/clients/services/clientService";

export const useEditProject = (projectId: string | undefined) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [project, setProject] = useState<ProjectCardProps | null>(null);
  const [teamMembers, setTeamMembers] = useState<LegacyTeamMember[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) {
        toast.error("ID du projet non spécifié");
        navigate("/projects");
        return;
      }
      
      try {
        setIsLoading(true);
        const [projectData, members, clientsData] = await Promise.all([
          getProjectById(projectId),
          getAllTeamMembers(),
          getAllClients()
        ]);
        
        if (projectData) {
          setProject(projectData);
          setSelectedTeamMembers(projectData.teamMembers || []);
        } else {
          toast.error("Projet non trouvé");
          navigate("/projects");
        }
        
        setTeamMembers(members);
        setClients(clientsData);
      } catch (error) {
        console.error("Erreur lors du chargement du projet:", error);
        toast.error("Impossible de charger le projet");
        navigate("/projects");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, navigate]);
  
  const handleSelectTeamMember = (memberId: string) => {
    if (selectedTeamMembers.includes(memberId)) {
      setSelectedTeamMembers(selectedTeamMembers.filter(id => id !== memberId));
    } else {
      setSelectedTeamMembers([...selectedTeamMembers, memberId]);
    }
  };
  
  const handleInputChange = (field: keyof ProjectCardProps, value: any) => {
    if (!project) return;
    
    setProject({
      ...project,
      [field]: value
    });
  };
  
  const handleImageUploaded = (url: string) => {
    if (!project) return;
    
    setProject({
      ...project,
      imageUrl: url
    });
  };
  
  const handleSaveProject = async () => {
    if (!project || !projectId) return;
    
    if (!project.name || !project.client || !project.location || !project.startDate || !project.endDate) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Préparer l'objet de mise à jour SANS l'image si c'est un placeholder
      const updates: any = {
        ...project,
        teamMembers: selectedTeamMembers,
        teamSize: selectedTeamMembers.length,
      };
      
      // Ne pas envoyer l'image si c'est un placeholder ou une image en base64
      if (project.imageUrl && 
          !project.imageUrl.startsWith('placeholder://') && 
          !project.imageUrl.startsWith('data:image/')) {
        updates.image_url = project.imageUrl;
      } else {
        // Supprimer l'imageUrl du payload pour éviter l'erreur 413
        delete updates.imageUrl;
        delete updates.image_url;
      }
      
      // Mise à jour du projet
      await updateProject(projectId, updates);
      
      toast.success("Projet mis à jour avec succès");
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du projet:", error);
      toast.error("Impossible de mettre à jour le projet");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isLoading,
    isSaving,
    project,
    teamMembers,
    clients,
    selectedTeamMembers,
    handleSelectTeamMember,
    handleInputChange,
    handleImageUploaded,
    handleSaveProject
  };
};
