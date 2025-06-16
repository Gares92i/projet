import { Annotation, Document } from "@/types";
import { generateAnnotatedSVG } from "@/utils/svgGenerationService";

// Fonction pour récupérer les annotations d'un projet
export const getProjectAnnotations = async (projectId: string): Promise<Annotation[]> => {
  try {
    // Récupérer les données stockées localement
    const storedData = localStorage.getItem(`project-annotations-${projectId}`);

    if (!storedData) {
      console.log(`Aucune annotation trouvée pour le projet ${projectId}`);
      return [];
    }

    const documents: Document[] = JSON.parse(storedData);

    // Dans la fonction getProjectAnnotations ou loadAnnotations

    // Ajouter cette fonction de validation d'URL
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

    // Puis dans la transformation des annotations:
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
  } catch (error) {
    console.error("Erreur lors de la récupération des annotations:", error);
    return [];
  }
};
// Fonction pour récupérer les documents avec annotations d'un projet
export const getProjectDocuments = async (projectId: string): Promise<Document[]> => {
  try {
    // Récupérer les données stockées localement
    const storedData = localStorage.getItem(`project-annotations-${projectId}`);

    if (!storedData) {
      return [];
    }

    return JSON.parse(storedData);
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    return [];
  }
};

// Fonction pour filtrer les annotations non résolues
export const getUnresolvedAnnotations = async (projectId: string): Promise<Annotation[]> => {
  const annotations = await getProjectAnnotations(projectId);
  return annotations.filter((ann) => !ann.resolved && !ann.isResolved);
};

// Fonction pour mettre à jour une annotation
export const updateAnnotation = async (
  projectId: string,
  annotationId: string,
  data: Partial<Annotation>
): Promise<boolean> => {
  try {
    const documents = await getProjectDocuments(projectId);

    let updated = false;
    const updatedDocuments = documents.map((doc) => {
      if (!doc.annotations) return doc;

      const updatedAnnotations = doc.annotations.map((ann) => {
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
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'annotation:", error);
    return false;
  }
};

// Ajouter ces fonctions entre les fonctions existantes

// Fonction pour récupérer les annotations d'un document spécifique
export const getDocumentAnnotations = async (projectId: string, documentId: string): Promise<Annotation[]> => {
  try {
    const documents = await getProjectDocuments(projectId);
    const document = documents.find((doc) => doc.id === documentId);

    if (!document || !document.annotations) {
      return [];
    }

    return document.annotations;
  } catch (error) {
    console.error(`Erreur lors de la récupération des annotations du document ${documentId}:`, error);
    return [];
  }
};

// Fonction pour récupérer les données d'un document spécifique
export const getDocument = async (documentId: string): Promise<Document | null> => {
  try {
    // Récupérer tous les projets qui pourraient contenir ce document
    const projectKeys = Object.keys(localStorage).filter((key) => key.startsWith("project-annotations-"));

    for (const projectKey of projectKeys) {
      const projectId = projectKey.replace("project-annotations-", "");
      const documents = await getProjectDocuments(projectId);
      const document = documents.find((doc) => doc.id === documentId);

      if (document) {
        return document;
      }
    }

    console.log(`Document ${documentId} non trouvé dans les projets`);
    return null;
  } catch (error) {
    console.error(`Erreur lors de la récupération du document ${documentId}:`, error);
    return null;
  }
};

// Fonction pour mettre à jour un document spécifique
export const updateDocument = async (documentId: string, data: Partial<Document>): Promise<boolean> => {
  try {
    // Récupérer tous les projets qui pourraient contenir ce document
    // Modifier cette ligne pour exclure les clés avec des suffixes comme "-lastAccess"
    const projectKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('project-annotations-') && !key.includes('-lastAccess'));
    
    for (const projectKey of projectKeys) {
      const projectId = projectKey.replace('project-annotations-', '');
      
      // Récupérer les documents du projet
      const storedData = localStorage.getItem(projectKey);
      if (!storedData) continue;
      
      try {
        // S'assurer que nous avons bien un tableau
        const documents = JSON.parse(storedData);
        
        // Vérifier que documents est bien un tableau avant de continuer
        if (!Array.isArray(documents)) {
          console.error(`Les documents pour ${projectId} ne sont pas un tableau:`, documents);
          continue;
        }
        
        // Chercher le document par ID
        const docIndex = documents.findIndex(doc => doc.id === documentId);
        
        if (docIndex !== -1) {
          // Document trouvé, le mettre à jour
          const updatedDocuments = [...documents];
          updatedDocuments[docIndex] = {
            ...updatedDocuments[docIndex],
            ...data
          };
          
          // Sauvegarder les modifications
          localStorage.setItem(projectKey, JSON.stringify(updatedDocuments));
          console.log(`Document ${documentId} mis à jour avec succès dans ${projectId}`);
          return true;
        }
      } catch (parseError) {
        console.error(`Erreur de parsing des données pour ${projectId}:`, parseError);
      }
    }
    
    console.warn(`Document ${documentId} non trouvé, impossible de mettre à jour`);
    return false;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du document ${documentId}:`, error);
    return false;
  }
};

// Ajouter ces fonctions à la fin du fichier

// Fonction pour supprimer un document et toutes ses annotations
export const deleteDocument = async (
  projectId: string,
  documentId: string
): Promise<boolean> => {
  try {
    const documents = await getProjectDocuments(projectId);

    // Vérifier si le document existe
    const documentIndex = documents.findIndex((doc) => doc.id === documentId);
    if (documentIndex === -1) {
      return false;
    }

    // Filtrer pour enlever le document
    const updatedDocuments = documents.filter((doc) => doc.id !== documentId);

    // Sauvegarder les documents mis à jour
    localStorage.setItem(`project-annotations-${projectId}`, JSON.stringify(updatedDocuments));

    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression du document:", error);
    return false;
  }
};

// Fonction pour supprimer une annotation spécifique
export const deleteAnnotation = async (
  projectId: string,
  annotationId: string
): Promise<boolean> => {
  try {
    const documents = await getProjectDocuments(projectId);

    let annotationDeleted = false;

    // Parcourir tous les documents pour trouver et supprimer l'annotation
    const updatedDocuments = documents.map((doc) => {
      if (!doc.annotations || doc.annotations.length === 0) return doc;

      // Vérifier si l'annotation existe dans ce document
      const annotationExists = doc.annotations.some((ann) => ann.id === annotationId);

      if (annotationExists) {
        // Filtrer pour enlever l'annotation spécifique
        const updatedAnnotations = doc.annotations.filter((ann) => ann.id !== annotationId);
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
  } catch (error) {
    console.error("Erreur lors de la suppression de l'annotation:", error);
    return false;
  }
};

// Ajouter une annotation à un document
export const addAnnotationToDocument = async (
  projectId: string,
  documentId: string,
  annotation: Omit<Annotation, "id">
): Promise<string | null> => {
  try {
    const documents = await getProjectDocuments(projectId);
    const docIndex = documents.findIndex((doc) => doc.id === documentId);

    if (docIndex === -1) return null;

    // Générer un ID unique pour la nouvelle annotation
    const newAnnotationId = `ann-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
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

    // Récupérer toutes les annotations pour ce document
    const existingAnnotations = await getDocumentAnnotations(projectId, documentId);

    // Générer l'image SVG avec toutes les annotations
    const documentData = await getDocument(documentId);
    if (documentData && documentData.url) {
      const svgUrl = await generateAnnotatedSVG(
        documentData.url,
        [...existingAnnotations, newAnnotation],
        documentId
      );

      // Stocker l'URL de l'image SVG générée dans le document
      await updateDocument(documentId, {
        capturedImageUrl: svgUrl,
      });
    }

    return newAnnotationId;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'annotation:", error);
    return null;
  }
};

// Fonction pour compter les annotations par statut
export const countAnnotationsByStatus = async (projectId: string): Promise<{
  total: number;
  resolved: number;
  unresolved: number;
}> => {
  const annotations = await getProjectAnnotations(projectId);
  const total = annotations.length;
  const resolved = annotations.filter((ann) => ann.resolved || ann.isResolved).length;

  return {
    total,
    resolved,
    unresolved: total - resolved,
  };
};