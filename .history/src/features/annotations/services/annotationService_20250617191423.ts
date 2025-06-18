import { Annotation, Document } from "@/types";
import { createApiClient } from "./apiClient";

// Service pour gérer les annotations avec l'API Railway
export const annotationService = {
  // Récupérer toutes les annotations d'un projet
  getProjectAnnotations: async (projectId: string): Promise<Annotation[]> => {
    const api = createApiClient();
    
    try {
      const annotations = await api.get<Annotation[]>(`/projects/${projectId}/annotations`);
      return annotations;
    } catch (error) {
      console.error(`Erreur lors de la récupération des annotations du projet ${projectId}:`, error);
      
      // Fallback sur localStorage
      try {
        // Récupérer les données stockées localement
        const storedData = localStorage.getItem(`project-annotations-${projectId}`);
        
        if (!storedData) {
          console.log(`Aucune annotation trouvée pour le projet ${projectId}`);
          return [];
        }
        
        const documents: Document[] = JSON.parse(storedData);
        
        // Fonction de validation d'URL
        const isValidImageUrl = (url: string): boolean => {
          if (!url) return false;
          
          // Détecter les URLs tronquées
          if (url.includes("[truncated]")) return false;
          
          // Détecter les data URLs qui semblent corrompues
          if (url.startsWith("data:") && url.length > 1000) {
            // Vérifier si l'URL se termine correctement (avec padding base64)
            const base64Part = url.split(",")[1] || "";
            if (base64Part.length % 4 !== 0) return false;
          }
          
          return true;
        };
        
        // Transformation des annotations
        const allAnnotations = documents.flatMap((doc) =>
          doc.annotations?.map((ann) => {
            // Vérifier et utiliser toutes les propriétés possibles
            let annotatedImage =
              ann.annotatedImageUrl ||
              ann.imageWithAnnotations ||
              ann.documentWithAnnotations ||
              doc.annotatedImageUrl ||
              doc.renderedAnnotationsUrl ||
              doc.url ||
              "";
            
            // Vérifier si l'URL est valide
            if (!isValidImageUrl(annotatedImage)) {
              console.warn(
                `URL d'annotation invalide détectée pour ${doc.id}/${ann.id}, utilisation d'un placeholder`
              );
              annotatedImage = "invalid-image"; // Sera remplacé par un placeholder dans le composant
            }
            
            return {
              ...ann,
              documentId: doc.id,
              documentName: doc.name || "Sans nom",
              documentUrl: doc.url || "",
              annotatedImageUrl: annotatedImage,
              imageWithAnnotations: annotatedImage,
            };
          }) || []
        );
        
        console.log(`${allAnnotations.length} annotations trouvées pour le projet ${projectId}`);
        return allAnnotations;
      } catch (localError) {
        console.error("Erreur lors du traitement des annotations locales:", localError);
        return [];
      }
    }
  },
  
  // Récupérer les documents avec annotations d'un projet
  getProjectDocuments: async (projectId: string): Promise<Document[]> => {
    const api = createApiClient();
    
    try {
      const documents = await api.get<Document[]>(`/projects/${projectId}/documents`);
      return documents;
    } catch (error) {
      console.error(`Erreur lors de la récupération des documents du projet ${projectId}:`, error);
      
      // Fallback sur localStorage
      try {
        const storedData = localStorage.getItem(`project-annotations-${projectId}`);
        if (!storedData) return [];
        
        return JSON.parse(storedData);
      } catch (localError) {
        console.error("Erreur lors du traitement des documents locaux:", localError);
        return [];
      }
    }
  },
  
  // Filtrer les annotations non résolues
  getUnresolvedAnnotations: async (projectId: string): Promise<Annotation[]> => {
    const annotations = await annotationService.getProjectAnnotations(projectId);
    return annotations.filter(ann => !ann.resolved && !ann.isResolved);
  },
  
  // Mettre à jour une annotation
  updateAnnotation: async (
    projectId: string,
    annotationId: string,
    data: Partial<Annotation>
  ): Promise<boolean> => {
    const api = createApiClient();
    
    try {
      await api.put(`/projects/${projectId}/annotations/${annotationId}`, data);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'annotation ${annotationId}:`, error);
      
      // Fallback sur localStorage
      try {
        const documents = await annotationService.getProjectDocuments(projectId);
        
        let updated = false;
        const updatedDocuments = documents.map(doc => {
          if (!doc.annotations) return doc;
          
          const updatedAnnotations = doc.annotations.map(ann => {
            if (ann.id === annotationId) {
              updated = true;
              return { ...ann, ...data };
            }
            return ann;
          });
          
          return { ...doc, annotations: updatedAnnotations };
        });
        
        if (updated) {
          localStorage.setItem(`project-annotations-${projectId}`, JSON.stringify(updatedDocuments));
        }
        
        return updated;
      } catch (localError) {
        console.error("Erreur lors de la mise à jour locale de l'annotation:", localError);
        return false;
      }
    }
  },
  
  // Supprimer une annotation
  deleteAnnotation: async (
    projectId: string,
    annotationId: string
  ): Promise<boolean> => {
    const api = createApiClient();
    
    try {
      await api.delete(`/projects/${projectId}/annotations/${annotationId}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'annotation ${annotationId}:`, error);
      
      // Fallback sur localStorage
      try {
        const documents = await annotationService.getProjectDocuments(projectId);
        
        let annotationDeleted = false;
        
        // Parcourir tous les documents pour trouver et supprimer l'annotation
        const updatedDocuments = documents.map(doc => {
          if (!doc.annotations || doc.annotations.length === 0) return doc;
          
          // Vérifier si l'annotation existe dans ce document
          const annotationExists = doc.annotations.some(ann => ann.id === annotationId);
          
          if (annotationExists) {
            // Filtrer pour enlever l'annotation spécifique
            const updatedAnnotations = doc.annotations.filter(ann => ann.id !== annotationId);
            annotationDeleted = true;
            return { ...doc, annotations: updatedAnnotations };
          }
          
          return doc;
        });
        
        if (annotationDeleted) {
          localStorage.setItem(`project-annotations-${projectId}`, JSON.stringify(updatedDocuments));
          return true;
        }
        
        return false;
      } catch (localError) {
        console.error("Erreur lors de la suppression locale de l'annotation:", localError);
        return false;
      }
    }
  },
  
  // Ajouter une annotation à un document
  addAnnotationToDocument: async (
    projectId: string,
    documentId: string,
    annotation: Omit<Annotation, "id">
  ): Promise<string | null> => {
    const api = createApiClient();
    
    try {
      const response = await api.post<{ id: string }>(`/projects/${projectId}/documents/${documentId}/annotations`, annotation);
      return response.id;
    } catch (error) {
      console.error(`Erreur lors de l'ajout d'une annotation au document ${documentId}:`, error);
      
      // Fallback sur localStorage
      try {
        const documents = await annotationService.getProjectDocuments(projectId);
        const docIndex = documents.findIndex(doc => doc.id === documentId);
        
        if (docIndex === -1) return null;
        
        // Générer un ID unique pour la nouvelle annotation
        const newAnnotationId = `ann-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
        const newAnnotation: Annotation = {
          id: newAnnotationId,
          ...annotation,
        };
        
        const updatedDocuments = [...documents];
        const document = updatedDocuments[docIndex];
        
        updatedDocuments[docIndex] = {
          ...document,
          annotations: [...(document.annotations || []), newAnnotation],
        };
        
        localStorage.setItem(`project-annotations-${projectId}`, JSON.stringify(updatedDocuments));
        
        return newAnnotationId;
      } catch (localError) {
        console.error("Erreur lors de l'ajout local de l'annotation:", localError);
        return null;
      }
    }
  },
  
  // Compter les annotations par statut
  countAnnotationsByStatus: async (projectId: string): Promise<{
    total: number;
    resolved: number;
    unresolved: number;
  }> => {
    const annotations = await annotationService.getProjectAnnotations(projectId);
    const total = annotations.length;
    const resolved = annotations.filter(ann => ann.resolved || ann.isResolved).length;
    
    return {
      total,
      resolved,
      unresolved: total - resolved,
    };
  }
};

// Exporter les fonctions individuelles pour la compatibilité avec le code existant
export const getProjectAnnotations = annotationService.getProjectAnnotations;
export const getProjectDocuments = annotationService.getProjectDocuments;
export const getUnresolvedAnnotations = annotationService.getUnresolvedAnnotations;
export const updateAnnotation = annotationService.updateAnnotation;
export const deleteAnnotation = annotationService.deleteAnnotation;
export const addAnnotationToDocument = annotationService.addAnnotationToDocument;
export const countAnnotationsByStatus = annotationService.countAnnotationsByStatus;