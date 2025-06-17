import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Client API pour communiquer avec notre backend Railway
export const createApiClient = () => {
  const { getToken } = useAuth();

  const getAuthHeaders = async () => {
    const token = await getToken();
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  };

  return {
    get: async <T>(endpoint: string): Promise<T> => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}${endpoint}`, { headers });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
    
    post: async <T>(endpoint: string, data: any): Promise<T> => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
    
    put: async <T>(endpoint: string, data: any): Promise<T> => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
    
    delete: async <T>(endpoint: string): Promise<T> => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE",
        headers
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    }
  };
};