import { createApiClient } from "@/features/common/services/apiClient";

export interface CompanySettings {
  id?: string;
  companyName: string;
  address?: string;
  logoUrl?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  maxMembersAllowed?: number;
  defaultUserRole?: string;
  branding?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

// Fonction utilitaire pour normaliser les données
export function normalizeCompanySettings(settings: any): CompanySettings {
  return {
    id: settings.id || `temp-${Date.now()}`,
    companyName: settings.companyName || '',
    address: settings.address || '',
    logoUrl: settings.logoUrl || '',
    subscriptionPlan: settings.subscriptionPlan || 'free',
    subscriptionStatus: settings.subscriptionStatus || 'active',
    maxMembersAllowed: settings.maxMembersAllowed || 5,
    defaultUserRole: settings.defaultUserRole || 'member',
    branding: settings.branding || {},
    createdAt: settings.createdAt ? new Date(settings.createdAt) : new Date(),
    updatedAt: settings.updatedAt ? new Date(settings.updatedAt) : new Date()
  };
}

export const companySettingsService = {
  // Récupérer les paramètres de l'agence
  getCompanySettings: async (): Promise<CompanySettings | null> => {
    const api = createApiClient();
    
    try {
      const response = await api.get<CompanySettings>('/company-settings/me');
      return normalizeCompanySettings(response);
    } catch (error) {
      console.error("Erreur lors de la récupération des paramètres d'agence:", error);
      
      // Fallback sur localStorage
      const stored = localStorage.getItem("companySettings");
      return stored ? normalizeCompanySettings(JSON.parse(stored)) : null;
    }
  },

  // Créer les paramètres d'agence
  createCompanySettings: async (settings: Omit<CompanySettings, 'id'>): Promise<CompanySettings> => {
    const api = createApiClient();
    
    try {
      const response = await api.post<CompanySettings>('/company-settings', settings);
      const normalizedSettings = normalizeCompanySettings(response);
      
      // Sauvegarder en localStorage comme backup
      localStorage.setItem("companySettings", JSON.stringify(normalizedSettings));
      
      return normalizedSettings;
    } catch (error) {
      console.error("Erreur lors de la création des paramètres d'agence:", error);
      
      // Fallback: création locale temporaire
      const localSettings = {
        ...settings,
        id: `local-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      localStorage.setItem("companySettings", JSON.stringify(localSettings));
      return normalizeCompanySettings(localSettings);
    }
  },

  // Mettre à jour les paramètres d'agence
  updateCompanySettings: async (settings: Partial<CompanySettings>): Promise<CompanySettings> => {
    const api = createApiClient();
    
    try {
      const response = await api.put<CompanySettings>('/company-settings', settings);
      const normalizedSettings = normalizeCompanySettings(response);
      
      // Sauvegarder en localStorage comme backup
      localStorage.setItem("companySettings", JSON.stringify(normalizedSettings));
      
      return normalizedSettings;
    } catch (error) {
      console.error("Erreur lors de la mise à jour des paramètres d'agence:", error);
      
      // Fallback: mise à jour locale
      const stored = localStorage.getItem("companySettings");
      const currentSettings = stored ? JSON.parse(stored) : {};
      const updatedSettings = {
        ...currentSettings,
        ...settings,
        updatedAt: new Date()
      };
      
      localStorage.setItem("companySettings", JSON.stringify(updatedSettings));
      return normalizeCompanySettings(updatedSettings);
    }
  }
};

// Exporter les fonctions individuelles pour la compatibilité
export const getCompanySettings = companySettingsService.getCompanySettings;
export const createCompanySettings = companySettingsService.createCompanySettings;
export const updateCompanySettings = companySettingsService.updateCompanySettings; 