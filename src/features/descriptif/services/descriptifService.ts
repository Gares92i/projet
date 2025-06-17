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
      try {
        const storageKey = `descriptif-data-${projectId}`;
        const jsonData = localStorage.getItem(storageKey);
        
        if (!jsonData) {
          console.log(`Aucun descriptif trouvé pour le projet ${projectId}`);
          return [];
        }
        
        const descriptif = JSON.parse(jsonData);
        return Array.isArray(descriptif) ? descriptif : [];
      } catch (localError) {
        console.error("Erreur lors du traitement du descriptif local:", localError);
        return [];
      }
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
      try {
        const storageKey = `descriptif-data-${projectId}`;
        localStorage.setItem(storageKey, JSON.stringify(descriptif));
        return true;
      } catch (localError) {
        console.error("Erreur lors de la sauvegarde locale du descriptif:", localError);
        return false;
      }
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
      try {
        const storageKey = `descriptif-data-${projectId}`;
        const jsonData = localStorage.getItem(storageKey);
        const descriptif = jsonData ? JSON.parse(jsonData) : [];
        
        const newLot = {
          ...lot,
          id: `lot-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`
        };
        
        descriptif.push(newLot);
        localStorage.setItem(storageKey, JSON.stringify(descriptif));
        
        return newLot as LotTravaux;
      } catch (localError) {
        console.error("Erreur lors de l'ajout local du lot:", localError);
        throw error;
      }
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
      try {
        const storageKey = `descriptif-data-${projectId}`;
        const jsonData = localStorage.getItem(storageKey);
        
        if (!jsonData) throw new Error("Aucun descriptif trouvé");
        
        const descriptif = JSON.parse(jsonData);
        const lotIndex = descriptif.findIndex((l: LotTravaux) => l.id === lotId);
        
        if (lotIndex === -1) throw new Error(`Lot ${lotId} non trouvé`);
        
        descriptif[lotIndex] = {
          ...descriptif[lotIndex],
          ...updates
        };
        
        localStorage.setItem(storageKey, JSON.stringify(descriptif));
        
        return descriptif[lotIndex];
      } catch (localError) {
        console.error("Erreur lors de la mise à jour locale du lot:", localError);
        throw error;
      }
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
      try {
        const storageKey = `descriptif-data-${projectId}`;
        const jsonData = localStorage.getItem(storageKey);
        
        if (!jsonData) return false;
        
        const descriptif = JSON.parse(jsonData);
        const updatedDescriptif = descriptif.filter((l: LotTravaux) => l.id !== lotId);
        
        localStorage.setItem(storageKey, JSON.stringify(updatedDescriptif));
        return true;
      } catch (localError) {
        console.error("Erreur lors de la suppression locale du lot:", localError);
        return false;
      }
    }
  },
  
  // Récupérer un lot spécifique
  getLot: async (projectId: string, lotId: string): Promise<LotTravaux | null> => {
    const api = createApiClient();
    
    try {
      return await api.get<LotTravaux>(`/projects/${projectId}/descriptif/lots/${lotId}`);
    } catch (error) {
      console.error(`Erreur lors de la récupération du lot ${lotId}:`, error);
      
      // Fallback: récupération locale
      try {
        const storageKey = `descriptif-data-${projectId}`;
        const jsonData = localStorage.getItem(storageKey);
        
        if (!jsonData) return null;
        
        const descriptif = JSON.parse(jsonData);
        return descriptif.find((l: LotTravaux) => l.id === lotId) || null;
      } catch (localError) {
        console.error("Erreur lors de la récupération locale du lot:", localError);
        return null;
      }
    }
  }
};

// Exporter les fonctions individuelles pour la compatibilité avec le code existant
export const getProjectDescriptif = descriptifService.getProjectDescriptif;
export const saveDescriptif = descriptifService.saveDescriptif;
export const addLot = descriptifService.addLot;
export const updateLot = descriptifService.updateLot;
export const deleteLot = descriptifService.deleteLot;
export const getLot = descriptifService.getLot;