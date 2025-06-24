import { useState, useEffect } from 'react';
import { ProjectCardProps } from '@/features/projects/components/ProjectCard';

export const useEditProject = (projectId: string) => {
  const [project, setProject] = useState<ProjectCardProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadProject = async () => {
    // TODO: Implémenter le chargement du projet
    console.log('Charger projet:', projectId);
  };

  const saveProject = async (updates: Partial<ProjectCardProps>) => {
    // TODO: Implémenter la sauvegarde du projet
    console.log('Sauvegarder projet:', updates);
  };

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  return {
    project,
    isLoading,
    isSaving,
    saveProject,
  };
};
