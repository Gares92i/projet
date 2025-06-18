import React, { useState, useEffect, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";
import { toast } from "sonner";

interface ImageViewerProps {
  url: string;
  scale?: number;
  rotation?: number;
  onScaleChange?: (scale: number) => void;
  onRotationChange?: (rotation: number) => void;
  hideControls?: boolean;
  children?: React.ReactNode;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  url,
  scale: externalScale,
  rotation: externalRotation,
  onScaleChange,
  onRotationChange,
  hideControls = false,
  children,
}) => {
  const [scale, setScale] = useState(externalScale || 1);
  const [rotation, setRotation] = useState(externalRotation || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  // Synchronize internal state with external props
  useEffect(() => {
    if (externalScale !== undefined && externalScale !== scale) {
      setScale(externalScale);
    }
  }, [externalScale, scale]);

  useEffect(() => {
    if (externalRotation !== undefined && externalRotation !== rotation) {
      setRotation(externalRotation);
    }
  }, [externalRotation, rotation]);

  // Fonction pour gérer l'erreur de chargement d'image
  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);

    // Vérifier à nouveau si c'est une URL tronquée (au cas où la détection initiale aurait échoué)
    if (isTruncatedUrl(url)) {
      console.error("URL d'image tronquée détectée:", url.substring(0, 100));
      setProcessedUrl(createPlaceholderUrl('Image tronquée'));
      return;
    }

    if (retryCount < maxRetries) {
      console.log(`Tentative de rechargement de l'image (${retryCount + 1}/${maxRetries})`);
      setRetryCount((prevCount) => prevCount + 1);

      // Créer un placeholder pour les tentatives suivantes
      setProcessedUrl(createPlaceholderUrl(`Tentative ${retryCount + 1}/${maxRetries}...`));

      setTimeout(() => {
        // Nettoyer l'URL précédente si c'est un blob
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = null;
        }
        
        // Réessayer de charger l'image originale
        setProcessedUrl(url);
      }, 1000);
    } else {
      console.error("Impossible de charger l'image après plusieurs tentatives");
      setProcessedUrl(createPlaceholderUrl('Échec du chargement'));
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);

    // Capture les dimensions réelles de l'image pour les annotations
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
    }
  };

  // Fonction pour gérer le défilement
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPosition({
        x: containerRef.current.scrollLeft,
        y: containerRef.current.scrollTop,
      });
    }
  };

  // Ajouter un écouteur pour le défilement
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  // Fonction de vérification d'URL tronquée
  const isTruncatedUrl = (url: string): boolean => {
    return url.includes('[truncated]') || 
           (url.startsWith('data:') && url.length > 1000 && !url.endsWith('==') && !url.endsWith('='));
  };

  // Fonction pour créer une URL d'image placeholder
  const createPlaceholderUrl = (message: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Fond
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Bordure
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 2;
      ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
      
      // Texte
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#666666';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 10);
      
      ctx.font = '14px Arial';
      ctx.fillText('Veuillez recharger le document original', canvas.width / 2, canvas.height / 2 + 20);
    }
    
    return canvas.toDataURL('image/png');
  };

  // Effet pour traiter l'URL de l'image
  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setHasError(false);
    
    // Vérifier si l'URL est tronquée
    if (isTruncatedUrl(url)) {
      console.warn('URL d\'image tronquée détectée, affichage d\'un placeholder');
      setProcessedUrl(createPlaceholderUrl('Image tronquée'));
      setIsLoading(false);
      return;
    }
    
    // Si c'est une URL data: très longue, on la traite spécialement
    if (url.startsWith('data:') && url.length > 100000) {
      try {
        // Créer un blob URL plus court à partir de la data URL
        const response = fetch(url)
          .then(res => res.blob())
          .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            blobUrlRef.current = blobUrl;
            setProcessedUrl(blobUrl);
            setIsLoading(false);
          })
          .catch(err => {
            console.error('Erreur lors de la conversion de data URL en blob:', err);
            setProcessedUrl(createPlaceholderUrl('Erreur de conversion'));
            setIsLoading(false);
            setHasError(true);
          });
      } catch (error) {
        console.error('Erreur avec l\'URL data:', error);
        setProcessedUrl(createPlaceholderUrl('URL invalide'));
        setIsLoading(false);
        setHasError(true);
      }
    } else {
      // Pour les URLs normales ou data URLs courtes
      setProcessedUrl(url);
      setIsLoading(false);
    }
    
    // Nettoyage
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [url]);

  return (
    <div className="flex flex-col h-full">
      {/* Container principal avec référence pour le défilement */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-center justify-center bg-muted relative"
        data-testid="image-container"
        onScroll={handleScroll}
      >
        {isLoading && (
          <div className="flex items-center justify-center w-full h-full">
            <Skeleton className="h-[80%] w-[80%] max-w-2xl" />
          </div>
        )}

        {hasError ? (
          <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <AlertCircle className="h-12 w-12" />
            <p>Failed to load image</p>
          </div>
        ) : (
          // Viewport qui maintient l'image et les annotations ensemble
          <div
            ref={viewportRef}
            className="relative transition-transform duration-200 ease-in-out"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
              // Ces marges assurent que l'image reste centrée
              margin: "0",
            }}
          >
            {processedUrl && (
              <img
                ref={imageRef}
                src={processedUrl}
                alt="Document"
                className={`max-w-full h-auto transition-opacity ${
                  isLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                crossOrigin="anonymous"
                style={{ display: "block" }}
              />
            )}

            {/* Couche d'annotations qui est absolument positionnée par rapport à l'image */}
            {!isLoading && !hasError && imageRef.current && (
              <div
                className="absolute top-0 left-0 w-full h-full"
                style={
                  {
                    // Données d'annotation pour utilisation dans AnnotationMarker
                    "--img-natural-width": `${imageDimensions.width}px`,
                    "--img-natural-height": `${imageDimensions.height}px`,
                    "--img-display-width": `${imageRef.current.offsetWidth}px`,
                    "--img-display-height": `${imageRef.current.offsetHeight}px`,
                    "--container-scroll-x": `${scrollPosition.x}px`,
                    "--container-scroll-y": `${scrollPosition.y}px`,
                    "--zoom-level": scale,
                    "--rotation-angle": rotation,
                  } as React.CSSProperties
                }
              >
                {children}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};