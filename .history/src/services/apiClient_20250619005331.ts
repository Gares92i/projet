import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface ApiClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || '/api';
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    // Pour le développement, simuler des délais de réseau
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Vérifier si les données sont dans localStorage
    const storageKey = this.getStorageKey(endpoint);
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      return JSON.parse(stored) as T;
    }
    
    throw new Error(`Données non trouvées pour ${endpoint}`);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    // Simuler un délai de réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Stocker les données pour les récupérer plus tard
    const storageKey = this.getStorageKey(endpoint);
    const result = { ...data, id: `${Date.now()}` };
    localStorage.setItem(storageKey, JSON.stringify(result));
    
    return result as T;
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    // Simuler un délai de réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mettre à jour les données existantes
    const storageKey = this.getStorageKey(endpoint);
    localStorage.setItem(storageKey, JSON.stringify(data));
    
    return data as T;
  }

  async delete(endpoint: string): Promise<boolean> {
    // Simuler un délai de réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Supprimer les données
    const storageKey = this.getStorageKey(endpoint);
    localStorage.removeItem(storageKey);
    
    return true;
  }

  private getStorageKey(endpoint: string): string {
    return `api-${endpoint.replace(/\//g, '-')}`;
  }
}

export function createApiClient(options?: ApiClientOptions): ApiClient {
  return new ApiClient(options);
}

// Exporter une instance par défaut pour faciliter l'utilisation
export const apiClient = new ApiClient();