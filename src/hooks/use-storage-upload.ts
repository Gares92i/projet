import { useState, useCallback } from 'react';
import { uploadImage, uploadAnnotation, uploadDocument, uploadSignature } from '@/services/storageService';
import { captureDocumentWithAnnotations } from '@/utils/captureService';
// Importer les types existants
import type { Reserve, Annotation } from '@/types';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Si les types n'existent pas déjà, définissez-les ici
interface BaseAnnotation {
  id?: string;
  imageUrl?: string;
  photos?: string[];
  documentId?: string;
  documentUrl?: string;
  documentName?: string;
  position?: { x: number; y: number };
  resolved?: boolean;
  isResolved?: boolean;
  createdAt?: string;
  capturedImageUrl?: string;
  [key: string]: any; // Pour les autres propriétés, utiliser un index signature
}

interface BaseReserve {
  id?: string;
  photos?: string[];
  [key: string]: any; // Pour les autres propriétés
}

export function useStorageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [userPermissions, setUserPermissions] = useLocalStorage("user-permissions", {
    canUpload: true,
    canEdit: true
  });

  // Utilisez le type Annotation ou BaseAnnotation
  const processAnnotationImages = useCallback(async (annotations: BaseAnnotation[], projectId: string) => {
    if (!annotations?.length) return annotations;

    setIsUploading(true);
    const processedAnnotations = [...annotations];

    try {
      for (let i = 0; i < processedAnnotations.length; i++) {
        const annotation = processedAnnotations[i];

        // Traiter l'image principale
        if (annotation.imageUrl && typeof annotation.imageUrl === 'string' && annotation.imageUrl.startsWith('data:')) {
          try {
            const url = await uploadAnnotation(annotation.imageUrl, projectId);
            processedAnnotations[i] = { ...annotation, imageUrl: url };
          } catch (error) {
            console.error('Erreur lors de l\'upload de l\'image d\'annotation:', error);
          }
        }

        // Traiter les photos
        if (annotation.photos?.length) {
          const processedPhotos = [...annotation.photos];

          for (let j = 0; j < processedPhotos.length; j++) {
            const photo = processedPhotos[j];
            if (typeof photo === 'string' && photo.startsWith('data:')) {
              try {
                const url = await uploadAnnotation(photo, projectId);
                processedPhotos[j] = url;
              } catch (error) {
                console.error('Erreur lors de l\'upload de photo d\'annotation:', error);
              }
            }
          }

          processedAnnotations[i] = { ...processedAnnotations[i], photos: processedPhotos };
        }
      }

      return processedAnnotations;
    } catch (error) {
      console.error('Erreur lors du traitement des annotations:', error);
      return annotations;
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Fonction processDocumentAnnotations modifiée pour gérer les erreurs d'autorisation
  const processDocumentAnnotations = useCallback(async (annotations: BaseAnnotation[], projectId: string) => {
    if (!annotations?.length) return [];

    setIsUploading(true);
    const groupedAnnotations: Record<string, {
      documentId: string;
      documentName: string;
      documentUrl: string;
      annotations: BaseAnnotation[];
      capturedImageUrl?: string;
    }> = {};

    try {
      // Grouper les annotations par document
      annotations.forEach(annotation => {
        if (!annotation.documentId || !annotation.documentUrl) return;
        
        if (!groupedAnnotations[annotation.documentId]) {
          groupedAnnotations[annotation.documentId] = {
            documentId: annotation.documentId,
            documentName: annotation.documentName || 'Document sans titre',
            documentUrl: annotation.documentUrl,
            annotations: []
          };
        }

        groupedAnnotations[annotation.documentId].annotations.push(annotation);
      });

      // Pour chaque document, capturer l'image avec annotations
      const processedDocuments = [];

      for (const docId of Object.keys(groupedAnnotations)) {
        const docData = groupedAnnotations[docId];

        try {
          console.log(`Capture du document ${docId} avec ${docData.annotations.length} annotations`);

          // Conversion des annotations pour compatibilité avec captureDocumentWithAnnotations
          const annotationsForCapture = docData.annotations.map(ann => ({
            id: ann.id || '',
            position: ann.position || { x: 0, y: 0 },
            resolved: ann.resolved || false,
            isResolved: ann.isResolved || false,
            createdAt: ann.createdAt || new Date().toISOString(),
          }));

          // Utiliser captureDocumentWithAnnotations pour générer l'image
          const capturedImageUrl = await captureDocumentWithAnnotations(
            docData.documentUrl,
            annotationsForCapture as Annotation[], // Conversion explicite
            docId
          );

          // Si l'image est en base64, la convertir en URL
          let finalUrl = capturedImageUrl;
          if (capturedImageUrl.startsWith('data:')) {
            try {
              // Tentative d'upload avec gestion de l'erreur
              finalUrl = await uploadImage(capturedImageUrl, projectId);
            } catch (uploadError) {
              console.error(`Erreur lors de l'upload de l'image: ${uploadError}`);

              // Important: en cas d'erreur d'upload, on utilise l'URL base64 directement
              // Cela permettra d'afficher l'image correctement même si l'upload a échoué
              finalUrl = capturedImageUrl;

              toast.warning("L'image avec annotations sera utilisée localement", {
                description: "Le stockage en ligne a échoué mais votre rapport sera créé correctement"
              });
            }
          }

          // Ajouter le document traité avec l'URL finale (qui peut être base64 si l'upload a échoué)
          processedDocuments.push({
            ...docData,
            capturedImageUrl: finalUrl
          });
        } catch (error) {
          console.error(`Erreur lors du traitement du document ${docId}:`, error);
          processedDocuments.push({
            ...docData,
            capturedImageUrl: docData.documentUrl // Utiliser l'URL d'origine en cas d'erreur
          });
        }
      }

      return processedDocuments;
    } catch (error) {
      console.error('Erreur lors du traitement des documents avec annotations:', error);
      return [];
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Fonction simple pour vérifier les permissions (utilise le localStorage au lieu de getSession)
  const checkUserPermissions = useCallback(async (projectId: string) => {
    try {
      // Simple vérification dans un projet démo
      return userPermissions;
    } catch (error) {
      console.error("Erreur lors de la vérification des permissions:", error);
      return { canUpload: true, canEdit: true };
    }
  }, [userPermissions]);

  // Utilisez le type Reserve ou BaseReserve
  const processReservesImages = useCallback(async (reserves: BaseReserve[], projectId: string) => {
    if (!reserves?.length) return reserves;

    setIsUploading(true);
    const processedReserves = [...reserves];

    try {
      for (let i = 0; i < processedReserves.length; i++) {
        const reserve = processedReserves[i];

        // Traiter les photos
        if (reserve.photos?.length) {
          const processedPhotos = [...reserve.photos];

          for (let j = 0; j < processedPhotos.length; j++) {
            const photo = processedPhotos[j];
            if (typeof photo === 'string' && photo.startsWith('data:')) {
              try {
                const url = await uploadImage(photo, projectId);
                processedPhotos[j] = url;
              } catch (error) {
                console.error('Erreur lors de l\'upload de photo de réserve:', error);
              }
            }
          }
          
          processedReserves[i] = { ...processedReserves[i], photos: processedPhotos };
        }
      }

      return processedReserves;
    } catch (error) {
      console.error('Erreur lors du traitement des réserves:', error);
      return reserves;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    isUploading,
    processAnnotationImages,
    processReservesImages,
    processDocumentAnnotations,
    uploadImage,
    uploadAnnotation,
    uploadDocument,
    uploadSignature,
    checkUserPermissions
  };
}