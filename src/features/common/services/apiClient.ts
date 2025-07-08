import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Déclaration de type pour Clerk
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken(): Promise<string | null>;
      };
    };
  }
}

// Configuration de base pour les requêtes API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://archihub-backend-production.up.railway.app';

console.log("API_BASE_URL utilisé :", API_BASE_URL);

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// Fonction pour récupérer le token Clerk
const getClerkToken = async (): Promise<string | null> => {
  try {
    // Vérifier si Clerk est disponible
    if (window.Clerk && window.Clerk.session) {
      const token = await window.Clerk.session.getToken();
      return token;
    }
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération du token Clerk:", error);
    return null;
  }
};

export const createApiClient = (): {
  get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
  delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
} => {
  const instance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 secondes
  });

  // Intercepteur pour ajouter le token d'authentification Clerk
  instance.interceptors.request.use(async (config) => {
    try {
      // Récupérer le token Clerk
      const token = await getClerkToken();
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Token Clerk ajouté aux headers");
      } else {
        console.warn("Aucun token Clerk disponible");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du token d'authentification:", error);
    }
    
    return config;
  });

  // Intercepteur de réponse pour standardiser le traitement des erreurs
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response.data;
    },
    (error) => {
      // Gérer les différents types d'erreurs
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'erreur
        console.error('Erreur de réponse:', error.response.status, error.response.data);
        
        // Gérer les erreurs d'authentification
        if (error.response.status === 401) {
          console.warn('[apiClient] Erreur 401 - Token invalide ou expiré');
          // Ne pas rediriger automatiquement, laisser l'AuthGuard gérer
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        console.error('Erreur de requête (pas de réponse):', error.request);
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        console.error('Erreur de configuration:', error.message);
      }
      
      return Promise.reject(error);
    }
  );

  return {
    get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => 
      instance.get(url, config),
    post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
      instance.post(url, data, config),
    put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
      instance.put(url, data, config),
    delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => 
      instance.delete(url, config),
    patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
      instance.patch(url, data, config)
  };
};

// Créer une instance par défaut pour une utilisation directe
export const apiClient = createApiClient();