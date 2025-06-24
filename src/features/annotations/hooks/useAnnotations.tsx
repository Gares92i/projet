import { useState, useCallback, useEffect, useRef } from "react";
import { Document, Annotation } from "@/app/styles";
import { toast } from "sonner";

export const useAnnotations = (initialDocuments: Document[] = [], projectId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);

  // Utiliser useRef pour suivre si les données ont déjà été chargées
  const dataLoaded = useRef(false);

  // Charger les données du localStorage au montage du composant uniquement
  useEffect(() => {
    // Éviter de recharger les données si elles ont déjà été chargées
    if (dataLoaded.current) return;

    const loadSavedData = () => {
      try {
        const storageKey = `project-annotations-${projectId}`;
        const savedDocuments = localStorage.getItem(storageKey);

        if (savedDocuments) {
          const parsedDocuments = JSON.parse(savedDocuments);
          console.log("Documents chargés depuis localStorage:", parsedDocuments.length);
          setDocuments(parsedDocuments);

          // Activer le premier document s'il y en a
          if (parsedDocuments.length > 0) {
            setActiveDocument(parsedDocuments[0]);
          }

          dataLoaded.current = true;
        } else if (initialDocuments.length > 0) {
          console.log("Utilisation des documents initiaux:", initialDocuments.length);
          setDocuments(initialDocuments);
          setActiveDocument(initialDocuments[0]);
          dataLoaded.current = true;
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };

    loadSavedData();
  }, [projectId, initialDocuments]);

  // Sauvegarder les documents dans localStorage à chaque modification avec gestion des erreurs de quota
  // Modifier saveProjectData pour gérer les grandes images

  const saveProjectData = useCallback((data: Document[]) => {
    try {
      // Optimiser les données avant sauvegarde
      const dataToSave = data.map(doc => {
        // Optimisation pour les documents
        if (doc.type === "img" && doc.url && doc.url.length > 100000) {
          // Au lieu de tronquer l'URL, créer une URL placeholder
          const placeholderUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEXm5uTvDeOeAAAAH0lEQVRoge3BAQ0AAADCIPunNsc3YAAAAAAAAAAAADwDTbgAAUiIBVoAAAAASUVORK5CYII=`;
          
          console.log(`Image volumineuse détectée pour ${doc.name || doc.id}, remplacée par placeholder`);
          
          return {
            ...doc,
            url: placeholderUrl,
            _hasPlaceholder: true // Marquer ce document pour référence
          };
        }
        
        // Optimisation pour les annotations avec photos
        if (doc.annotations && doc.annotations.length > 0) {
          const optimizedAnnotations = doc.annotations.map(ann => {
            if (ann.photos && ann.photos.length > 0) {
              // Vérifier et potentiellement compresser les photos volumineuses
              const optimizedPhotos = ann.photos.map(photo => {
                if (photo.length > 100000) {
                  console.log(`Photo volumineuse détectée dans annotation ${ann.id}, optimisation...`);
                  // Option 1: Stocker séparément en utilisant un identifiant
                  localStorage.setItem(`photo-${ann.id}-${Date.now()}`, photo);
                  return `photo-ref:${ann.id}-${Date.now()}`;
                  
                  // Option 2: Conserver mais avertir
                  // return photo; // Conserver l'original mais avertir
                }
                return photo;
              });
              
              return { ...ann, photos: optimizedPhotos };
            }
            return ann;
          });
          
          return { ...doc, annotations: optimizedAnnotations };
        }
        
        return doc;
      });
      
      localStorage.setItem(`project-annotations-${projectId}`, JSON.stringify(dataToSave));
      console.log("Données sauvegardées avec succès");
      return true;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des données:", error);
      
      // Si l'erreur est due à un dépassement de quota
      if (error instanceof DOMException && 
          (error.name === 'QuotaExceededError' || error.name === 'QUOTA_EXCEEDED_ERR')) {
        
        // Tenter de sauvegarder une version plus légère
        try {
          const lightData = data.map(doc => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            annotations: doc.annotations
          }));
          
          localStorage.setItem(`project-annotations-${projectId}-light`, JSON.stringify(lightData));
          toast.warning("Stockage limité: certaines images ne seront pas sauvegardées", {
            duration: 5000
          });
        } catch (innerError) {
          console.error("Échec total de la sauvegarde:", innerError);
        }
      }
      return false;
    }
  }, [projectId]);

  // Nettoyer le stockage pour libérer de l'espace
  const cleanupStorage = useCallback(() => {
    try {
      // Identifier les clés de stockage qui ne sont pas le projet actuel
      const keysToCheck = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('project-annotations-') && key !== `project-annotations-${projectId}`) {
          keysToCheck.push(key);
        }
      }
      
      // Si on a plus de 3 autres projets, supprimer les plus anciens
      if (keysToCheck.length > 3) {
        // Trier par date de dernier accès si disponible, sinon supprimer les premiers trouvés
        keysToCheck.sort((a, b) => {
          const accessA = localStorage.getItem(`${a}-lastAccess`) || '0';
          const accessB = localStorage.getItem(`${b}-lastAccess`) || '0';
          return parseInt(accessA) - parseInt(accessB);
        });
        
        // Supprimer les plus anciens pour ne garder que 3 projets max
        for (let i = 0; i < keysToCheck.length - 3; i++) {
          localStorage.removeItem(keysToCheck[i]);
          localStorage.removeItem(`${keysToCheck[i]}-lastAccess`);
          console.log(`Nettoyage du stockage: projet ${keysToCheck[i]} supprimé`);
        }
      }
      
      // Marquer ce projet comme dernièrement accédé
      localStorage.setItem(`project-annotations-${projectId}-lastAccess`, Date.now().toString());
      
    } catch (error) {
      console.error("Erreur lors du nettoyage du stockage:", error);
    }
  }, [projectId]);

  // Appeler le nettoyage au chargement
  useEffect(() => {
    cleanupStorage();
  }, [cleanupStorage]);

  // Mettre à jour les documents et sauvegarder automatiquement
  const updateAndSaveDocuments = useCallback((newDocuments: Document[]) => {
    setDocuments(newDocuments);
    saveProjectData(newDocuments);
  }, [saveProjectData]);

  // Réinitialiser les données du projet
  const resetProjectData = useCallback(() => {
    setDocuments([]);
    setActiveDocument(null);
    setSelectedAnnotation(null);
    setIsAnnotationDialogOpen(false);
    localStorage.removeItem(`project-annotations-${projectId}`);

    // Réinitialiser le flag pour permettre un nouveau chargement
    dataLoaded.current = false;
  }, [projectId]);

  // Sélectionner un document
  const handleSelectDocument = useCallback((document: Document) => {
    setActiveDocument(document);
    setSelectedAnnotation(null);
  }, []);

  // Ajouter un nouveau document
  const addNewDocument = useCallback((url: string, name: string, type: "pdf" | "img") => {
    const newDocument: Document = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: name || `Document ${documents.length + 1}`,
      url,
      type,
      annotations: []
    };

    const updatedDocuments = [...documents, newDocument];
    updateAndSaveDocuments(updatedDocuments);
    setActiveDocument(newDocument);

    return newDocument;
  }, [documents, updateAndSaveDocuments]);

  // Ajouter une annotation
  const handleAddAnnotation = useCallback((position: { x: number; y: number }) => {
    if (!activeDocument) return;

    // Assurez-vous que les coordonnées sont normalisées (0-100)
    const normalizedX = Math.max(0, Math.min(100, position.x)); 
    const normalizedY = Math.max(0, Math.min(100, position.y));

    const newAnnotation: Annotation = {
      id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      documentId: activeDocument.id,
      projectId: projectId,
      x: normalizedX, // Utiliser des valeurs normalisées
      y: normalizedY, // Utiliser des valeurs normalisées
      position: { x: normalizedX, y: normalizedY }, // Garder la compatibilité avec les deux formes
      comment: "",
      resolved: false,
      isResolved: false, // Pour compatibilité
      createdAt: new Date().toISOString(),
      photos: [],
    };

    const updatedAnnotations = [
      ...(activeDocument.annotations || []),
      newAnnotation
    ];

    const updatedDocument = {
      ...activeDocument,
      annotations: updatedAnnotations
    };

    const updatedDocuments = documents.map(doc =>
      doc.id === activeDocument.id ? updatedDocument : doc
    );

    updateAndSaveDocuments(updatedDocuments);
    setActiveDocument(updatedDocument);
    setSelectedAnnotation(newAnnotation);
    setIsAnnotationDialogOpen(true);
  }, [activeDocument, documents, updateAndSaveDocuments]);

  // Toggle resolved status
  const handleToggleResolved = useCallback((id: string, resolved?: boolean) => {
    if (!activeDocument) return;

    const annotation = activeDocument.annotations?.find(a => a.id === id);
    if (!annotation) return;

    const isCurrentlyResolved = annotation.resolved || annotation.isResolved;
    const newResolvedState = resolved !== undefined ? resolved : !isCurrentlyResolved;

    const updatedAnnotations = activeDocument.annotations?.map(a => {
      if (a.id === id) {
        return {
          ...a,
          resolved: newResolvedState,
          isResolved: newResolvedState, // Pour compatibilité
          resolvedDate: newResolvedState ? new Date().toISOString() : undefined
        };
      }
      return a;
    }) || [];

    const updatedDocument = {
      ...activeDocument,
      annotations: updatedAnnotations
    };

    const updatedDocuments = documents.map(doc =>
      doc.id === activeDocument.id ? updatedDocument : doc
    );

    updateAndSaveDocuments(updatedDocuments);
    setActiveDocument(updatedDocument);
    
    // Mettre à jour l'annotation sélectionnée si c'est celle-ci
    if (selectedAnnotation?.id === id) {
      setSelectedAnnotation({
        ...selectedAnnotation,
        resolved: newResolvedState,
        isResolved: newResolvedState, // Pour compatibilité
        resolvedDate: newResolvedState ? new Date().toISOString() : undefined
      });
    }
  }, [activeDocument, documents, selectedAnnotation, updateAndSaveDocuments]);

  // Mettre à jour le commentaire d'une annotation
  const handleUpdateComment = useCallback((id: string, comment: string) => {
    if (!activeDocument) return;

    const updatedAnnotations = activeDocument.annotations?.map(a => {
      if (a.id === id) {
        return { ...a, comment };
      }
      return a;
    }) || [];

    const updatedDocument = {
      ...activeDocument,
      annotations: updatedAnnotations
    };

    const updatedDocuments = documents.map(doc =>
      doc.id === activeDocument.id ? updatedDocument : doc
    );

    updateAndSaveDocuments(updatedDocuments);
    setActiveDocument(updatedDocument);

    // Mettre à jour l'annotation sélectionnée si c'est celle-ci
    if (selectedAnnotation?.id === id) {
      setSelectedAnnotation({ ...selectedAnnotation, comment });
    }
  }, [activeDocument, documents, selectedAnnotation, updateAndSaveDocuments]);

  // Fonction pour mettre à jour une annotation avec de nouvelles données
  const handleUpdateAnnotation = useCallback(
    async (documentId: string, annotationId: string, updatedData: Partial<Annotation>) => {
      try {
        // Mise à jour dans la mémoire
        const updatedDocs = documents.map((doc) => {
          if (doc.id === documentId) {
            const updatedAnnotations = doc.annotations?.map((ann) => {
              if (ann.id === annotationId) {
                // Vérifier si des photos ont été modifiées
                if (updatedData.photos && ann.photos) {
                  // Pour chaque photo modifiée, sauvegarder une copie dans le stockage
                  updatedData.photos = updatedData.photos.map((photo, index) => {
                    // Si c'est une nouvelle image éditée (base64)
                    if (photo.startsWith('data:image') && photo !== ann.photos?.[index]) {
                      // On pourrait ici envoyer l'image à un service de stockage
                      // Pour l'instant, on garde l'URL base64
                      console.log("Image modifiée détectée:", photo.substring(0, 30) + "...");
                    }
                    return photo;
                  });
                }
                
                return {
                  ...ann,
                  ...updatedData,
                };
              }
              return ann;
            });
            
            return {
              ...doc,
              annotations: updatedAnnotations,
            };
          }
          return doc;
        });
        
        setDocuments(updatedDocs);
        
        // Sauvegarder dans le stockage persistant
        saveProjectData(updatedDocs);
        
        return true;
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'annotation:", error);
        return false;
      }
    },
    [documents, projectId, saveProjectData]
  );

  // Ajouter une photo à une annotation
  const handleAddPhoto = useCallback((id: string, photoUrl: string) => {
    if (!activeDocument) return;

    const updatedAnnotations = activeDocument.annotations?.map(a => {
      if (a.id === id) {
        const photos = a.photos || [];
        return { ...a, photos: [...photos, photoUrl] };
      }
      return a;
    }) || [];

    const updatedDocument = {
      ...activeDocument,
      annotations: updatedAnnotations
    };

    const updatedDocuments = documents.map(doc =>
      doc.id === activeDocument.id ? updatedDocument : doc
    );

    updateAndSaveDocuments(updatedDocuments);
    setActiveDocument(updatedDocument);

    // Mettre à jour l'annotation sélectionnée si c'est celle-ci
    if (selectedAnnotation?.id === id) {
      const photos = selectedAnnotation.photos || [];
      setSelectedAnnotation({ ...selectedAnnotation, photos: [...photos, photoUrl] });
    }
  }, [activeDocument, documents, selectedAnnotation, updateAndSaveDocuments]);

  // Supprimer une photo d'une annotation
  const handleRemovePhoto = useCallback((id: string, photoIndex: number) => {
    if (!activeDocument) return;

    const updatedAnnotations = activeDocument.annotations?.map(a => {
      if (a.id === id && a.photos) {
        const updatedPhotos = [...a.photos];
        updatedPhotos.splice(photoIndex, 1);
        return { ...a, photos: updatedPhotos };
      }
      return a;
    }) || [];

    const updatedDocument = {
      ...activeDocument,
      annotations: updatedAnnotations
    };

    const updatedDocuments = documents.map(doc =>
      doc.id === activeDocument.id ? updatedDocument : doc
    );

    updateAndSaveDocuments(updatedDocuments);
    setActiveDocument(updatedDocument);

    // Mettre à jour l'annotation sélectionnée si c'est celle-ci
    if (selectedAnnotation?.id === id && selectedAnnotation.photos) {
      const updatedPhotos = [...selectedAnnotation.photos];
      updatedPhotos.splice(photoIndex, 1);
      setSelectedAnnotation({ ...selectedAnnotation, photos: updatedPhotos });
    }
  }, [activeDocument, documents, selectedAnnotation, updateAndSaveDocuments]);

  // Cliquer sur une annotation dans la liste
  const handleAnnotationClick = useCallback((annotation: Annotation) => {
    setSelectedAnnotation(annotation);
    setIsAnnotationDialogOpen(true);
  }, []);

  // Mettre en évidence une annotation sur le document
  const handleHighlightAnnotation = useCallback((annotation: Annotation) => {
    setSelectedAnnotation(annotation);
  }, []);

  // Mettre à jour un document (utilisé quand on change la vue du document)
  const handleDocumentUpdate = useCallback((dataUrl: string) => {
    if (!activeDocument) return;

    const updatedDocument = {
      ...activeDocument,
      url: dataUrl
    };

    const updatedDocuments = documents.map(doc =>
      doc.id === activeDocument.id ? updatedDocument : doc
    );

    updateAndSaveDocuments(updatedDocuments);
    setActiveDocument(updatedDocument);
  }, [activeDocument, documents, updateAndSaveDocuments]);

  // Exporter les annotations au format JSON
  const exportAnnotations = useCallback(() => {
    try {
      const data = JSON.stringify(documents, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `annotations-${projectId}-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success("Annotations exportées avec succès");
    } catch (error) {
      console.error('Erreur lors de l\'exportation des annotations:', error);
      toast.error("Erreur lors de l'exportation des annotations");
    }
  }, [documents, projectId]);

  return {
    documents,
    setDocuments: updateAndSaveDocuments,
    activeDocument,
    selectedAnnotation,
    setSelectedAnnotation,
    isAnnotationDialogOpen,
    setIsAnnotationDialogOpen,
    handleSelectDocument,
    handleAddAnnotation,
    handleToggleResolved,
    handleDocumentUpdate,
    handleAnnotationClick,
    handleHighlightAnnotation,
    handleAddPhoto,
    handleRemovePhoto,
    handleUpdateComment,
    handleUpdateAnnotation,
    addNewDocument,
    resetProjectData,
    saveProjectData,
    exportAnnotations
  };
};

export default useAnnotations;
