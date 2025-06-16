import { createApiClient } from "./apiClient";

// Configuration
const CDN_URL = import.meta.env.VITE_CDN_URL || "/uploads";

// Service pour gérer le stockage des fichiers via Railway/API
export const fileStorageService = {
  // Télécharger un fichier
  uploadFile: async (file: File | Blob | string, path: string): Promise<string> => {
    const api = createApiClient();
    
    // Si c'est déjà une URL data ou une URL complète, la retourner
    if (typeof file === 'string') {
      if (file.startsWith('data:') || file.startsWith('http')) {
        return file;
      }
      // Convertir le base64 en blob
      file = await fetch(file).then(res => res.blob());
    }
    
    // Créer un FormData pour l'upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);
    
    try {
      // Obtenir les headers d'authentification mais sans Content-Type
      // car FormData définit automatiquement le bon Content-Type avec boundary
      const { Authorization } = await api.getAuthHeaders();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: "POST",
        headers: { Authorization },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Erreur lors de l'upload du fichier:", error);
      
      // Fallback: stocker en base64 dans localStorage (solution temporaire)
      if (file instanceof File || file instanceof Blob) {
        if (file.size > 2 * 1024 * 1024) {
          throw new Error("Fichier trop volumineux pour le stockage local");
        }
        
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            const key = `local-file-${Date.now()}-${file instanceof File ? file.name : 'blob'}`;
            localStorage.setItem(key, base64data);
            resolve(key);
          };
          reader.readAsDataURL(file);
        });
      }
      
      throw error;
    }
  },
  
  // Convertir une URL de fichier en URL complète
  getFileUrl: (fileKey: string): string => {
    // Si c'est déjà une URL complète
    if (fileKey.startsWith("http") || fileKey.startsWith("data:")) {
      return fileKey;
    }

    // Si c'est une référence locale
    if (fileKey.startsWith("local-file-")) {
      return localStorage.getItem(fileKey) || fileKey;
    }
    
    // Construire l'URL CDN
    return `${CDN_URL}/${fileKey}`;
  }
};

// Exporter les fonctions pour faciliter l'usage
export const uploadFile = fileStorageService.uploadFile;
export const getFileUrl = fileStorageService.getFileUrl;