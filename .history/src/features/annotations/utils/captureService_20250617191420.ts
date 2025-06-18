import React from 'react';
import { Annotation } from '@/types';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';

const CaptureComponent = ({
  documentUrl,
  annotations,
  onImageLoad
}: {
  documentUrl: string;
  annotations: Annotation[];
  onImageLoad: (success: boolean, dimensions?: {width: number, height: number}) => void; 
}) => {
  const [loaded, setLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  const handleLoad = () => {
    setLoaded(true);
    
    if (imgRef.current) {
      const naturalWidth = imgRef.current.naturalWidth;
      const naturalHeight = imgRef.current.naturalHeight;

      onImageLoad(true, {
        width: naturalWidth,
        height: naturalHeight
      });
    } else {
      onImageLoad(true);
    }
  };

  // Améliorer la fonction normalizePosition

  const normalizePosition = (annotation: Annotation): {x: number, y: number} => {
    // Définir une priorité claire: d'abord position, puis x/y directs

    // 1. Utiliser position si disponible et valide
    if (annotation.position && 
        typeof annotation.position.x === 'number' &&
        typeof annotation.position.y === 'number') {
      return {
        x: annotation.position.x,
        y: annotation.position.y
      };
    }
    
    // 2. Utiliser x/y directs si disponibles
    if (typeof annotation.x === 'number' && typeof annotation.y === 'number') {
      return {
        x: annotation.x,
        y: annotation.y
      };
    }

    // 3. Valeur par défaut si aucune coordonnée valide
    console.warn('Annotation sans coordonnées valides:', annotation.id);
    return { x: 0, y: 0 };
  };

  return React.createElement('div', {
    style: {
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: 'white'
    }
  }, [
    React.createElement('img', {
      ref: imgRef,
      key: 'image',
      src: documentUrl, 
      alt: "Document", 
      style: { 
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        display: 'block'
      },
      onLoad: handleLoad,
      onError: () => onImageLoad(false),
      crossOrigin: "anonymous"
    }),
    loaded && React.createElement('svg', {
      key: 'svg',
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      },
      // CRUCIAL: Utiliser exactement le même viewBox et preserveAspectRatio que dans ImageViewer
      viewBox: "0 0 100 100",
      preserveAspectRatio: "xMidYMid meet"
    }, 
      // Ne pas modifier l'ordre des annotations pour conserver la numérotation
      annotations.map((annotation, index) => {
        // Utiliser position ou x,y de manière cohérente
        const x = annotation.position?.x ?? annotation.x;
        const y = annotation.position?.y ?? annotation.y;
        
        // Ajouter un log pour vérifier
        console.log(`Annotation ${index+1} dans captureService: x=${x}, y=${y}`);
        
        return React.createElement('g', { key: annotation.id }, [
          React.createElement('circle', {
            key: `circle-${annotation.id}`,
            cx: x,
            cy: y,
            r: 3.5,
            fill: annotation.resolved || annotation.isResolved ? "#22c55e" : "#f97316",
            stroke: "white",
            strokeWidth: 1
          }),
          React.createElement('text', {
            key: `text-${annotation.id}`,
            x: x,
            y: y,
            textAnchor: "middle",
            dominantBaseline: "central",
            fill: "white",
            fontSize: 3,
            fontWeight: "bold"
          }, index + 1)
        ]);
      })
    )
  ].filter(Boolean));
};

// Ajouter cette fonction de validation en haut du fichier
const isValidDataUrl = (url: string): boolean => {
  // Vérifier si c'est une data URL valide
  if (!url.startsWith('data:')) return true; // Pas une data URL, on laisse passer
  
  // Vérifier la structure de base
  const parts = url.split(',');
  if (parts.length !== 2) return false;
  
  // Vérifier si base64 est présent et si les données sont suffisamment longues
  const base64Part = parts[1];
  if (base64Part.length < 10) return false; // Trop court pour être une image valide
  
  return true;
};

// Modifier la fonction captureDocumentWithAnnotations
export const captureDocumentWithAnnotations = async (
  documentUrl: string,
  annotations: Annotation[],
  documentId: string
): Promise<string> => {
  return new Promise((resolve) => {
    try {
      // Vérifier d'abord si l'URL est valide
      if (!isValidDataUrl(documentUrl)) {
        console.warn(`URL de document potentiellement invalide: ${documentUrl.substring(0, 50)}...`);
        // Continuer quand même, mais enregistrer l'avertissement
      }
      
      // Créer un container avec des dimensions fixes pour le rendu
      const captureContainer = document.createElement('div');
      
      // IMPORTANT: Utiliser un ratio fixe qui correspond à l'aspect ratio de l'image originale
      const width = 800;
      const height = 600;
      
      captureContainer.style.width = `${width}px`;
      captureContainer.style.height = `${height}px`;
      captureContainer.style.backgroundColor = '#FFFFFF';
      captureContainer.style.position = 'absolute';
      captureContainer.style.left = '-9999px';
      captureContainer.style.top = '-9999px';
      captureContainer.style.overflow = 'hidden';
      
      document.body.appendChild(captureContainer);
      
      // Créer une racine React
      const root = createRoot(captureContainer);
      
      // Fonction à appeler quand l'image est chargée
      const handleImageLoad = async (success: boolean, dimensions?: {width: number, height: number}) => {
        if (!success) {
          console.error(`Erreur lors du chargement de l'image: ${documentUrl.substring(0, 50)}...`);
          
          // Essayer de récupérer quand même - attendre un peu et tenter la capture
          await new Promise(resolve => setTimeout(resolve, 500));
          
          try {
            // Tenter de capturer même si l'image n'est pas chargée correctement
            const canvas = await html2canvas(captureContainer, {
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#FFFFFF',
              scale: 2,
              logging: false,
              // Réduire la taille pour garantir la capture
              width: Math.min(width, 400),
              height: Math.min(height, 300),
              imageTimeout: 5000, // Réduire le timeout
              removeContainer: true
            });
            
            const dataUrl = canvas.toDataURL('image/png', 0.95);
            
            // Vérifier si l'image générée est valide et différente de l'originale
            if (isValidDataUrl(dataUrl) && dataUrl !== documentUrl && dataUrl.length > 100) {
              resolve(dataUrl);
            } else {
              // Si la capture a échoué, retourner un placeholder ou l'URL originale
              resolve(documentUrl);
            }
          } catch (error) {
            console.error(`Tentative de récupération échouée: ${error}`);
            resolve(documentUrl);
          } finally {
            cleanupResources();
          }
          return;
        }
        
        // Attendre que tout soit rendu correctement
        await new Promise(resolve => setTimeout(resolve, 800));
        
        try {
          // Capturer le contenu avec html2canvas avec les bonnes options pour la qualité
          const canvas = await html2canvas(captureContainer, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#FFFFFF',
            scale: 2, // Améliorer la résolution
            logging: false,
            // Ne pas modifier la taille originale pour préserver les proportions
            width: width,
            height: height,
            // Désactiver les optimisations qui pourraient déformer le rendu
            imageTimeout: 15000,
            removeContainer: true
          });
          
          const dataUrl = canvas.toDataURL('image/png', 0.95);
          resolve(dataUrl);
        } catch (error) {
          console.error(`Erreur lors de la capture: ${error}`);
          resolve(documentUrl);
        } finally {
          cleanupResources();
        }
      };
      
      // Fonction de nettoyage
      const cleanupResources = () => {
        setTimeout(() => {
          try {
            root.unmount();
            if (document.body.contains(captureContainer)) {
              document.body.removeChild(captureContainer);
            }
          } catch (e) {
            console.error("Error cleaning up resources:", e);
          }
        }, 100);
      };
      
      // IMPORTANT: NE PAS trier les annotations pour préserver l'ordre d'origine
      
      // Rendu du composant de capture
      root.render(
        React.createElement(CaptureComponent, {
          documentUrl,
          annotations, // Utiliser les annotations originales sans tri
          onImageLoad: handleImageLoad
        })
      );
    } catch (error) {
      console.error(`Erreur critique: ${error}`);
      resolve(documentUrl);
    }
  });
};