import React, { useState, useEffect, useRef, useCallback } from "react";
import { DocumentsSidebar } from "./DocumentsSidebar";
import { AnnotationsSidebar } from "./AnnotationsSidebar";
import { MainContent } from "./MainContent";
import { AnnotationDialog } from "./AnnotationDialog";
import { ConvertToTaskDialog } from "./ConvertToTaskDialog";
import { toast } from "sonner";
import { useAnnotations } from "../hooks/useAnnotations";
import { Document, Annotation } from "@/app/styles";
import { useIsMobile } from "@/features/common/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/ui/sheet";
import { Button } from "@/ui/button";
import { FileText, MessageSquare, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { ErrorBoundary } from "@/features/layout/components/ErrorBoundary";
// import { uploadAnnotation, } from '@/features/storage/services/storageService';
// Ajoutez cet import
import { deleteDocument, deleteAnnotation, updateDocument } from '../services/annotationService';

import html2canvas from 'html2canvas';

export const PlanViewerPage = () => {
  // Remplacez le tableau initialDocuments par un tableau vide pour éviter les erreurs de document sans URL valide
  const initialDocuments: Document[] = [];

  const isMobile = useIsMobile();
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [annotationsOpen, setAnnotationsOpen] = useState(false);
  const [isConvertToTaskOpen, setIsConvertToTaskOpen] = useState(false);
  const { id: projectId } = useParams<{ id: string }>();

  // Ajoutez un état pour suivre si c'est le premier chargement
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the custom hook to manage annotations state and logic
  const {
    documents,
    activeDocument,
    selectedAnnotation,
    setSelectedAnnotation, // Assurez-vous que cette ligne est présente
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
    setDocuments, // Cette propriété sera disponible après la mise à jour du hook
    // Cette propriété aussi
    resetProjectData, // Récupérez la nouvelle fonction
  } = useAnnotations(initialDocuments, projectId || "default");

  // Debug: Log documents changes
  const prevDocLength = useRef(documents.length);
  useEffect(() => {
    if (prevDocLength.current !== documents.length) {
      console.log("Documents mis à jour:", documents.length);
      prevDocLength.current = documents.length;
    }
  }, [documents]);

  // Ajoutez ce useEffect pour vérifier les mises à jour de activeDocument
  useEffect(() => {
    let timeoutId: number;

    if (activeDocument) {
      // Utiliser setTimeout pour éviter les logs répétitifs
      timeoutId = window.setTimeout(() => {
        if (!activeDocument.url || activeDocument.url === "/placeholder.svg") {
          console.warn("Document sans URL valide:", activeDocument.id);
        }
      }, 500);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [activeDocument]);

  // Ajoutez un useEffect pour marquer la fin du premier chargement
  useEffect(() => {
    if (documents.length > 0 || activeDocument) {
      setIsFirstLoad(false);
    }

    // Si après un délai il n'y a toujours pas de documents, désactiver l'état de premier chargement
    const timer = setTimeout(() => {
      setIsFirstLoad(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [documents, activeDocument]);

  // Ajoutez ce log pour déboguer les annotations

  // Dans PlanViewerPage.tsx après la définition de vos états
  useEffect(() => {
    if (activeDocument) {
      console.log("Document actif:", activeDocument.name);
      console.log(
        "Annotations sur ce document:",
        activeDocument.annotations?.length || 0
      );
      console.log("Annotations détails:", activeDocument.annotations);
    }
  }, [activeDocument]);

  const handleConvertToTask = useCallback(
    (annotation?: Annotation) => {
      if (annotation || selectedAnnotation) {
        setIsConvertToTaskOpen(true);
      } else {
        toast.error(
          "Veuillez sélectionner une annotation à convertir en tâche"
        );
      }
    },
    [selectedAnnotation, setIsConvertToTaskOpen]
  );

  const handleTaskCreated = () => {
    setIsConvertToTaskOpen(false);
    if (selectedAnnotation) {
      handleToggleResolved(selectedAnnotation.id);
      toast.success(
        "L'annotation a été convertie en tâche et marquée comme résolue"
      );
    }
  };

  // Correction de la fonction handleAddNewDocument

  const handleAddNewDocument = useCallback(
    (url: string, filename: string) => {
      console.log("handleAddNewDocument appelé avec:", filename);
      if (!url) {
        console.error("URL vide fournie à handleAddNewDocument");
        toast.error("Impossible d'ajouter le document : URL invalide");
        return;
      }

      const type = url.startsWith("data:application/pdf") ? "pdf" : "img";

      try {
        // Vérifier que addNewDocument est bien défini
        if (!addNewDocument) {
          console.error("La fonction addNewDocument n'est pas disponible");
          toast.error("Impossible d'ajouter le document : erreur interne");
          return;
        }

        // Assurez-vous que le nom du document est bien préservé
        const cleanFilename = filename || `Document_${Date.now()}`;
        addNewDocument(url, cleanFilename, type);

        // Afficher un message de succès directement
        console.log("Nouveau document ajouté:", cleanFilename);
        toast.success(`Document "${cleanFilename}" ajouté avec succès`);
      } catch (error) {
        console.error("Erreur dans handleAddNewDocument:", error);
        toast.error("Erreur lors de l'ajout du document");
      }
    },
    [addNewDocument]
  );
  const handleAddAnnotationWithUpload = async (position, imageData) => {
    let imageUrl = null;

    // Si des données d'image sont fournies (capture d'écran, etc.)
    if (imageData && imageData.startsWith("data:")) {
      try {
        imageUrl = await uploadAnnotation(imageData, projectId);
      } catch (error) {
        console.error(
          "Erreur lors de l'upload de l'image d'annotation:",
          error
        );
        toast.error("Erreur lors de l'upload de l'image");
      }
    }

    // Utiliser la fonction du hook avec la position qui inclut l'URL de l'image
    const positionWithImage = imageUrl ? { ...position, imageUrl } : position;
    handleAddAnnotation(positionWithImage);
  };

  // Puis modifiez les dépendances du callback
  const handleAddAnnotationCallback = useCallback(
    (position, imageData) => {
      console.log("handleAddAnnotationCallback:", position);
      handleAddAnnotationWithUpload(position, imageData);
    },
    [projectId, handleAddAnnotation] // Remplacez handleAddAnnotationWithUpload par handleAddAnnotation
  );
  const handleDocumentUpdateCallback = useCallback(
    (url, filename) =>
      handleAddNewDocument(url, filename || `Document_${Date.now()}`),
    [handleAddNewDocument]
  );
  const handleAnnotationClickCallback = useCallback(
    (annotation) => handleAnnotationClick(annotation),
    [handleAnnotationClick]
  );

  // Dans le composant PlanViewerPage, ajoutez une fonction qui utilise handleConvertToTask
  const convertToTask = useCallback(() => {
    if (selectedAnnotation) {
      handleConvertToTask(selectedAnnotation);
      toast.success("Tâche créée avec succès!");
      setIsAnnotationDialogOpen(false);
      // Optionnellement, rediriger vers la page des tâches
      // history.push(`/project/${projectId}/tasks`);
    }
  }, [selectedAnnotation, handleConvertToTask, setIsAnnotationDialogOpen]);

  // Fonction pour ouvrir le sélecteur de fichier
  const handleOpenFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Ajout de la fonction pour supprimer des annotations
 const handleDeleteAnnotation = async (annotation: Annotation) => {
   try {
     if (
       !window.confirm("Êtes-vous sûr de vouloir supprimer cette annotation ?")
     ) {
       return;
     }

     // Supprimer l'annotation dans le service
     const success = await deleteAnnotation(projectId, annotation.id);

     if (success) {
       // Au lieu d'utiliser setAnnotations, mettre à jour les documents
       // et filtrer les annotations à partir de là
       const updatedDocs = documents.map((doc) => {
         if (doc.id === annotation.documentId) {
           return {
             ...doc,
             annotations: (doc.annotations || []).filter(
               (ann) => ann.id !== annotation.id
             ),
           };
         }
         return doc;
       });

       setDocuments(updatedDocs);

       // Déselectionner si c'était l'annotation active
       if (selectedAnnotation?.id === annotation.id) {
         setSelectedAnnotation(null);
       }

       toast.success("Annotation supprimée avec succès");
     } else {
       toast.error("Erreur lors de la suppression de l'annotation");
     }
   } catch (error) {
     console.error("Erreur lors de la suppression de l'annotation:", error);
     toast.error("Erreur lors de la suppression de l'annotation");
   }
 };

  const handleRepositionAnnotation = useCallback(
    (annotationId: string, newPosition: { x: number; y: number }) => {
      if (!activeDocument || !handleUpdateAnnotation) return;

      console.log(
        `Repositionnement de l'annotation ${annotationId} vers:`,
        newPosition
      );

      // Corriger l'appel avec les 3 arguments requis (documentId, annotationId, updatedData)
      handleUpdateAnnotation(
        activeDocument.id,  // Ajouter le documentId comme premier argument
        annotationId,
        {
          x: newPosition.x,
          y: newPosition.y,
          position: { x: newPosition.x, y: newPosition.y },
        }
      );

      toast.success("Position de l'annotation mise à jour");
    },
    [activeDocument, handleUpdateAnnotation]
  );

  // Ajoutez cette fonction avant le return
const handleDeleteDocument = async (documentId: string) => {
  try {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      return;
    }

    // Supprimer le document dans le service
    const success = await deleteDocument(projectId, documentId);

    if (success) {
      // Mettre à jour l'état local
      const updatedDocs = documents.filter((doc) => doc.id !== documentId);
      setDocuments(updatedDocs);

      // Si le document actif a été supprimé, sélectionner un autre ou null
      if (activeDocument?.id === documentId) {
        if (updatedDocs.length > 0) {
          handleSelectDocument(updatedDocs[0]);
        } else {
          handleSelectDocument(null); // Assurez-vous que cette fonction gère le cas null
        }
      }

      toast.success("Document supprimé avec succès");
    } else {
      toast.error("Erreur lors de la suppression du document");
    }
  } catch (error) {
    console.error("Erreur lors de la suppression du document:", error);
    toast.error("Erreur lors de la suppression du document");
  }
};

  // Ajouter cette fonction adaptateur après la déclaration des autres fonctions

  // Créer un adaptateur pour convertir handleUpdateAnnotation (3 params) vers le format attendu par AnnotationDialog (2 params)
  const handleUpdateAnnotationAdapter = useCallback(
    (annotationId: string, updatedData: Partial<Annotation>) => {
      if (!activeDocument || !handleUpdateAnnotation) return Promise.resolve(false);
      
      console.log("Mise à jour de l'annotation via adaptateur:", annotationId, updatedData);
      
      // Appeler la fonction originale avec le document actif comme premier paramètre
      return handleUpdateAnnotation(activeDocument.id, annotationId, updatedData);
    },
    [activeDocument, handleUpdateAnnotation]
  );

  // Ajouter cette fonction dans PlanViewerPage.tsx ou dans un fichier utilitaire

const captureViewer = async (viewerRef, annotations, documentId) => {
  try {
    // S'assurer que le viewer est complètement chargé
    if (!viewerRef.current) {
      console.error("Référence du viewer non disponible");
      return null;
    }

    console.log("Capture du viewer en cours...");
    
    // Ajouter une classe temporaire pour optimiser la capture
    viewerRef.current.classList.add("capturing");
    
    // Attendre que tous les éléments soient rendus
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Configuration de html2canvas
    const canvas = await html2canvas(viewerRef.current, {
      useCORS: true,            // Permettre les images cross-origin
      allowTaint: true,         // Autoriser les images qui pourraient "tainted" le canvas
      scale: 2,                 // Qualité doublée pour plus de netteté
      backgroundColor: "#fff",  // Fond blanc
      logging: false,           // Désactiver les logs pour la performance
      onclone: (documentClone) => {
        // Modifier le DOM cloné si nécessaire avant la capture
        const viewerClone = documentClone.querySelector(".capturing");
        if (viewerClone) {
          // Améliorer la visibilité des annotations si nécessaire
          const annotationElements =
            viewerClone.querySelectorAll(".annotation-marker");
          annotationElements.forEach((el) => {
            // Utiliser une assertion de type pour résoudre l'erreur
            (el as HTMLElement).style.transform = "scale(1.2)";
          });
        }
      }
    });
    
    // Convertir le canvas en image
    const dataUrl = canvas.toDataURL("image/png", 0.92);
    
    // Nettoyer la classe temporaire
    viewerRef.current.classList.remove("capturing");
    
    console.log("Capture réussie");
    
    // Stocker l'image capturée (soit dans localStorage, soit l'uploader)
    return dataUrl;
  } catch (error) {
    console.error("Erreur lors de la capture du viewer:", error);
    return null;
  }
};

  return (
    <div className="flex h-full">
      {isFirstLoad ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">
              Bienvenue dans l'éditeur d'annotations
            </h2>
            <p className="text-muted-foreground mb-6">
              Ajoutez des plans ou images pour commencer à les annoter
            </p>
            <Button onClick={handleOpenFileSelector}>
              <FileText className="mr-2 h-4 w-4" />
              Ajouter un document
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,.pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    if (e.target && e.target.result) {
                      handleAddNewDocument(
                        e.target.result.toString(),
                        file.name
                      );
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Sidebar for Documents */}
          {!isMobile && (
            <div className="flex flex-col">
              <DocumentsSidebar
                documents={documents}
                activeDocument={activeDocument}
                onSelectDocument={handleSelectDocument}
                onAddDocument={handleOpenFileSelector}
                onDeleteDocument={handleDeleteDocument} // Ajoutez cette ligne ici aussi
              />
              <div className="p-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Réinitialiser tous les documents de ce projet?"
                      )
                    ) {
                      resetProjectData();
                    }
                  }}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col relative">
            {/* Toolbar buttons */}
            <div className="bg-muted py-1 px-3 flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenFileSelector}>
                  <FileText className="h-4 w-4 mr-1" />
                  Ajouter un document
                </Button>
              </div>

              {isMobile && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDocumentsOpen(true)}>
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAnnotationsOpen(true)}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            {/* Mobile Floating Action Buttons */}
            {isMobile && (
              <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-10">
                <Sheet open={documentsOpen} onOpenChange={setDocumentsOpen}>
                  <SheetTrigger asChild>
                    <Button size="icon" className="rounded-full shadow-lg">
                      <FileText className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[85vw] sm:w-[350px] p-0">
                    <DocumentsSidebar
                      documents={documents}
                      activeDocument={activeDocument}
                      onDeleteDocument={handleDeleteDocument}
                      onSelectDocument={(doc) => {
                        handleSelectDocument(doc);
                        setDocumentsOpen(false);
                      }}
                    />
                  </SheetContent>
                </Sheet>

                <Sheet open={annotationsOpen} onOpenChange={setAnnotationsOpen}>
                  <SheetTrigger asChild>
                    <Button size="icon" className="rounded-full shadow-lg">
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-[85vw] sm:w-[350px] p-0">
                    <AnnotationsSidebar
                      annotations={activeDocument?.annotations || []}
                      onToggleResolved={handleToggleResolved}
                      onAnnotationClick={(annotation) => {
                        handleHighlightAnnotation(annotation);
                        setAnnotationsOpen(false);
                      }}
                      onConvertToTask={handleConvertToTask}
                    />
                  </SheetContent>
                </Sheet>
              </div>
            )}

            <MainContent
              activeDocument={activeDocument}
              annotations={activeDocument?.annotations || []}
              selectedAnnotation={selectedAnnotation}
              onAddAnnotation={(position) =>
                handleAddAnnotationCallback(position, null)
              }
              onDocumentUpdate={handleDocumentUpdateCallback}
              onAnnotationClick={handleAnnotationClickCallback}
              onDeleteAnnotation={handleDeleteAnnotation}
              onRepositionAnnotation={handleRepositionAnnotation}
              // Ajoutez ces nouvelles props
              captureViewerFn={captureViewer}
              updateDocumentFn={updateDocument}
            />
          </div>

          {/* Desktop Sidebar for Annotations */}
          {!isMobile && (
            <ErrorBoundary>
              <AnnotationsSidebar
                annotations={activeDocument?.annotations || []}
                onToggleResolved={handleToggleResolved}
                onAnnotationClick={handleHighlightAnnotation}
                onConvertToTask={handleConvertToTask}
                onDeleteAnnotation={handleDeleteAnnotation}
              />
            </ErrorBoundary>
          )}

          <ErrorBoundary>
            <AnnotationDialog
              isOpen={isAnnotationDialogOpen}
              setIsOpen={setIsAnnotationDialogOpen}
              selectedAnnotation={selectedAnnotation}
              onToggleResolved={handleToggleResolved}
              onUpdateComment={handleUpdateComment}
              onAddPhoto={handleAddPhoto}
              onRemovePhoto={handleRemovePhoto}
              onUpdateAnnotation={handleUpdateAnnotationAdapter} // Utiliser l'adaptateur à la place
              onDeleteAnnotation={handleDeleteAnnotation}
              projectId={projectId}
            />
          </ErrorBoundary>

          <ConvertToTaskDialog
            isOpen={isConvertToTaskOpen}
            setIsOpen={setIsConvertToTaskOpen}
            annotation={selectedAnnotation}
            projectId={projectId || "1"}
            onTaskCreated={handleTaskCreated}
          />

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,.pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                  if (e.target && e.target.result) {
                    handleAddNewDocument(e.target.result.toString(), file.name);
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </>
      )}
    </div>
  );
};
