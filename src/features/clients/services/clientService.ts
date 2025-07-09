import { toast } from "sonner";
import { ClientData, ClientCreateInput, ClientUpdateInput } from "../types/client";
import { createApiClient } from "@/features/common/services/apiClient";

// Fonction utilitaire pour normaliser les données client
export function normalizeClient(client: any): ClientData {
  return {
    id: client.id || `temp-${Date.now()}`,
    name: client.name || '',
    email: client.email || '',
    phone: client.phone || '',
    address: client.address || '',
    company: client.company || '',
    projectIds: client.projectIds || []
  };
}

// Récupérer les clients du localStorage ou utiliser les données par défaut
const loadClientsFromStorage = (): ClientData[] => {
  const savedClients = localStorage.getItem('clientsData');
  if (savedClients) {
    try {
      return JSON.parse(savedClients);
    } catch (error) {
      console.error("Erreur lors du chargement des clients depuis localStorage:", error);
      return getDefaultClients();
    }
  }
  return getDefaultClients();
};

// Sauvegarder les clients dans localStorage
const saveClientsToStorage = (clients: ClientData[]) => {
  localStorage.setItem('clientsData', JSON.stringify(clients));
};

// Données par défaut pour les clients
const getDefaultClients = (): ClientData[] => [
  {
    id: "1",
    name: "Société Immobilière Provence",
    email: "contact@siprovence.fr",
    phone: "04 91 XX XX XX",
    address: "123 Avenue de la Méditerranée, 13000 Marseille",
    company: "SIP",
    projectIds: ["1"]
  },
  {
    id: "2",
    name: "Groupe Altitude Développement",
    email: "info@altitudedeveloppement.fr",
    phone: "04 72 XX XX XX",
    address: "45 Rue de la République, 69002 Lyon",
    company: "Altitude Dev",
    projectIds: ["2"]
  }
];

// Initialiser les clients depuis localStorage ou utiliser les données par défaut
let clientsData: ClientData[] = loadClientsFromStorage();

// Service pour gérer les clients avec l'API Railway
export const clientService = {
  // Récupérer tous les clients
  getAllClients: async (): Promise<ClientData[]> => {
    const api = createApiClient();
    
    try {
      const response = await api.get<ClientData[]>('/clients');
      return response.map(normalizeClient);
    } catch (error) {
      console.error("Erreur lors de la récupération des clients:", error);
      
      // Fallback sur localStorage
      return clientsData;
    }
  },

  // Récupérer un client par ID
  getClientById: async (id: string): Promise<ClientData | null> => {
    const api = createApiClient();
    
    try {
      const client = await api.get<ClientData>(`/clients/${id}`);
      return normalizeClient(client);
    } catch (error) {
      console.error(`Erreur lors de la récupération du client ${id}:`, error);
      
      // Fallback sur localStorage
      const client = clientsData.find(c => c.id === id);
      return client ? {...client} : null;
    }
  },

  // Ajouter un nouveau client
  addClient: async (client: ClientCreateInput): Promise<ClientData> => {
    const api = createApiClient();
    
    try {
      const newClient = await api.post<ClientData>("/clients", client);
      return normalizeClient(newClient);
    } catch (error) {
      console.error("Erreur lors de l'ajout du client:", error);
      
      // Fallback: création locale temporaire
      const newClient: ClientData = {
        ...client,
        id: Date.now().toString(),
        projectIds: client.projectIds || [],
      };

      clientsData = [...clientsData, newClient];
      saveClientsToStorage(clientsData);
      
      toast.success(`Client "${newClient.name}" créé avec succès`);
      return {...newClient};
    }
  },

  // Mettre à jour un client existant
  updateClient: async (id: string, updates: ClientUpdateInput): Promise<ClientData> => {
    const api = createApiClient();
    
    try {
      const updatedClient = await api.put<ClientData>(`/clients/${id}`, updates);
      return normalizeClient(updatedClient);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du client ${id}:`, error);
      
      // Fallback: mise à jour locale
      const clientIndex = clientsData.findIndex(client => client.id === id);

      if (clientIndex === -1) {
        throw new Error(`Client avec l'ID ${id} non trouvé`);
      }
      
      const oldClient = clientsData[clientIndex];
      const updatedClient = { ...oldClient, ...updates };

      clientsData = [
        ...clientsData.slice(0, clientIndex),
        updatedClient,
        ...clientsData.slice(clientIndex + 1)
      ];
      
      saveClientsToStorage(clientsData);
      
      toast.success(`Client "${updatedClient.name}" mis à jour avec succès`);
      return {...updatedClient};
    }
  },

  // Supprimer un client
  deleteClient: async (id: string): Promise<boolean> => {
    const api = createApiClient();
    
    try {
      await api.delete(`/clients/${id}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du client ${id}:`, error);
      
      // Fallback: suppression locale
      const clientIndex = clientsData.findIndex(client => client.id === id);
      
      if (clientIndex === -1) {
        throw new Error(`Client avec l'ID ${id} non trouvé`);
      }
      
      const client = clientsData[clientIndex];
      const clientName = client.name;
      
      clientsData = [
        ...clientsData.slice(0, clientIndex),
        ...clientsData.slice(clientIndex + 1)
      ];
      
      saveClientsToStorage(clientsData);
      
      toast.success(`Client "${clientName}" supprimé avec succès`);
      return true;
    }
  },

  // Ajouter un projet à un client
  addProjectToClient: async (clientId: string, projectId: string): Promise<boolean> => {
    const api = createApiClient();
    
    try {
      await api.post(`/clients/${clientId}/projects`, { projectId });
      return true;
    } catch (error) {
      console.error(`Erreur lors de l'ajout du projet au client ${clientId}:`, error);
      
      // Fallback: mise à jour locale
      const clientIndex = clientsData.findIndex(client => client.id === clientId);
      
      if (clientIndex === -1) {
        console.error(`Client avec l'ID ${clientId} non trouvé`);
        return false;
      }
      
      const client = clientsData[clientIndex];
      
      // Vérifier si le projet est déjà dans la liste
      if (client.projectIds?.includes(projectId)) {
        return true; // Le projet est déjà associé à ce client
      }
      
      // Ajouter le projet au client
      const updatedClient = {
        ...client,
        projectIds: [...(client.projectIds || []), projectId]
      };
      
      clientsData = [
        ...clientsData.slice(0, clientIndex),
        updatedClient,
        ...clientsData.slice(clientIndex + 1)
      ];
      
      saveClientsToStorage(clientsData);
      return true;
    }
  },

  // Supprimer un projet d'un client
  removeProjectFromClient: async (clientId: string, projectId: string): Promise<boolean> => {
    const api = createApiClient();
    
    try {
      await api.delete(`/clients/${clientId}/projects/${projectId}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du projet du client ${clientId}:`, error);
      
      // Fallback: mise à jour locale
      const clientIndex = clientsData.findIndex(client => client.id === clientId);
      
      if (clientIndex === -1) {
        console.error(`Client avec l'ID ${clientId} non trouvé`);
        return false;
      }
      
      const client = clientsData[clientIndex];
      
      // Supprimer le projet de la liste
      const updatedClient = {
        ...client,
        projectIds: (client.projectIds || []).filter(id => id !== projectId)
      };
      
      clientsData = [
        ...clientsData.slice(0, clientIndex),
        updatedClient,
        ...clientsData.slice(clientIndex + 1)
      ];
      
      saveClientsToStorage(clientsData);
      return true;
    }
  }
};

// Exporter les fonctions individuelles pour la compatibilité avec le code existant
export const getAllClients = clientService.getAllClients;
export const getClientById = clientService.getClientById;
export const addClient = clientService.addClient;
export const updateClient = clientService.updateClient;
export const deleteClient = clientService.deleteClient;
export const addProjectToClient = clientService.addProjectToClient;
export const removeProjectFromClient = clientService.removeProjectFromClient;
