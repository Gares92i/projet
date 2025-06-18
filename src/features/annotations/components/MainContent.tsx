import React, { useRef, useState, useEffect, useCallback } from "react";
import { Document, Annotation } from "@/app/styles";
import { updateDocument } from '../../services/annotationService';
import html2canvas from 'html2canvas';

import { ImageViewer } from "./ImageViewer";
import { AnnotationMarker } from "./AnnotationMarker";
import { AddFileButton } from "./AddFileButton";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { toast } from "sonner";
import {
  Edit,
  Trash2,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Camera,
} from "lucide-react";

interface MainContentProps {
  activeDocument: Document | null;
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  onAddAnnotation: (position: { x: number; y: number }) => void;
  onDocumentUpdate: (url: string, filename: string) => void;
  onAnnotationClick: (annotation: Annotation) => void;
  onDeleteAnnotation?: (annotation: Annotation) => void;
  onRepositionAnnotation?: (
    id: string,
    newPosition: { x: number; y: number }
  ) => void;
  captureViewerFn?: (
    viewerRef: React.RefObject<HTMLDivElement>,
    annotations: Annotation[],
    documentId: string
  ) => Promise<string | null>;
  updateDocumentFn?: (documentId: string, data: Partial<Document>) => Promise<boolean>;
}

export const MainContent: React.FC<MainContentProps> = ({
  activeDocument,
  annotations,
  selectedAnnotation,
  onAddAnnotation,
  onDocumentUpdate,
  onAnnotationClick,
  onDeleteAnnotation,
  onRepositionAnnotation,
  captureViewerFn,
  updateDocumentFn,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [isRepositioningAnnotation, setIsRepositioningAnnotation] = useState<
    string | null
  >(null);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [scrollPosition, setScrollPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  // Vérifier si c'est un document PDF ou une image
  const hasDocument = !!activeDocument?.url;

  // Ajouter une fonction pour gérer le zoom depuis le composant PdfViewer/ImageViewer
  const handleExternalZoomChange = useCallback((newZoom: number) => {
    setZoomLevel(newZoom);
  }, []);

  // Ajouter une fonction pour gérer la rotation depuis le composant PdfViewer/ImageViewer
  const handleExternalRotationChange = useCallback((newRotation: number) => {
    setRotation(newRotation);
  }, []);

  // Observer le conteneur pour suivre sa taille
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setViewportSize({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Observer la position de défilement
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollPosition({
        x: container.scrollLeft,
        y: container.scrollTop,
      });
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddAnnotationClick = () => {
    setIsAddingAnnotation(!isAddingAnnotation);
    setIsRepositioningAnnotation(null);
    setIsMoveMode(false);
  };

  const handleRepositionClick = (annotationId: string) => {
    // Assurez-vous de désactiver le mode déplacement
    setIsMoveMode(false);
    setIsRepositioningAnnotation(annotationId);
    setIsAddingAnnotation(false);

    // Ajoutez un message pour guider l'utilisateur
    toast.info("Cliquez sur le document pour repositionner l'annotation", {
      duration: 3000,
      id: "reposition-tooltip",
    });

    // Assurez-vous que le conteneur a le bon curseur
    if (containerRef.current) {
      containerRef.current.classList.add("cursor-crosshair");
    }
  };

  const handleMoveClick = () => {
    setIsMoveMode(!isMoveMode);
    setIsAddingAnnotation(false);
    setIsRepositioningAnnotation(null);
  };

  // Fonction de confirmation pour la suppression d'annotations
  const handleDeleteClick = (annotation: Annotation) => {
    if (onDeleteAnnotation) {
      if (
        window.confirm("Êtes-vous sûr de vouloir supprimer cette annotation ?")
      ) {
        console.log("Suppression de l'annotation confirmée:", annotation);
        onDeleteAnnotation(annotation);
        toast.success("Annotation supprimée");
      }
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
      containerRef.current.scrollTop = 0;
    }
  };

  // Mise à jour de la fonction handleDocumentClick pour normaliser les coordonnées
  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeDocument) return;
    if (isMoveMode) return;

    // Si le clic ne vient pas d'un bouton de l'interface
    if (!(e.target as HTMLElement).closest("button")) {
      const container = containerRef.current;
      const imageContainer = imageContainerRef.current;

      // Vérifier si le conteneur d'image existe
      if (!imageContainer) {
        console.warn("Conteneur d'image non trouvé");
        return;
      }

      // Obtenir les dimensions de l'image
      const imageRect = imageContainer.getBoundingClientRect();
      
      // Vérifier que le clic est dans la zone de l'image
      if (
        e.clientX < imageRect.left ||
        e.clientX > imageRect.right ||
        e.clientY < imageRect.top ||
        e.clientY > imageRect.bottom
      ) {
        return; // Clic en dehors
      }

      // Position du clic relative à l'image
      const imageX = e.clientX - imageRect.left;
      const imageY = e.clientY - imageRect.top;

      // Normaliser les coordonnées en pourcentage (0-100)
      const percentX = (imageX / imageRect.width) * 100;
      const percentY = (imageY / imageRect.height) * 100;

      // Limiter aux valeurs entre 0 et 100
      const boundedX = Math.max(0, Math.min(100, percentX));
      const boundedY = Math.max(0, Math.min(100, percentY));

      // Ajouter un log pour vérifier les positions normalisées
      console.log(`Position normalisée: x=${boundedX}, y=${boundedY}`);

      if (isAddingAnnotation) {
        // Utiliser uniquement les propriétés x et y sans position
        onAddAnnotation({
          x: boundedX,
          y: boundedY
        });
        setIsAddingAnnotation(false);
      } else if (isRepositioningAnnotation) {
        onRepositionAnnotation?.(isRepositioningAnnotation, {
          x: boundedX,
          y: boundedY,
        });
        setIsRepositioningAnnotation(null);
        
        if (containerRef.current) {
          containerRef.current.classList.remove("cursor-crosshair");
        }
      }
    }
  };

  // Gérer le déplacement avec la souris
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMoveMode || !containerRef.current) return;
    // Ne pas démarrer le déplacement si on clique sur un bouton ou une annotation
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest(".annotation-marker")
    ) {
      return;
    }

    e.preventDefault();
    setDragStart({ x: e.clientX, y: e.clientY });
    if (containerRef.current) {
      containerRef.current.style.cursor = "grabbing";
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMoveMode || !dragStart || !containerRef.current) return;
    e.preventDefault();

    const container = containerRef.current;
    const dx = dragStart.x - e.clientX;
    const dy = dragStart.y - e.clientY;

    setDragStart({ x: e.clientX, y: e.clientY });

    container.scrollLeft += dx;
    container.scrollTop += dy;
    setScrollPosition({ x: container.scrollLeft, y: container.scrollTop });
  };

  const handleMouseUp = () => {
    setDragStart(null);
    if (containerRef.current) {
      containerRef.current.style.cursor = isMoveMode ? "grab" : "default";
    }
  };

  // Gérer le zoom avec la molette de la souris
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel((prev) => {
        const newZoom = Math.max(0.5, Math.min(3, prev + delta));
        return newZoom;
      });
    }
  }, []);

  // Ajouter les écouteurs d'événements pour le zoom
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => {
        container.removeEventListener("wheel", handleWheel);
      };
    }
  }, [handleWheel]);

  // Trier les annotations par ordre de création
  const sortedAnnotations = [...annotations].sort((a, b) => {
    const dateA = a.createdAt || a.date || "";
    const dateB = b.createdAt || b.date || "";
    return dateA.localeCompare(dateB);
  });

  // Fonction de capture mise à jour
  const handleCaptureForReport = async () => {
    if (!activeDocument || !captureViewerFn || !updateDocumentFn) return;
    
    toast.info("Capture en cours...");
    
    const capturedImage = await captureViewerFn(
      imageContainerRef, 
      activeDocument.annotations || [], 
      activeDocument.id
    );
    
    if (capturedImage) {
      const success = await updateDocumentFn(activeDocument.id, {
        capturedImageUrl: capturedImage
      });
      
      if (success) {
        toast.success("Plan avec annotations capturé pour le rapport");
      } else {
        toast.error("Erreur lors de la sauvegarde de la capture");
      }
    } else {
      toast.error("La capture a échoué");
    }
  };

  // Implémenter la fonction captureViewer à l'intérieur du composant MainContent
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
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: "#fff",
        logging: false,
        onclone: (documentClone) => {
          // Modifier le DOM cloné si nécessaire avant la capture
          const viewerClone = documentClone.querySelector(".capturing");
          if (viewerClone) {
            // Améliorer la visibilité des annotations si nécessaire
            const annotationElements = viewerClone.querySelectorAll(".annotation-marker");
            annotationElements.forEach(el => {
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
      
      return dataUrl;
    } catch (error) {
      console.error("Erreur lors de la capture du viewer:", error);
      return null;
    }
  };

  if (!hasDocument) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <AddFileButton onDocumentUpdate={onDocumentUpdate} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-muted py-1 px-3 flex items-center justify-between">
        <div className="text-sm font-medium truncate flex-1 overflow-hidden">
          {activeDocument?.name || "Document sans titre"}
        </div>
        <div className="flex items-center space-x-2">
          {/* Contrôles de zoom et rotation */}
          <div className="flex items-center mr-3 space-x-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              title="Zoom arrière">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              title="Zoom avant">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={handleRotate}
              title="Rotation">
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={handleReset}
              title="Réinitialiser">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages d'information */}
          {isRepositioningAnnotation && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
              Cliquez sur le document pour repositionner l'annotation
            </span>
          )}

          {isMoveMode && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              Mode déplacement activé
            </span>
          )}

          {/* Boutons d'action */}
          <Button
            className={cn(
              "text-xs py-0.5 px-2 rounded-full transition-colors z-10",
              isMoveMode
                ? "bg-primary text-primary-foreground"
                : "bg-muted-foreground/20 text-foreground hover:bg-muted-foreground/30"
            )}
            onClick={handleMoveClick}
            size="sm"
            variant={isMoveMode ? "default" : "outline"}>
            <Move className="h-3 w-3 mr-1" />
            {isMoveMode ? "Arrêter" : "Déplacer"}
          </Button>

          <Button
            className={cn(
              "text-xs py-0.5 px-2 rounded transition-colors",
              isAddingAnnotation
                ? "bg-primary text-primary-foreground"
                : "bg-muted-foreground/20 text-foreground hover:bg-muted-foreground/30"
            )}
            onClick={handleAddAnnotationClick}
            size="sm"
            variant={isAddingAnnotation ? "default" : "outline"}>
            {isAddingAnnotation ? "Annuler" : "Ajouter une annotation"}
          </Button>

          <Button
            onClick={handleCaptureForReport}
            className="text-xs py-0.5 px-2 rounded transition-colors bg-muted-foreground/20 text-foreground hover:bg-muted-foreground/30"
            size="sm"
            variant="outline">
            <Camera className="mr-2 h-4 w-4" />
            Capturer
          </Button>
        </div>
      </div>

      {/* Conteneur principal avec référence pour le défilement */}
      <div
        ref={containerRef}
        className={cn(
          "flex-1 relative overflow-auto",
          isAddingAnnotation && "cursor-crosshair",
          isRepositioningAnnotation && "cursor-move",
          isMoveMode && "cursor-grab active:cursor-grabbing"
        )}
        onClick={handleDocumentClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ "--zoom-level": zoomLevel } as React.CSSProperties}>
        {/* Conteneur de l'image avec référence pour la position */}
        <div
          ref={imageContainerRef}
          className="relative flex items-center justify-center min-h-full min-w-full">

            <ImageViewer
              url={activeDocument.url}
              scale={zoomLevel}
              rotation={rotation}
              onScaleChange={handleExternalZoomChange}
              onRotationChange={handleExternalRotationChange}
            />


          {/* Annotations suivant les transformations de l'image */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
              // Simplifier les données pour le positionnement
              "--viewport-width": `${viewportSize.width}px`,
              "--viewport-height": `${viewportSize.height}px`,
            } as React.CSSProperties}>
            {sortedAnnotations.map((annotation, index) => {
              // Simplifier la logique d'extraction des coordonnées
              const x = annotation.position?.x ?? annotation.x ?? 0;
              const y = annotation.position?.y ?? annotation.y ?? 0;

              return (
                <div key={annotation.id} className="group">
                  <AnnotationMarker
                    x={x}
                    y={y}
                    selected={selectedAnnotation?.id === annotation.id}
                    resolved={annotation.resolved || annotation.isResolved}
                    annotationNumber={index + 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAnnotationClick(annotation);
                    }}
                    className="pointer-events-auto annotation-marker"
                    scaleWithZoom={false}
                  />

                  {/* Boutons d'action pour l'annotation sélectionnée */}
                  {selectedAnnotation?.id === annotation.id && (
                    <div
                      className="absolute pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        left: `calc(${x}% + 15px)`,
                        top: `${y}%`,
                        transform: "translateY(-50%)",
                        transformOrigin: "left center",
                      }}>
                      <div className="flex items-center bg-white/90 backdrop-blur-sm shadow-md rounded-md border p-1 gap-1">
                        <button
                          className="p-1 rounded-sm hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onRepositionAnnotation) {
                              handleRepositionClick(annotation.id);
                            }
                          }}
                          title="Déplacer l'annotation">
                          <Move className="h-4 w-4 text-blue-500" />
                        </button>

                        <button
                          className="p-1 rounded-sm hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onDeleteAnnotation) {
                              handleDeleteClick(annotation);
                            }
                          }}
                          title="Supprimer l'annotation">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
