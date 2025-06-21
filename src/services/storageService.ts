import { v4 as uuidv4 } from 'uuid';

/**
 * Service de stockage pour les fichiers
 * Ce service gère l'upload et la récupération des fichiers
 */

// Configuration pour supabase ou autre service de stockage
// À remplacer par votre propre configuration
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || '';
const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY || '';

/**
 * Télécharge une image d'annotation (base64) et retourne l'URL
 * @param base64Data Données de l'image en base64
 * @param projectId ID du projet
 * @returns URL de l'image uploadée
 */
export const uploadAnnotation = async (base64Data: string, projectId: string): Promise<string> => {
  try {
    // En mode développement/test, on stocke en localStorage et on retourne une URL simulée
    if (!STORAGE_URL || process.env.NODE_ENV === 'development') {
      console.log('Mode développement: stockage local de l\'image');
      
      // Générer un ID unique pour cette image
      const imageId = `annotation-${projectId}-${uuidv4()}`;
      
      // Stocker l'image en localStorage (attention à la taille)
      // On tronque le base64 pour le stockage (on garde juste le début pour debug)
      const truncatedBase64 = base64Data.substring(0, 50) + '...[truncated]';
      localStorage.setItem(`image-${imageId}`, truncatedBase64);
      
      // Retourner une URL simulée
      return `local-storage://${imageId}`;
    }
    
    // Convertir le base64 en blob pour l'upload
    const response = await fetch(base64Data);
    const blob = await response.blob();
    
    // Créer un nom de fichier unique
    const fileName = `annotation-${Date.now()}.png`;
    const filePath = `projects/${projectId}/annotations/${fileName}`;
    
    // Créer un FormData pour l'upload
    const formData = new FormData();
    formData.append('file', blob, fileName);
    formData.append('path', filePath);
    
    // Envoyer à l'API de stockage
    const uploadResponse = await fetch(`${STORAGE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STORAGE_KEY}`
      },
      body: formData
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Erreur d'upload: ${uploadResponse.status}`);
    }
    
    const data = await uploadResponse.json();
    return data.url;
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'annotation:', error);
    
    // Fallback: retourner le base64 tronqué (pour ne pas alourdir le localStorage)
    // En production, il faudrait gérer ce cas différemment
    const truncatedBase64 = base64Data.substring(0, 100) + '...[truncated]';
    return truncatedBase64;
  }
};

/**
 * Récupère une image depuis le stockage
 * @param url URL de l'image
 * @returns Données de l'image (URL ou base64)
 */
export const getImageFromStorage = async (url: string): Promise<string> => {
  try {
    // Vérifier si c'est une URL locale
    if (url.startsWith('local-storage://')) {
      const imageId = url.replace('local-storage://', '');
      const storedImage = localStorage.getItem(`image-${imageId}`);
      
      if (storedImage) {
        // Si l'image est tronquée, retourner un placeholder
        if (storedImage.includes('[truncated]')) {
          return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
        }
        return storedImage;
      }
      
      // Retourner une image placeholder si non trouvée
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    }
    
    // Si c'est déjà une data URL, la retourner directement
    if (url.startsWith('data:')) {
      return url;
    }
    
    // Sinon faire une requête pour récupérer l'image
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur de récupération: ${response.status}`);
    }
    
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'image:', error);
    // Retourner une image placeholder en cas d'erreur
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  }
};

/**
 * Supprime une image du stockage
 * @param url URL de l'image à supprimer
 * @returns true si suppression réussie, false sinon
 */
export const deleteImageFromStorage = async (url: string): Promise<boolean> => {
  try {
    // Vérifier si c'est une URL locale
    if (url.startsWith('local-storage://')) {
      const imageId = url.replace('local-storage://', '');
      localStorage.removeItem(`image-${imageId}`);
      return true;
    }
    
    // Si c'est un data URL, rien à supprimer
    if (url.startsWith('data:')) {
      return true;
    }
    
    // Supprimer du service de stockage
    const filePath = url.replace(STORAGE_URL, '');
    
    const deleteResponse = await fetch(`${STORAGE_URL}/delete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STORAGE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path: filePath })
    });
    
    return deleteResponse.ok;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    return false;
  }
};