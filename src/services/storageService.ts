import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// En haut du fichier, ajoutez:
const FORCE_SUPABASE = true; // Mettre à true pour forcer l'utilisation de Supabase

// Fonction auxiliaire pour obtenir l'extension de fichier à partir d'un type MIME
const getFileExtension = (fileData: string): string => {
  if (fileData.startsWith('data:image/png')) return 'png';
  if (fileData.startsWith('data:image/jpeg') || fileData.startsWith('data:image/jpg')) return 'jpg';
  if (fileData.startsWith('data:image/gif')) return 'gif';
  if (fileData.startsWith('data:application/pdf')) return 'pdf';
  return 'png'; // Par défaut
};

/**
 * Convertit une chaîne Base64 en Blob de manière sécurisée
 */
export const base64ToBlob = (base64String: string): Blob => {
  try {
    // Si la chaîne est vide ou null, retourner un Blob vide
    if (!base64String) {
      return new Blob([], { type: 'application/octet-stream' });
    }

    // Vérifier si la chaîne semble tronquée
    if (base64String.includes('[truncated]')) {
      console.warn('Chaîne base64 tronquée détectée, création d\'une image de remplacement');
      return createPlaceholderImage('Image tronquée');
    }

    // Extraire le type MIME et les données
    let contentType = 'application/octet-stream';
    let b64Data = base64String;
    
    if (base64String.startsWith('data:')) {
      const parts = base64String.split(',');
      
      if (parts.length >= 2) {
        // Extraire le type MIME
        const match = parts[0].match(/:(.*?);/);
        if (match) {
          contentType = match[1];
        }
        
        // Récupérer les données après la virgule
        b64Data = parts[1];
      } else {
        console.warn('Format data: URL invalide, tentative de correction');
        // Extraire la partie base64 si possible
        const dataStartIndex = base64String.indexOf('base64,');
        if (dataStartIndex !== -1) {
          b64Data = base64String.substring(dataStartIndex + 7);
        }
      }
    }
    
    // CORRECTION: Nettoyer la chaîne sans être trop restrictif
    // Supprimer les espaces, les sauts de ligne et autres caractères whitespace
    b64Data = b64Data.replace(/[\s\r\n]+/g, '');
    
    // Vérifier que la chaîne n'est pas vide après nettoyage
    if (!b64Data) {
      console.warn('Chaîne base64 vide après nettoyage');
      return createPlaceholderImage('Données vides');
    }
    
    // Ajouter le padding si nécessaire
    if (b64Data.length % 4 !== 0) {
      const padding = 4 - (b64Data.length % 4);
      b64Data += '='.repeat(padding);
    }
    
    try {
      // Tentative de conversion standard
      const byteCharacters = atob(b64Data);
      const byteArrays = [];
      
      const sliceSize = 512;
      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      return new Blob(byteArrays, { type: contentType });
    } catch (e) {
      console.error('Erreur lors du décodage base64:', e);
      
      // Si la chaîne semble être une URL complète (pas base64)
      if (base64String.startsWith('http')) {
        console.log('URL détectée, création d\'un blob à partir de fetch');
        // Retourner un placeholder et laisser le navigateur charger l'URL normalement
        return createPlaceholderImage('Chargement...');
      }
      
      // En dernier recours, créer une image placeholder
      return createPlaceholderImage('Erreur de chargement');
    }
  } catch (error) {
    console.error('Erreur lors de la conversion base64 en Blob:', error);
    return createPlaceholderImage('Erreur');
  }
};

// Fonction utilitaire pour créer une image placeholder
function createPlaceholderImage(text: string): Blob {
  try {
    // Version synchrone utilisant un canvas et toDataURL au lieu de toBlob
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Dessiner un fond gris clair
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Dessiner le texte
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      
      // Convertir en base64 (synchrone) puis en Blob
      const dataUrl = canvas.toDataURL('image/png');
      const base64 = dataUrl.split(',')[1];
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: 'image/png' });
    }
  } catch (e) {
    console.error('Erreur lors de la création de l\'image placeholder:', e);
  }
  
  // Fallback: GIF transparent 1x1
  const emptyGif = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  try {
    const byteCharacters = atob(emptyGif);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([byteArray], { type: 'image/gif' });
  } catch (e) {
    // Dernier recours: blob vide
    return new Blob([], { type: 'image/gif' });
  }
}

// Simplification de la gestion des erreurs et clarification de la logique
const uploadFile = async (
  fileData: string | Blob | File,
  bucket: string,
  projectId: string,
  options: { metadata?: Record<string, string> } = {}
): Promise<string> => {
  try {
    let blob: Blob;
    let fileName: string;

    // Si c'est une URL qui n'est pas base64, retourner l'URL telle quelle
    if (typeof fileData === 'string' && !fileData.startsWith('data:')) {
      return fileData;
    }

    // Préparation du blob
    if (fileData instanceof File) {
      fileName = `${uuidv4()}.${fileData.name.split('.').pop() || 'bin'}`;
      blob = new Blob([fileData], { type: fileData.type });
    } else if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      const extension = getFileExtension(fileData);
      fileName = `${uuidv4()}.${extension}`;
      blob = base64ToBlob(fileData);
    } else if (fileData instanceof Blob) {
      const extension = fileData.type.split('/')[1] || 'png';
      fileName = `${uuidv4()}.${extension}`;
      blob = fileData;
    } else {
      throw new Error("Format de fichier non pris en charge");
    }
    
    // Assurer que le dossier du projet existe en créant un chemin
    const filePath = `${projectId}/${fileName}`;

    // Vérification de session et mode développement
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticated = !!sessionData?.session;

    // Utiliser le stockage local dans ces cas
    if (!FORCE_SUPABASE && (!isAuthenticated || window.location.hostname === 'localhost')) {
      if (typeof fileData === 'string' && fileData.startsWith('data:')) {
        console.log("Mode développement/démo: utilisation du stockage local");
        return fileData; // Retourner directement l'URL base64
      }

      // Convertir en base64
     if (fileData instanceof File || (typeof File !== 'undefined' && fileData instanceof File)) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(fileData);
        });
      }
    }

    // Vérifier la taille (max 5 Mo)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (blob.size > MAX_SIZE) {
      toast.error("Le fichier est trop volumineux (max 5 Mo)");
      throw new Error("Fichier trop volumineux");
    }

    // Tentative d'upload
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, blob, {
          contentType: blob.type,
          upsert: true,
          metadata: {
            ...options.metadata,
            projectId: projectId,
          }
        });

      if (error) {
        console.warn("Erreur upload:", error);
        // Fallback vers base64 en cas d'erreur
        if (typeof fileData === 'string' && fileData.startsWith('data:')) {
          return fileData;
        }

       if (fileData instanceof File || (typeof File !== 'undefined' && fileData instanceof File)) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(fileData);
          });
        }
        
        throw error;
      }
      
      // Succès - retourner l'URL publique
      return supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
    } catch (uploadError) {
      console.error("Erreur Supabase:", uploadError);
      
      // Si c'est une base64, la retourner directement
      if (typeof fileData === 'string') {
        return fileData;
      }
      
      // Convertir en base64 comme fallback
      if (fileData instanceof File || (typeof File !== 'undefined' && fileData instanceof File)) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(fileData);
        });
      }
      
      throw uploadError;
    }
  } catch (error) {
    console.error('Erreur globale d\'upload:', error);
    if (typeof fileData === 'string') return fileData;
    throw error;
  }
};

// Fonction pour télécharger une image
export const uploadImage = async (imageData: string | Blob | File, projectId: string): Promise<string> => {
  try {
    return await uploadFile(imageData, 'photos', projectId);
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'image:', error);
    if (typeof imageData === 'string') return imageData;
    throw error;
  }
};

// Fonction pour télécharger une annotation
export const uploadAnnotation = async (annotationData: string | Blob | File, projectId: string): Promise<string> => {
  try {
    return await uploadFile(annotationData, 'annotations', projectId);
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'annotation:', error);
    if (typeof annotationData === 'string') return annotationData;
    throw error;
  }
};

// Fonction pour télécharger un document
export const uploadDocument = async (documentData: string | Blob | File, projectId: string): Promise<string> => {
  try {
    return await uploadFile(documentData, 'documents', projectId);
  } catch (error) {
    console.error('Erreur lors du téléchargement du document:', error);
    if (typeof documentData === 'string') return documentData;
    throw error;
  }
};

// Fonction pour télécharger une signature
export const uploadSignature = async (signatureData: string | Blob | File, projectId: string): Promise<string> => {
  try {
    return await uploadFile(signatureData, 'signatures', projectId, {
      metadata: { type: 'signature' }
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement de la signature:', error);
    if (typeof signatureData === 'string') return signatureData;
    throw error;
  }
};