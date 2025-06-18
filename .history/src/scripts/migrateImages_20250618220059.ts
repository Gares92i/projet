import { uploadImage, uploadAnnotation, uploadDocument, base64ToBlob } from '@/services/storageService';
import type { Annotation as BaseAnnotation } from '@/app/styles';

// Extension de l'interface Annotation pour inclure imageUrl
interface Annotation extends BaseAnnotation {
  imageUrl?: string;
}

// Définition des types pour les documents et annotations
interface DocumentWithAnnotations {
  id: string;
  url?: string;
  annotations?: Annotation[];
  [key: string]: any;
}

export async function migrateProjectImages(projectId: string): Promise<boolean> {
  try {
    console.log(`Début de la migration du projet ${projectId}...`);
    // 1. Récupérer les données du localStorage
    const annotationsKey = `project-annotations-${projectId}`;
    const storedAnnotations = localStorage.getItem(annotationsKey);

    if (!storedAnnotations) {
      console.log('Aucune annotation à migrer pour ce projet');
      return false;
    }

    // 2. Analyser les données
    const documents: DocumentWithAnnotations[] = JSON.parse(storedAnnotations);
    let hasChanges = false;

    // 3. Migrer chaque document
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];

     // 3.1 Migrer l'URL du document si c'est une base64
if (doc.url && typeof doc.url === 'string') {
  try {
    // Si l'URL contient [truncated], la sauter
    if (doc.url.includes('[truncated]')) {
      console.log(`Document ${doc.id || i} contient une URL tronquée, ignoré`);
      continue;
    }
    
    let newUrl: string;
    
    if (doc.url.startsWith('data:')) {
      console.log(`Traitement du document ${doc.id || i} en base64`);
      
      try {
        // Upload direct des données base64
        newUrl = await uploadDocument(doc.url, projectId);
        console.log(`Document ${doc.id || i} migré: ${newUrl.substring(0, 30)}...`);
      } catch (uploadError) {
        console.error(`Erreur d'upload pour le document ${doc.id || i}:`, uploadError);
        // Garder l'URL d'origine en cas d'échec
        continue;
      }
    } else {
            console.log(`Traitement du document ${doc.id || i} avec URL externe`);
            
            try {
              // Télécharger le contenu de l'URL
              const response = await fetch(doc.url);
              if (!response.ok) throw new Error(`Erreur fetch: ${response.status}`);
              
              const blob = await response.blob();
              if (blob.size === 0) throw new Error("Blob vide récupéré");
              
              // Upload du blob
              newUrl = await uploadDocument(blob, projectId);
            } catch (fetchError) {
              console.error(`Erreur lors de la récupération du document ${doc.id}:`, fetchError);
              continue; // Passer au document suivant
            }
          }
          
          // Vérifier si l'URL a changé
    if (newUrl && newUrl !== doc.url) {
      documents[i].url = newUrl;
      hasChanges = true;
    }
  } catch (error) {
    console.error(`Erreur lors de la migration du document ${doc.id || i}:`, error);
  }
}

      // 3.2 Migrer les annotations du document
      if (doc.annotations?.length) {
        for (let j = 0; j < doc.annotations.length; j++) {
          const annotation = doc.annotations[j];

          // 3.2.1 Migrer l'image principale de l'annotation
          if (annotation.imageUrl && annotation.imageUrl.startsWith('data:')) {
            try {
              const newUrl = await uploadAnnotation(annotation.imageUrl, projectId);
              if (newUrl !== annotation.imageUrl) {
                documents[i].annotations[j].imageUrl = newUrl;
                hasChanges = true;
              }
            } catch (error) {
              console.error(`Erreur lors de la migration de l'image d'annotation ${annotation.id}:`, error);
            }
          }

          // 3.2.2 Migrer les photos de l'annotation
          if (annotation.photos?.length) {
            for (let k = 0; k < annotation.photos.length; k++) {
              const photo = annotation.photos[k];
              if (typeof photo === 'string' && photo.startsWith('data:')) {
                try {
                  const newUrl = await uploadAnnotation(photo, projectId);
                  if (newUrl !== photo) {
                    documents[i].annotations[j].photos[k] = newUrl;
                    hasChanges = true;
                  }
                } catch (error) {
                  console.error(`Erreur lors de la migration de la photo ${k} de l'annotation ${annotation.id}:`, error);
                }
              }
            }
          }
        }
      }
    }

    // 4. Sauvegarder les données si des changements ont été effectués
    if (hasChanges) {
      localStorage.setItem(annotationsKey, JSON.stringify(documents));
      console.log(`Migration des images du projet ${projectId} terminée avec succès`);
      return true;
    } else {
      console.log(`Aucune image à migrer dans le projet ${projectId}`);
      return false;
    }
    
  } catch (error) {
    console.error('Erreur lors de la migration des images:', error);
    return false;
  }
}