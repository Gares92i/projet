import { Annotation } from "@/types";

/**
 * Génère un SVG complet avec l'image en arrière-plan et les annotations
 * @param imageUrl URL de l'image à utiliser comme arrière-plan
 * @param annotations Liste des annotations à ajouter au SVG
 * @param documentId Identifiant du document (pour le suivi)
 * @returns Une promesse qui résout vers l'URL du SVG généré (data URL)
 */
export async function generateAnnotatedSVG(
  imageUrl: string,
  annotations: Annotation[],
  documentId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    // 1. Créer un élément Image pour obtenir les dimensions réelles
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        // 2. Créer un SVG avec les dimensions de l'image
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", img.width.toString());
        svg.setAttribute("height", img.height.toString());
        svg.setAttribute("viewBox", `0 0 ${img.width} ${img.height}`);
        
        // 3. Ajouter l'image comme élément image dans le SVG
        const imgElement = document.createElementNS(svgNS, "image");
        imgElement.setAttribute("href", imageUrl);
        imgElement.setAttribute("width", "100%");
        imgElement.setAttribute("height", "100%");
        imgElement.setAttribute("preserveAspectRatio", "none");
        svg.appendChild(imgElement);
        
        // 4. Ajouter chaque annotation au SVG
        annotations.forEach((annotation, index) => {
          // Extraire les coordonnées (en pourcentage)
          const x = annotation.position?.x ?? annotation.x ?? 0;
          const y = annotation.position?.y ?? annotation.y ?? 0;
          
          // Convertir de pourcentage à coordonnées absolues
          const absX = (x / 100) * img.width;
          const absY = (y / 100) * img.height;
          
          // Créer un groupe pour l'annotation
          const group = document.createElementNS(svgNS, "g");
          
          // Créer le cercle
          const circle = document.createElementNS(svgNS, "circle");
          circle.setAttribute("cx", absX.toString());
          circle.setAttribute("cy", absY.toString());
          circle.setAttribute("r", "15"); // Rayon plus grand pour visibilité
          circle.setAttribute("fill", annotation.resolved || annotation.isResolved ? "#22c55e" : "#f97316");
          circle.setAttribute("stroke", "white");
          circle.setAttribute("stroke-width", "2");
          
          // Créer le texte
          const text = document.createElementNS(svgNS, "text");
          text.setAttribute("x", absX.toString());
          text.setAttribute("y", absY.toString());
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("dominant-baseline", "central");
          text.setAttribute("fill", "white");
          text.setAttribute("font-size", "12");
          text.setAttribute("font-weight", "bold");
          text.textContent = (index + 1).toString();
          
          // Ajouter les éléments au groupe puis au SVG
          group.appendChild(circle);
          group.appendChild(text);
          svg.appendChild(group);
        });
        
        // 5. Convertir le SVG en chaîne et en Data URL
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        // 6. Optionnel - Convertir en PNG pour meilleure compatibilité
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          resolve(svgUrl); // Fallback sur SVG si canvas non supporté
          return;
        }
        
        const svgImg = new Image();
        svgImg.onload = () => {
          ctx.drawImage(svgImg, 0, 0);
          const pngUrl = canvas.toDataURL("image/png");
          URL.revokeObjectURL(svgUrl); // Libérer la mémoire
          resolve(pngUrl);
        };
        svgImg.onerror = (err) => {
          console.error("Erreur lors du chargement de l'image SVG:", err);
          resolve(svgUrl); // Fallback sur SVG en cas d'erreur
        };
        svgImg.src = svgUrl;
      } catch (err) {
        console.error("Erreur lors de la génération du SVG:", err);
        reject(err);
      }
    };
    
    img.onerror = (err) => {
      console.error("Erreur lors du chargement de l'image source:", err);
      reject(err);
    };
    
    img.src = imageUrl;
  });
}