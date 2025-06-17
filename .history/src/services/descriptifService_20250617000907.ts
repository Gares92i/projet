import { LotTravaux, DescriptifData } from "@/types/projectTypes";
import { createApiClient } from "./apiClient";

export const descriptifService = {
  // Récupérer le descriptif complet d'un projet
  getProjectDescriptif: async (projectId: string): Promise<DescriptifData> => {
    const api = createApiClient();
    
    try {
      return await api.get<DescriptifData>(`/projects/${projectId}/descriptif`);
    } catch (error) {
      console.error(`Erreur lors de la récupération du descriptif du projet ${projectId}:`, error);
      
      // Fallback sur localStorage
      const stored = localStorage.getItem(`project_${projectId}_descriptif`);
      return stored ? JSON.parse(stored) : [];
    }
  },
  
  // Sauvegarder le descriptif complet
  saveDescriptif: async (projectId: string, descriptif: DescriptifData): Promise<boolean> => {
    const api = createApiClient();
    
    try {
      await api.put(`/projects/${projectId}/descriptif`, descriptif);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde du descriptif du projet ${projectId}:`, error);
      
      // Fallback: sauvegarde locale
      localStorage.setItem(`project_${projectId}_descriptif`, JSON.stringify(descriptif));
      return true;
    }
  },
  
  // Ajouter un lot au descriptif
  addLot: async (projectId: string, lot: Omit<LotTravaux, "id">): Promise<LotTravaux> => {
    const api = createApiClient();
    
    try {
      return await api.post<LotTravaux>(`/projects/${projectId}/descriptif/lots`, lot);
    } catch (error) {
      console.error("Erreur lors de l'ajout du lot au descriptif:", error);
      
      // Fallback: ajout local
      const stored = localStorage.getItem(`project_${projectId}_descriptif`);
      const descriptif = stored ? JSON.parse(stored) : [];
      
      const newLot = {
        ...lot,
        id: `local-${Date.now()}`
      } as LotTravaux;
      
      descriptif.push(newLot);
      localStorage.setItem(`project_${projectId}_descriptif`, JSON.stringify(descriptif));
      
      return newLot;
    }
  },
  
  // Mettre à jour un lot existant
  updateLot: async (
    projectId: string, 
    lotId: string, 
    updates: Partial<LotTravaux>
  ): Promise<LotTravaux> => {
    const api = createApiClient();
    
    try {
      return await api.put<LotTravaux>(`/projects/${projectId}/descriptif/lots/${lotId}`, updates);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du lot ${lotId}:`, error);
      
      // Fallback: mise à jour locale
      const stored = localStorage.getItem(`project_${projectId}_descriptif`);
      if (!stored) throw error;
      
      const descriptif = JSON.parse(stored);
      const lotIndex = descriptif.findIndex((l: LotTravaux) => l.id === lotId);
      
      if (lotIndex === -1) throw new Error(`Lot ${lotId} non trouvé`);
      
      descriptif[lotIndex] = {
        ...descriptif[lotIndex],
        ...updates
      };
      
      localStorage.setItem(`project_${projectId}_descriptif`, JSON.stringify(descriptif));
      
      return descriptif[lotIndex];
    }
  },
  
  // Supprimer un lot
  deleteLot: async (projectId: string, lotId: string): Promise<boolean> => {
    const api = createApiClient();
    
    try {
      await api.delete(`/projects/${projectId}/descriptif/lots/${lotId}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du lot ${lotId}:`, error);
      
      // Fallback: suppression locale
      const stored = localStorage.getItem(`project_${projectId}_descriptif`);
      if (!stored) return false;
      
      const descriptif = JSON.parse(stored);
      const newDescriptif = descriptif.filter((l: LotTravaux) => l.id !== lotId);
      
      localStorage.setItem(`project_${projectId}_descriptif`, JSON.stringify(newDescriptif));
      return true;
    }
  }
};

// Exporter les fonctions individuelles pour la compatibilité avec le code existant
export const getProjectDescriptif = descriptifService.getProjectDescriptif;
export const saveDescriptif = descriptifService.saveDescriptif;
export const addLot = descriptifService.addLot;
export const updateLot = descriptifService.updateLot;
export const deleteLot = descriptifService.deleteLot;