import { Annotation } from '@/types';
import { captureDocumentWithAnnotations } from '@/utils/captureService';

/**
 * Normalise les coordonnées d'une annotation en fonction des dimensions originales et cibles
 * @param x Coordonnée X en pourcentage (0-100)
 * @param y Coordonnée Y en pourcentage (0-100)
 * @param sourceAspectRatio Ratio largeur/hauteur de l'image originale
 * @param targetAspectRatio Ratio largeur/hauteur de l'image cible
 * @returns Coordonnées normalisées {x, y} en pourcentage (0-100)
 */
export const normalizeCoordinates = (
  x: number, 
  y: number, 
  sourceAspectRatio: number = 1, // Ratio de l'ImageViewer (ex: 284/284 = 1)
  targetAspectRatio: number = 1.33 // Ratio du conteneur dans SiteVisitReportDetail (ex: 548/411 = 1.33)
): {x: number, y: number} => {
  // Si les ratios sont identiques, pas besoin d'ajustement
  if (sourceAspectRatio === targetAspectRatio) {
    return { x, y };
  }
  
  // Calculer l'ajustement nécessaire
  const aspectRatioDiff = targetAspectRatio / sourceAspectRatio;
  
  // Ajuster les coordonnées en fonction de la différence de ratio
  // Si l'image est plus large dans la cible, on ajuste x
  // Si l'image est plus haute dans la cible, on ajuste y
  if (aspectRatioDiff > 1) {
    // Image cible plus large
    return {
      x: x / aspectRatioDiff + (50 * (1 - 1/aspectRatioDiff)),
      y: y
    };
  } else {
    // Image cible plus haute
    return {
      x: x,
      y: y / aspectRatioDiff + (50 * (1 - 1/aspectRatioDiff))
    };
  }
};

/**
 * Génère une image avec les annotations superposées
 */
export const generateAnnotatedImage = async (
  documentUrl: string,
  annotations: Annotation[],
  documentId: string,
  projectId: string
): Promise<string> => {
  try {
    console.log(`[DEBUG] Début de génération pour ${documentId}`, {
      documentUrl,
      annotationsCount: annotations.length
    });

    // Filtrer les annotations sans position valide
    const validAnnotations = annotations.filter(ann => {
      // Vérifier position.x et position.y
      const hasPosition = ann.position && 
                         typeof ann.position.x === 'number' && 
                         typeof ann.position.y === 'number';
      
      // Vérifier x et y directement
      const hasDirectCoords = typeof ann.x === 'number' && 
                              typeof ann.y === 'number';
      
      // Une annotation est valide si elle a soit position, soit x/y
      return hasPosition || hasDirectCoords;
    });

    // Normaliser les annotations pour qu'elles aient toutes position
    const normalizedAnnotations = validAnnotations.map(ann => {
      // Si l'annotation a déjà position, la conserver
      if (ann.position && typeof ann.position.x === 'number' && typeof ann.position.y === 'number') {
        return ann;
      }
      
      // Sinon, créer position à partir de x/y
      return {
        ...ann,
        position: {
          x: ann.x || 0,
          y: ann.y || 0
        }
      };
    });

    console.log(`[DEBUG] Annotations valides: ${normalizedAnnotations.length}/${annotations.length}`);

    // Si aucune annotation valide, retourner l'URL d'origine
    if (normalizedAnnotations.length === 0) {
      console.log('[DEBUG] Aucune annotation valide, retour de l\'URL d\'origine');
      return documentUrl;
    }

    // Utiliser le service de capture avec les annotations normalisées
    const capturedImage = await captureDocumentWithAnnotations(documentUrl, normalizedAnnotations, documentId);
    
    console.log(`[DEBUG] Capture réussie pour le document ${documentId}`);
    return capturedImage;
  } catch (err) {
    console.error("[DEBUG] Erreur lors de la génération de l'image annotée:", err);
    // En cas d'erreur, retourner l'URL d'origine
    return documentUrl;
  }
};