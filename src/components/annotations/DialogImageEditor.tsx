import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Square,
  Circle,
  ArrowUpRight,
  Pencil,
  MousePointer,
  Eraser,
  Save,
  Undo,
  Type,
  Ruler,
  Cloud,
  Copy,
  ChevronDown,
  Grid,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Étendre le type pour inclure les nouveaux outils
export type DrawingShape =
  | "select"
  | "hand"  // Nouvel outil
  | "circle"
  | "rectangle"
  | "arrow"
  | "freehand"
  | "text"
  | "measurement"
  | "cloud"
  | "eraser";

// Ajouter un type pour les poignées de redimensionnement
export type ResizeHandle =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "none";

// Interface pour les données de mesure
export interface MeasurementData {
  value: string;
  unit: string;
}
// Étendre l'interface pour supporter l'édition
export interface DrawingElement {
  id: string;
  type: DrawingShape;
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
  text?: string; // Pour les éléments de texte
  selected?: boolean; // Pour la sélection
  measurement?: MeasurementData; // Pour les cotations personnalisées
  arrowDirection?: "right" | "left" | "both"; // Nouvelle propriété
}

interface DialogImageEditorProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  // Modifier la signature pour accepter le tableau de dessins en second paramètre
  onSave: (editedImageUrl: string, drawings?: DrawingElement[]) => void;
  existingDrawings?: DrawingElement[];
}

export const DialogImageEditor: React.FC<DialogImageEditorProps> = ({
  open,
  onClose,
  imageUrl,
  onSave,
  existingDrawings = [],
}) => {
  const [currentTool, setCurrentTool] = useState<DrawingShape>("select");
  const [drawings, setDrawings] = useState<DrawingElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingElement | null>(
    null
  );
  const [imageLoaded, setImageLoaded] = useState(false);
  const [drawingHistory, setDrawingHistory] = useState<DrawingElement[][]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );

  // État pour gérer le redimensionnement
  const [isResizing, setIsResizing] = useState(false);
  const [currentResizeHandle, setCurrentResizeHandle] =
    useState<ResizeHandle>("none");
  const [originalPoints, setOriginalPoints] = useState<
    { x: number; y: number }[]
  >([]);

  // État pour le modal d'édition de mesure
  const [measurementToEdit, setMeasurementToEdit] = useState<{
    id: string;
    value: string;
    unit: string;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Couleurs disponibles
  const colors = [
    "#FF5733",
    "#33A8FF",
    "#33FF57",
    "#F033FF",
    "#FFFF33",
    "#000000",
  ];
  const [currentColor, setCurrentColor] = useState(colors[0]);
  const [strokeWidth, setStrokeWidth] = useState(2);

  // Ajouter cette option dans vos états
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showGrid, setShowGrid] = useState(false); // État pour contrôler l'affichage de la grille
  const gridSize = 10; // Taille de la grille en pixels

  // Charger l'image et les dessins existants
  useEffect(() => {
    if (!open) return;

    const image = new Image();
    image.crossOrigin = "anonymous";

    try {
      // Normaliser l'URL
      const normalizedUrl = normalizeImageUrl(imageUrl);
      console.log("URL normalisée:", normalizedUrl);

      image.src = normalizedUrl;

      image.onload = () => {
        console.log("Image chargée avec succès");
        setImageLoaded(true);

        if (imageRef.current) {
          imageRef.current.src = normalizedUrl;
        }

        // Charger les dessins existants s'ils existent
        if (existingDrawings && existingDrawings.length > 0) {
          console.log("Chargement de", existingDrawings.length, "dessins existants");

          // S'assurer que tous les dessins sont correctement structurés
          const normalizedDrawings = existingDrawings.map((d) => {
            // Vérifier si les points sont valides
            const points = Array.isArray(d.points) ? [...d.points] : [];

            // S'assurer que chaque dessin a un ID unique
            const id =
              d.id ||
              `drawing-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

            return {
              ...d,
              id,
              selected: false,
              points,
              // S'assurer que les propriétés essentielles sont définies
              color: d.color || currentColor,
              strokeWidth: d.strokeWidth || 2,
              // Garder les propriétés supplémentaires
              text: d.text,
              measurement: d.measurement,
            };
          });

          setDrawings(normalizedDrawings);
        } else {
          setDrawings([]);
        }
        setDrawingHistory([]);
      };

      image.onerror = (e) => {
        console.error("Erreur lors du chargement de l'image:", e);

        // Utiliser une image de secours en cas d'erreur
        image.src =
          "https://via.placeholder.com/800x600?text=Image+Non+Disponible";
        setImageLoaded(true);
      };
    } catch (error) {
      console.error("Erreur lors de la préparation de l'image:", error);
    }
  }, [imageUrl, open, existingDrawings, currentColor]);

  // Redessiner le canvas quand les dessins changent
  
useEffect(() => {
  if (!canvasRef.current || !imageRef.current || !imageLoaded) return;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Réinitialiser la transformation
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  
  // Récupérer l'image affichée et ajuster le canvas
  const imgDisplay = containerRef.current?.querySelector('img[alt="Édition"]');
  if (imgDisplay) {
    // Définir la taille du canvas pour qu'elle corresponde à l'image affichée
    canvas.width = imgDisplay.clientWidth;
    canvas.height = imgDisplay.clientHeight;
    
    // Calculer l'échelle correcte
    const scaleX = imgDisplay.clientWidth / imageRef.current.naturalWidth;
    const scaleY = imgDisplay.clientHeight / imageRef.current.naturalHeight;
    
    // Stocker l'échelle dans le dataset
    canvas.dataset.scaleX = scaleX.toString();
    canvas.dataset.scaleY = scaleY.toString();

    // Appliquer l'échelle
    ctx.scale(scaleX, scaleY);
    } else {
      // Fallback au cas où
      canvas.width = imageRef.current.naturalWidth;
      canvas.height = imageRef.current.naturalHeight;
    }

    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner la grille si activée
    if (showGrid) {
      const gridSize = 20;
      const w = canvas.width;
      const h = canvas.height;

      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      ctx.lineWidth = 1;

      // Lignes verticales
      for (let x = 0; x <= w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Lignes horizontales
      for (let y = 0; y <= h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    // Dessiner tous les éléments
    drawings.forEach((drawing) => {
      drawElement(ctx, drawing);

      // Si l'élément est sélectionné, dessiner les poignées de redimensionnement
      // Permettre le redimensionnement pour tous les types sauf texte et freehand
      if (
        drawing.selected &&
        drawing.type !== "freehand" &&
        drawing.type !== "text"
      ) {
        drawResizeHandles(ctx, drawing);
      }
    });

    // Dessiner l'élément en cours
    if (currentDrawing) {
      drawElement(ctx, currentDrawing);
    }
  }, [drawings, currentDrawing, imageLoaded, selectedElement, showGrid]);

  // Focus sur l'input de texte quand il devient visible
  useEffect(() => {
    if (showTextInput && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [showTextInput]);

  // Fonction pour dessiner un élément
  const drawElement = (
    ctx: CanvasRenderingContext2D,
    element: DrawingElement
  ) => {
    const { type, points, color, strokeWidth, text, selected } = element;

    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.fillStyle = "transparent";

    // Style pour l'élément sélectionné
    if (selected || element.id === selectedElement) {
      ctx.setLineDash([5, 3]);
    } else {
      ctx.setLineDash([]);
    }

    if (points.length === 0) return;

    switch (type) {
      case "rectangle":
        if (points.length >= 2) {
          const [start, end] = [points[0], points[points.length - 1]];
          ctx.beginPath();
          ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
          ctx.stroke();
        }
        break;

      case "circle":
        if (points.length >= 2) {
          const [center, end] = [points[0], points[points.length - 1]];
          const radius = Math.sqrt(
            Math.pow(end.x - center.x, 2) + Math.pow(end.y - center.y, 2)
          );
          ctx.beginPath();
          ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
        break;

      case "arrow":
        if (points.length >= 2) {
          const [start, end] = [points[0], points[points.length - 1]];
          // Ligne principale
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();

          // Pointe de flèche
          const headLength = 15;
          const angle = Math.atan2(end.y - start.y, end.x - start.x);
          const direction = element.arrowDirection || "right";

          if (direction === "right" || direction === "both") {
            // Flèche à droite
            ctx.beginPath();
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(
              end.x - headLength * Math.cos(angle - Math.PI / 6),
              end.y - headLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(
              end.x - headLength * Math.cos(angle + Math.PI / 6),
              end.y - headLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.stroke();
          }

          if (direction === "left" || direction === "both") {
            // Flèche à gauche - correction complète pour pointer vers la gauche
            const oppositeAngle = angle + Math.PI; // Angle opposé (180 degrés)
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(
              start.x - headLength * Math.cos(oppositeAngle - Math.PI / 6),
              start.y - headLength * Math.sin(oppositeAngle - Math.PI / 6)
            );
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(
              start.x - headLength * Math.cos(oppositeAngle + Math.PI / 6),
              start.y - headLength * Math.sin(oppositeAngle + Math.PI / 6)
            );
            ctx.stroke();
          }
        }
        break;

      case "freehand":
        if (points.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.stroke();
        }
        break;

      case "text":
        if (points.length >= 1 && text) {
          const [position] = points;


          // Dessiner le texte
          ctx.font = `${strokeWidth * 5}px Arial`;
          ctx.fillStyle = color;
          ctx.textBaseline = "top";
          ctx.fillText(text, position.x, position.y);

          // Restaurer le style de remplissage
          ctx.fillStyle = "transparent";
        }
        break;

      case "measurement":
        if (points.length >= 2) {
          const [start, end] = [points[0], points[points.length - 1]];
          // Ligne principale
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();

          // Lignes perpendiculaires aux extrémités
          const perpLength = 10;

          // Si c'est une ligne horizontale ou quasi-horizontale
          const isHorizontal =
            Math.abs(end.y - start.y) < Math.abs(end.x - start.x);

          if (isHorizontal) {
            // Barres verticales aux extrémités
            ctx.beginPath();
            ctx.moveTo(start.x, start.y - perpLength);
            ctx.lineTo(start.x, start.y + perpLength);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(end.x, end.y - perpLength);
            ctx.lineTo(end.x, end.y + perpLength);
            ctx.stroke();
          } else {
            // Barres horizontales aux extrémités
            ctx.beginPath();
            ctx.moveTo(start.x - perpLength, start.y);
            ctx.lineTo(start.x + perpLength, start.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(end.x - perpLength, end.y);
            ctx.lineTo(end.x + perpLength, end.y);
            ctx.stroke();
          }

          // Texte de mesure - utiliser la valeur personnalisée si disponible
          const distance = Math.sqrt(
            Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
          );
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;

          // Modifier la taille de police en fonction de l'épaisseur du trait
          const fontSize = Math.max(12, strokeWidth * 4); // Minimum 12px, sinon 4x l'épaisseur
          ctx.font = `${fontSize}px Arial`;
          ctx.fillStyle = color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Afficher la valeur personnalisée si elle existe, sinon la mesure en pixels
          const displayText = element.measurement
            ? `${element.measurement.value}${element.measurement.unit}`
            : `${Math.round(distance)}px`;

          ctx.fillText(displayText, midX, midY - fontSize/2); // Ajuster la position verticale
          ctx.fillStyle = "transparent";
        }
        break;

      case "cloud": {
        if (points.length >= 2) {
          const [start, end] = [points[0], points[points.length - 1]];
          const width = Math.abs(end.x - start.x);
          const height = Math.abs(end.y - start.y);
          const minX = Math.min(start.x, end.x);
          const minY = Math.min(start.y, end.y);

          ctx.beginPath();

          // Paramètres du nuage rectangulaire
          const bumpHeight = Math.min(15, height / 8);
          const bumpWidth = Math.min(15, width / 8);
          const numBumpsHorizontal = Math.max(6, Math.floor(width / 30));
          const numBumpsVertical = Math.max(4, Math.floor(height / 30));
          const horizontalStepSize = width / numBumpsHorizontal;
          const verticalStepSize = height / numBumpsVertical;

          // Point de départ en haut à gauche
          ctx.moveTo(minX + bumpWidth, minY);

          // Dessiner le bord supérieur
          for (let i = 0; i < numBumpsHorizontal; i++) {
            const x = minX + i * horizontalStepSize;
            ctx.quadraticCurveTo(
              x + horizontalStepSize / 2,
              minY - bumpHeight,
              x + horizontalStepSize,
              minY
            );
          }

          // Dessiner le bord droit
          for (let i = 0; i < numBumpsVertical; i++) {
            const y = minY + i * verticalStepSize;
            ctx.quadraticCurveTo(
              minX + width + bumpWidth,
              y + verticalStepSize / 2,
              minX + width,
              y + verticalStepSize
            );
          }

          // Dessiner le bord inférieur (de droite à gauche)
          for (let i = 0; i < numBumpsHorizontal; i++) {
            const x = minX + width - i * horizontalStepSize;
            ctx.quadraticCurveTo(
              x - horizontalStepSize / 2,
              minY + height + bumpHeight,
              x - horizontalStepSize,
              minY + height
            );
          }

          // Dessiner le bord gauche (de bas en haut)
          for (let i = 0; i < numBumpsVertical; i++) {
            const y = minY + height - i * verticalStepSize;
            ctx.quadraticCurveTo(
              minX - bumpWidth,
              y - verticalStepSize / 2,
              minX,
              y - verticalStepSize
            );
          }

          ctx.closePath();
          ctx.stroke();
        }
        break;
      }
    }
  };

  // Fonction pour dessiner les poignées de redimensionnement
  const drawResizeHandles = (
    ctx: CanvasRenderingContext2D,
    element: DrawingElement
  ) => {
    // Ne pas dessiner de poignées pour le texte ou le dessin à main levée
    if (element.type === "freehand") return;

    const { points } = element;
    
    // Désactiver les pointillés pour les poignées
    ctx.setLineDash([]);
    
    if (points.length < 2) return;
    
    // Augmenter la taille des poignées
    const handleSize = 12; // Augmenté de 8 à 12
    
    // Style des poignées plus visible
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#0066ff";
    ctx.lineWidth = 2;
    
    // Obtenir la boîte englobante de l'élément
    const [start, end] = getBoundingBox(element);

    // Dessiner les poignées selon le type d'élément
    switch (element.type) {
      case "rectangle":
      case "cloud":
        // Dessiner des poignées aux 8 points (4 coins et 4 côtés)
        // Coins
        drawHandle(ctx, { x: start.x, y: start.y }, handleSize);
        drawHandle(ctx, { x: end.x, y: start.y }, handleSize);
        drawHandle(ctx, { x: start.x, y: end.y }, handleSize);
        drawHandle(ctx, { x: end.x, y: end.y }, handleSize);

        // Côtés
        drawHandle(ctx, { x: (start.x + end.x) / 2, y: start.y }, handleSize);
        drawHandle(ctx, { x: end.x, y: (start.y + end.y) / 2 }, handleSize);
        drawHandle(ctx, { x: (start.x + end.x) / 2, y: end.y }, handleSize);
        drawHandle(ctx, { x: start.x, y: (start.y + end.y) / 2 }, handleSize);
        break;

      // Modification dans la fonction drawResizeHandles
      case "circle": {
        // Dessiner des poignées aux 4 points cardinaux
        const [center, radiusPoint] = points;
        const radius = Math.sqrt(
          Math.pow(radiusPoint.x - center.x, 2) +
            Math.pow(radiusPoint.y - center.y, 2)
        );

        drawHandle(ctx, { x: center.x, y: center.y - radius }, handleSize);
        drawHandle(ctx, { x: center.x + radius, y: center.y }, handleSize);
        drawHandle(ctx, { x: center.x, y: center.y + radius }, handleSize);
        drawHandle(ctx, { x: center.x - radius, y: center.y }, handleSize);
        break;
      }

      case "arrow":
      case "measurement":
        // Dessiner des poignées aux extrémités
        drawHandle(ctx, points[0], handleSize);
        drawHandle(ctx, points[points.length - 1], handleSize);
        break;

      case "text": {
        if (points.length >= 1) {
          const [position] = points;
          // Estimation de la taille du texte
          const width = element.text
            ? element.text.length * (element.strokeWidth * 3)
            : 0;
          const height = element.strokeWidth * 5;

          // Ajouter des poignées aux coins
          drawHandle(ctx, { x: position.x, y: position.y }, handleSize);
          drawHandle(ctx, { x: position.x + width, y: position.y }, handleSize);
          drawHandle(ctx, { x: position.x, y: position.y + height }, handleSize);
          drawHandle(ctx, { x: position.x + width, y: position.y + height }, handleSize);
        }
        break;
      }
    }
  };

  // Fonction utilitaire pour dessiner une poignée
  const drawHandle = (
    ctx: CanvasRenderingContext2D,
    position: { x: number; y: number },
    size: number
  ) => {
    ctx.beginPath();
    ctx.rect(position.x - size / 2, position.y - size / 2, size, size);
    ctx.fill();
    ctx.stroke();
  };

  // Fonction pour obtenir la boîte englobante d'un élément
  const getBoundingBox = (
    element: DrawingElement
  ): [{ x: number; y: number }, { x: number; y: number }] => {
    const { type, points } = element;

    switch (type) {
      case "rectangle":
      case "cloud": {
        if (points.length >= 2) {
          const [start, end] = [points[0], points[points.length - 1]];
          return [
            { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y) },
            { x: Math.max(start.x, end.x), y: Math.max(start.y, end.y) },
          ];
        }
        break;
      }

      case "circle": {
        if (points.length >= 2) {
          const [center, radiusPoint] = [points[0], points[points.length - 1]];
          const radius = Math.sqrt(
            Math.pow(radiusPoint.x - center.x, 2) +
              Math.pow(radiusPoint.y - center.y, 2)
          );
          return [
            { x: center.x - radius, y: center.y - radius },
            { x: center.x + radius, y: center.y + radius },
          ];
        }
        break;
      }

      case "arrow":
      case "measurement": {
        if (points.length >= 2) {
          const [start, end] = [points[0], points[points.length - 1]];
          return [
            { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y) },
            { x: Math.max(start.x, end.x), y: Math.max(start.y, end.y) },
          ];
        }
        break;
      }

      case "freehand": {
        // Pour le dessin à main levée, calculer le min/max de tous les points
        if (points.length >= 1) {
          const [position] = points;
          // Estimation de la taille du texte
          const width = element.text
            ? element.text.length * (element.strokeWidth * 3)
            : 0;
          const height = element.strokeWidth * 5;

          return [
            { x: position.x, y: position.y },
            { x: position.x + width, y: position.y + height },
          ];
        }
        break;
      }
    }

    // Par défaut, retourner une boîte englobante vide
    return [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];
  };

  // Déterminer si un point est sur une poignée de redimensionnement
  const getResizeHandleAtPosition = (
    element: DrawingElement,
    position: { x: number; y: number }
  ): ResizeHandle => {
    if (!element || element.type === "freehand" || element.type === "text")
      return "none";

    // Augmenter le rayon de détection
    const handleSize = 16; // Encore plus grand pour la détection
    const handleRadius = handleSize / 2;

    switch (element.type) {
      case "rectangle":
      case "cloud": {
        const [start, end] = getBoundingBox(element);

        // Vérifier les coins
        if (isPointNear(position, { x: start.x, y: start.y }, handleRadius))
          return "top-left";
        if (isPointNear(position, { x: end.x, y: start.y }, handleRadius))
          return "top-right";
        if (isPointNear(position, { x: start.x, y: end.y }, handleRadius))
          return "bottom-left";
        if (isPointNear(position, { x: end.x, y: end.y }, handleRadius))
          return "bottom-right";

        // Vérifier les côtés
        if (
          isPointNear(
            position,
            { x: (start.x + end.x) / 2, y: start.y },
            handleRadius
          )
        )
          return "top";
        if (
          isPointNear(
            position,
            { x: end.x, y: (start.y + end.y) / 2 },
            handleRadius
          )
        )
          return "right";
        if (
          isPointNear(
            position,
            { x: (start.x + end.x) / 2, y: end.y },
            handleRadius
          )
        )
          return "bottom";
        if (
          isPointNear(
            position,
            { x: start.x, y: (start.y + end.y) / 2 },
            handleRadius
          )
        )
          return "left";

        return "none";
      }

      case "circle": {
        const [center, radiusPoint] = element.points;
        const radius = Math.sqrt(
          Math.pow(radiusPoint.x - center.x, 2) +
            Math.pow(radiusPoint.y - center.y, 2)
        );

        // Vérifier les poignées aux points cardinaux
        if (
          isPointNear(
            position,
            { x: center.x, y: center.y - radius },
            handleRadius
          )
        )
          return "top";
        if (
          isPointNear(
            position,
            { x: center.x + radius, y: center.y },
            handleRadius
          )
        )
          return "right";
        if (
          isPointNear(
            position,
            { x: center.x, y: center.y + radius },
            handleRadius
          )
        )
          return "bottom";
        if (
          isPointNear(
            position,
            { x: center.x - radius, y: center.y },
            handleRadius
          )
        )
          return "left";

        return "none";
      }

      case "arrow":
      case "measurement": {
        const [start, end] = element.points;

        // Vérifier les poignées aux extrémités
        if (isPointNear(position, start, handleRadius)) return "top-left";
        if (isPointNear(position, end, handleRadius)) return "bottom-right";

        return "none";
      }

      default:
        return "none";
    }
  };

  // Vérifier si un point est proche d'un autre point
  const isPointNear = (
    point1: { x: number; y: number },
    point2: { x: number; y: number },
    threshold: number
  ): boolean => {
    const distance = Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
    return distance <= threshold;
  };

  // Convertir les coordonnées de la souris en coordonnées du canvas
  const getCanvasCoordinates = (
    event: React.MouseEvent<HTMLCanvasElement>
  ): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Récupérer l'échelle depuis le dataset du canvas
    const scaleX = parseFloat(canvas.dataset.scaleX || "1");
    const scaleY = parseFloat(canvas.dataset.scaleY || "1");

    // Calculer les coordonnées ajustées à l'échelle
    return {
      x: (event.clientX - rect.left) / scaleX,
      y: (event.clientY - rect.top) / scaleY
    };
  };

  // Fonction pour trouver un élément sous le pointeur
  const findElementAtPosition = (position: {
    x: number;
    y: number;
  }): string | null => {
    // Parcourir les éléments en sens inverse pour trouver le plus récent
    for (let i = drawings.length - 1; i >= 0; i--) {
      const drawing = drawings[i];

      // Pour les mesures, vérifier si le clic est sur le texte
      if (drawing.type === "measurement" && drawing.points.length >= 2) {
        const [start, end] = [
          drawing.points[0],
          drawing.points[drawing.points.length - 1],
        ];
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;

        // Zone de détection autour du texte
        const textWidth = 50; // Largeur approximative
        const textHeight = 20; // Hauteur approximative

        if (
          position.x >= midX - textWidth / 2 &&
          position.x <= midX + textWidth / 2 &&
          position.y >= midY - 20 - textHeight / 2 &&
          position.y <= midY - 20 + textHeight / 2
        ) {
          return drawing.id;
        }
      }

      if (isPositionInElement(position, drawing)) {
        return drawing.id;
      }
    }

    return null;
  };

  // Vérifier si une position est dans un élément
  const isPositionInElement = (
    position: { x: number; y: number },
    element: DrawingElement
  ): boolean => {
    const { type, points } = element;

    if (points.length < 2 && type !== "text") return false;

    switch (type) {
      case "rectangle": {
        const [start, end] = [points[0], points[points.length - 1]];
        const minX = Math.min(start.x, end.x);
        const maxX = Math.max(start.x, end.x);
        const minY = Math.min(start.y, end.y);
        const maxY = Math.max(start.y, end.y);

        return (
          position.x >= minX &&
          position.x <= maxX &&
          position.y >= minY &&
          position.y <= maxY
        );
      }

      case "circle": {
        const [center, radiusPoint] = [points[0], points[points.length - 1]];
        const radius = Math.sqrt(
          Math.pow(radiusPoint.x - center.x, 2) +
            Math.pow(radiusPoint.y - center.y, 2)
        );

        const distance = Math.sqrt(
          Math.pow(position.x - center.x, 2) +
            Math.pow(position.y - center.y, 2)
        );

        return distance <= radius;
      }

      case "arrow":
      case "measurement": {
        const [start, end] = [points[0], points[points.length - 1]];
        const lineWidth = 10; // Zone de détection autour de la ligne

        // Distance du point à la ligne
        const length = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );
        if (length === 0) return false;

        const distance =
          Math.abs(
            (end.y - start.y) * position.x -
              (end.x - start.x) * position.y +
              end.x * start.y -
              end.y * start.x
          ) / length;

        // Vérifier si le point est proche de la ligne et entre les extrémités
        const dotProduct =
          ((position.x - start.x) * (end.x - start.x) +
            (position.y - start.y) * (end.y - start.y)) /
          Math.pow(length, 2);

        return distance <= lineWidth && dotProduct >= 0 && dotProduct <= 1;
      }

      case "text": {
        if (points.length < 1 || !element.text) return false;

        const [pos] = points;
        const textWidth = element.text
          ? element.text.length * (element.strokeWidth * 3)
          : 0;
        const textHeight = element.strokeWidth * 5;

        return (
          position.x >= pos.x &&
          position.x <= pos.x + textWidth &&
          position.y >= pos.y &&
          position.y <= pos.y + textHeight
        );
      }

      case "freehand": {
        // Pour le dessin à main levée, vérifier la proximité avec chaque segment
        const threshold = 10;

        for (let i = 1; i < points.length; i++) {
          const p1 = points[i - 1];
          const p2 = points[i];

          // Distance du point au segment
          const length = Math.sqrt(
            Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
          );
          if (length === 0) continue;

          const distance =
            Math.abs(
              (p2.y - p1.y) * position.x -
                (p2.x - p1.x) * position.y +
                p2.x * p1.y -
                p2.y * p1.x
            ) / length;

          // Vérifier si le point est proche du segment et entre les extrémités
          const dotProduct =
            ((position.x - p1.x) * (p2.x - p1.x) +
              (position.y - p1.y) * (p2.y - p1.y)) /
            Math.pow(length, 2);

          if (distance <= threshold && dotProduct >= 0 && dotProduct <= 1) {
            return true;
          }
        }

        return false;
      }

      case "cloud": {
        const [start, end] = [points[0], points[points.length - 1]];
        const width = Math.abs(end.x - start.x);
        const height = Math.abs(end.y - start.y);
        const centerX = Math.min(start.x, end.x) + width / 2;
        const centerY = Math.min(start.y, end.y) + height / 2;

        // Approximation de la zone du nuage comme une ellipse
        const normalizedX = (position.x - centerX) / (width / 2);
        const normalizedY = (position.y - centerY) / (height / 2);

        return Math.pow(normalizedX, 2) + Math.pow(normalizedY, 2) <= 1;
      }

      default:
        return false;
    }
  };

  // Gérer le début du dessin, de la sélection ou du redimensionnement
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(event);

    // Si nous sommes en mode sélection
    if (currentTool === "select") {
      // Chercher un élément sous le pointeur
      const elementId = findElementAtPosition(coords);

      // Dans la fonction handleMouseDown, modifiez cette partie
      if (elementId) {
        const element = drawings.find((d) => d.id === elementId);

        // Permettre l'édition de texte sur simple clic
        if (element?.type === "text" && event.detail === 2) {
          // Double-clic uniquement pour éditer le texte
          handleEditText(element);
          return;
        }
        
        // Pour les mesures, permettre l'édition sur double-clic
        if (element?.type === "measurement" && event.detail === 2) {
          handleMeasurementEdit(elementId);
          return;
        }
        
        // Corriger cette condition pour le redimensionnement
        // Toujours vérifier les poignées, que l'élément soit sélectionné ou non
        const handle = getResizeHandleAtPosition(element, coords);
        if (handle !== "none") {
          // D'abord sélectionner l'élément
          setSelectedElement(elementId);
          setDrawings(
            drawings.map((d) => ({
              ...d,
              selected: d.id === elementId,
            }))
          );
          
          // Ensuite commencer le redimensionnement
          setIsResizing(true);
          setCurrentResizeHandle(handle);
          setDragStart(coords);
          setOriginalPoints([...element.points]);
          return;
        }
        
        // Sélectionner l'élément pour le déplacement
        setSelectedElement(elementId);
        setDrawings(
          drawings.map((d) => ({
            ...d,
            selected: d.id === elementId,
          }))
        );
        
        // Préparer pour le déplacement
        setDragStart(coords);
      } else {
        // Désélectionner
        setSelectedElement(null);
        setDrawings(
          drawings.map((d) => ({
            ...d,
            selected: false,
          }))
        );
      }
      return;
    }

    if (currentTool === "text") {
      // Pour le texte, montrer l'input à la position du clic
      setTextPosition(coords);
      setTextInput("");
      setShowTextInput(true);
      return;
    }

    // Ajout pour le nouvel outil "hand"
    if (currentTool === "hand") {
      // Chercher un élément sous le pointeur
      const elementId = findElementAtPosition(coords);
      
      if (elementId) {
        // Ne pas changer la sélection, juste préparer pour le déplacement
        setDragStart(coords);
        
        // Stocker l'élément à déplacer sans changer les états de sélection
        setSelectedElement(elementId);
      }
      return;
    }

    setIsDrawing(true);

    // Créer un nouvel élément de dessin
    const newDrawing: DrawingElement = {
      id: `drawing-${Date.now()}`,
      type: currentTool,
      points: [coords],
      color: currentColor,
      strokeWidth,
    };

    setCurrentDrawing(newDrawing);
  };

  // Gérer l'édition de texte
  const handleEditText = (element: DrawingElement) => {
    if (element.type !== "text") return;

    const existingText = element.text || "";

    // Sauvegarder l'état actuel
    setDrawingHistory([...drawingHistory, [...drawings]]);

    // Supprimer l'ancien texte
    setDrawings(drawings.filter((d) => d.id !== element.id));

    // Configurer le nouvel input texte
    setTextPosition(element.points[0]);
    setTextInput(existingText);
    setShowTextInput(true);
  };

  // Vérifiez que cette fonction est correcte
  const handleMeasurementEdit = (elementId: string) => {
    const element = drawings.find((d) => d.id === elementId);
    if (!element || element.type !== "measurement") return;

    // Calculer la distance physique comme valeur par défaut
    const [start, end] = [
      element.points[0],
      element.points[element.points.length - 1],
    ];
    const distance = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );

    // Ouvrir la fenêtre d'édition avec les valeurs actuelles
    setMeasurementToEdit({
      id: elementId,
      value: element.measurement?.value || Math.round(distance).toString(),
      unit: element.measurement?.unit || "mm",
    });
    
    console.log("Ouverture de la fenêtre d'édition de mesure", elementId);
  };

  // Gérer le mouvement pendant le dessin, le déplacement ou le redimensionnement
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(event);

    // Gérer le redimensionnement
    if (isResizing && selectedElement && dragStart) {
      const selectedDrawing = drawings.find((d) => d.id === selectedElement);
      if (!selectedDrawing) return;

      // Calculer le déplacement
      const dx = coords.x - dragStart.x;
      const dy = coords.y - dragStart.y;

      // Nouvelle approche : créer une copie complète des points
      const newPoints = [...originalPoints.map(p => ({...p}))];
      
      try {
        switch (selectedDrawing.type) {
          case "rectangle":
          case "cloud": {
            if (newPoints.length < 2) break;
            
            // Référence aux points
            const start = newPoints[0];
            const end = newPoints[1];
            
            switch (currentResizeHandle) {
              case "top-left":
                start.x += dx;
                start.y += dy;
                break;
              case "top-right":
                start.y += dy;
                end.x += dx;
                break;
              case "bottom-left":
                start.x += dx;
                end.y += dy;
                break;
              case "bottom-right":
                end.x += dx;
                end.y += dy;
                break;
              case "top":
                start.y += dy;
                break;
              case "right":
                end.x += dx;
                break;
              case "bottom":
                end.y += dy;
                break;
              case "left":
                start.x += dx;
                break;
            }
            break;
          }
          
          case "circle": {
            if (newPoints.length < 2) break;
            
            const center = newPoints[0]; // Point central
            const radiusPoint = newPoints[1]; // Point qui définit le rayon
            
            // Calculer le rayon actuel
            const radius = Math.sqrt(
              Math.pow(radiusPoint.x - center.x, 2) +
              Math.pow(radiusPoint.y - center.y, 2)
            );
            
            // Ajuster le rayon en fonction du handle
            switch (currentResizeHandle) {
              case "top":
                radiusPoint.y = center.y - (radius + dy);
                break;
              case "right":
                radiusPoint.x = center.x + (radius + dx);
                break;
              case "bottom":
                radiusPoint.y = center.y + (radius + dy);
                break;
              case "left":
                radiusPoint.x = center.x - (radius + dx);
                break;
            }
            break;
          }
          
          case "arrow":
          case "measurement": {
            if (newPoints.length < 2) break;
            
            switch (currentResizeHandle) {
              case "top-left":
                newPoints[0].x += dx;
                newPoints[0].y += dy;
                break;
              case "bottom-right":
                newPoints[1].x += dx;
                newPoints[1].y += dy;
                break;
            }
            break;
          }
        }
        
        // Mettre à jour l'élément avec les nouveaux points sans modifier l'original
        setDrawings(drawings.map(d => 
          d.id === selectedElement 
            ? {...d, points: newPoints}
            : d
        ));
      } catch (error) {
        console.error("Erreur lors du redimensionnement:", error);
      }
      
      // Mettre à jour le point de départ pour la prochaine itération
      setDragStart({...coords});
      return;
    }
    
    // Dans la fonction handleMouseMove
    if (
      currentTool === "select" &&
      selectedElement &&
      dragStart &&
      !isResizing
    ) {
      // Déplacer l'élément sélectionné
      const dx = coords.x - dragStart.x;
      const dy = coords.y - dragStart.y;

      const selectedDrawing = drawings.find(d => d.id === selectedElement);
      
      // Vérifier que l'élément sélectionné existe
      if (!selectedDrawing) {
        setDragStart(coords);
        return;
      }
      
      // Appliquer le snap to grid si activé
      let adjustedDx = dx;
      let adjustedDy = dy;
      
      if (snapToGrid) {
        // Calculer la nouvelle position potentielle du premier point
        const newX = selectedDrawing.points[0].x + dx;
        const newY = selectedDrawing.points[0].y + dy;
        
        // Ajuster pour snapper à la grille
        const snappedX = Math.round(newX / gridSize) * gridSize;
        const snappedY = Math.round(newY / gridSize) * gridSize;
        
        // Recalculer le déplacement pour atteindre la position snappée
        adjustedDx = snappedX - selectedDrawing.points[0].x;
        adjustedDy = snappedY - selectedDrawing.points[0].y;
      }
  
      // Mettre à jour tous les points de l'élément
      setDrawings(
        drawings.map((d) => {
          if (d.id === selectedElement) {
            return {
              ...d,
              points: d.points.map((p) => ({
                x: p.x + adjustedDx,
                y: p.y + adjustedDy,
              })),
            };
          }
          return d;
        })
      );
      
      setDragStart(coords);
      return;
    }

    // Gérer le déplacement en mode "hand"
    if (currentTool === "hand" && selectedElement && dragStart) {
      const dx = coords.x - dragStart.x;
      const dy = coords.y - dragStart.y;

      // Appliquer le snap to grid si activé
      let adjustedDx = dx;
      let adjustedDy = dy;
      
      if (snapToGrid) {
        // Calculer la nouvelle position potentielle du premier point
        const element = drawings.find(d => d.id === selectedElement);
        if (element) {
          const newX = element.points[0].x + dx;
          const newY = element.points[0].y + dy;
          
          // Ajuster pour snapper à la grille
          const snappedX = Math.round(newX / gridSize) * gridSize;
          const snappedY = Math.round(newY / gridSize) * gridSize;
          
          // Recalculer le déplacement pour atteindre la position snappée
          adjustedDx = snappedX - element.points[0].x;
          adjustedDy = snappedY - element.points[0].y;
        }
      }

      // Mettre à jour tous les points de l'élément
      setDrawings(
        drawings.map((d) => {
          if (d.id === selectedElement) {
            return {
              ...d,
              points: d.points.map((p) => ({
                x: p.x + adjustedDx,
                y: p.y + adjustedDy,
              })),
            };
          }
          return d;
        })
      );
      
      setDragStart(coords);
      return;
    }

    if (!isDrawing || !currentDrawing) return;

    if (currentTool === "freehand") {
      // Pour le dessin à main levée, ajouter chaque point
      setCurrentDrawing({
        ...currentDrawing,
        points: [...currentDrawing.points, coords],
      });
    } else {
      // Pour les autres formes, mettre à jour uniquement le dernier point
      const points = [...currentDrawing.points];
      if (points.length > 1) {
        points[points.length - 1] = coords;
      } else {
        points.push(coords);
      }
      setCurrentDrawing({
        ...currentDrawing,
        points,
      });
    }
  };

  // Gérer la fin du dessin, du déplacement ou du redimensionnement
  const handleMouseUp = () => {
    // Fin du redimensionnement
    if (isResizing) {
      // Sauvegarder l'état actuel dans l'historique
      setDrawingHistory([...drawingHistory, [...drawings]]);
      
      // Réinitialiser tous les états liés au redimensionnement
      setIsResizing(false);
      setCurrentResizeHandle("none");
      setOriginalPoints([]);
      setDragStart(null); // Important: s'assurer que dragStart est null
      return;
    }

    // Fin du déplacement
    if ((currentTool === "select" || currentTool === "hand") && selectedElement && dragStart) {
      // Sauvegarder l'état actuel dans l'historique
      setDrawingHistory([
        ...drawingHistory,
        [...drawings]
      ]);
      
      // Important: réinitialiser dragStart pour "décrocher" l'élément du curseur
      setDragStart(null);
      
      // Si nous sommes en mode "hand", ne pas maintenir la sélection
      if (currentTool === "hand") {
        setSelectedElement(null);
        setDrawings(drawings.map(d => ({...d, selected: false})));
      }
      
      return;
    }

    if (!isDrawing || !currentDrawing) return;

    setIsDrawing(false);

    if (currentTool === "eraser") {
      // Pour l'effaceur, supprimer les éléments touchés
      handleErase(currentDrawing.points);
    } else if (
      currentDrawing.points.length >= 2 ||
      (currentTool === "text" && currentDrawing.text)
    ) {
      // Sauvegarder l'état actuel dans l'historique
      setDrawingHistory([...drawingHistory, drawings]);

      // Ajouter le nouveau dessin à la liste
      setDrawings([...drawings, currentDrawing]);
    }

    setCurrentDrawing(null);
  };

  // Gérer l'effacement
  const handleErase = (eraserPoints: { x: number; y: number }[]) => {
    if (eraserPoints.length === 0) return;

    // Sauvegarder l'état actuel dans l'historique
    setDrawingHistory([...drawingHistory, drawings]);

    // Trouver les éléments qui intersectent avec l'effaceur
    const toRemove = new Set<string>();

    drawings.forEach((drawing) => {
      for (const point of eraserPoints) {
        if (isPositionInElement(point, drawing)) {
          toRemove.add(drawing.id);
          break;
        }
      }
    });

    // Supprimer les éléments identifiés
    if (toRemove.size > 0) {
      const remainingDrawings = drawings.filter(
        (drawing) => !toRemove.has(drawing.id)
      );
      setDrawings(remainingDrawings);
    }
  };

  // Gérer l'ajout de texte
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!textPosition || !textInput.trim()) {
      setShowTextInput(false);
      return;
    }

    // Créer un élément de texte
    const textElement: DrawingElement = {
      id: `text-${Date.now()}`,
      type: "text",
      points: [textPosition],
      color: currentColor,
      strokeWidth: strokeWidth,
      text: textInput.trim(),
    };

    // Sauvegarder l'état actuel dans l'historique
    setDrawingHistory([...drawingHistory, [...drawings]]);

    // Ajouter le texte aux dessins
    setDrawings([...drawings, textElement]);

    // Réinitialiser
    setTextInput("");
    setTextPosition(null);
    setShowTextInput(false);
  };

  // Annuler la dernière action
  const handleUndo = () => {
    if (drawingHistory.length === 0) return;

    const lastState = drawingHistory[drawingHistory.length - 1];
    setDrawings(lastState);
    setDrawingHistory(drawingHistory.slice(0, -1));
  };

  // Supprimer l'élément sélectionné
  const handleDeleteSelected = () => {
    if (!selectedElement) return;

    // Sauvegarder l'état actuel dans l'historique
    setDrawingHistory([...drawingHistory, drawings]);

    // Supprimer l'élément sélectionné
    const filteredDrawings = drawings.filter((d) => d.id !== selectedElement);
    setDrawings(filteredDrawings);
    setSelectedElement(null);
  };

  // Dupliquer l'élément sélectionné
  const handleDuplicateSelected = () => {
    if (!selectedElement) return;

    const elementToDuplicate = drawings.find((d) => d.id === selectedElement);
    if (!elementToDuplicate) return;

    // Créer un nouvel élément avec un nouvel ID et des propriétés copiées
    const duplicatedElement: DrawingElement = {
      ...elementToDuplicate,
      id: `drawing-${Date.now()}`, // Nouveau ID
      points: elementToDuplicate.points.map((p) => ({ ...p })), // Copier les points
      selected: false, // Ne pas sélectionner par défaut
    };

    // Sauvegarder l'état actuel dans l'historique
    setDrawingHistory([...drawingHistory, drawings]);

    // Ajouter le nouvel élément à la liste
    setDrawings([...drawings, duplicatedElement]);
  };

  // Sauvegarder l'image modifiée
  const handleSaveImage = () => {
    if (!canvasRef.current || !imageRef.current) return;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Configurer le canvas temporaire
      canvas.width = imageRef.current.naturalWidth;
      canvas.height = imageRef.current.naturalHeight;

      // Dessiner l'image originale
      ctx.drawImage(imageRef.current, 0, 0);

      // Dessiner tous les dessins sans sélection
      drawings.forEach((drawing) => {
        const drawingWithoutSelection = { ...drawing, selected: false };
        drawElement(ctx, drawingWithoutSelection);
      });

      // Convertir en data URL
      const editedImageUrl = canvas.toDataURL("image/png");
      console.log("Image sauvegardée avec", drawings.length, "dessins");

      // Transmettre aussi les dessins pour permettre l'édition ultérieure
      onSave(editedImageUrl, drawings);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la création de l'image:", error);
    }
  };

  // Sauvegarder les modifications de mesure
  const handleSaveMeasurement = () => {
    if (!measurementToEdit) return;

    // Mettre à jour l'élément avec la nouvelle mesure
    setDrawings(
      drawings.map((d) =>
        d.id === measurementToEdit.id
          ? {
              ...d,
              measurement: {
                value: measurementToEdit.value,
                unit: measurementToEdit.unit,
              },
            }
          : d
      )
    );

    setMeasurementToEdit(null);
  };

  // Remplacer la fonction normalizeImageUrl par celle-ci
  const normalizeImageUrl = (url: string): string => {
    // Si l'URL commence par "photo-ref:", essayer de traiter ces URLs spéciales
    if (url && url.startsWith("photo-ref:")) {
      // Option 1: Utiliser une URL de proxy pour récupérer l'image
      return `/api/proxy-image?url=${encodeURIComponent(url)}`;

      // OU Option 2: Remplacer par une URL d'API si disponible
      // return `/api/photos/${url.split(':')[1]}`;

      // OU Option 3: Si c'est pour le développement, utiliser une image de substitution
      // return "https://via.placeholder.com/800x600?text=Image+Placeholder";
    }

    // Retourner l'URL d'origine si aucune transformation n'est nécessaire
    return url;
  };

  // Ajouter une fonction pour mettre à jour les propriétés d'un élément sélectionné
  const updateSelectedElementProperties = (updates: Partial<DrawingElement>) => {
    if (!selectedElement) return;
    
    // Sauvegarder l'état actuel dans l'historique
    setDrawingHistory([...drawingHistory, [...drawings]]);
    
    setDrawings(
      drawings.map((d) => 
        d.id === selectedElement
          ? { ...d, ...updates }
          : d
      )
    );
  };

  // Ajouter une liste d'outils pour une meilleure organisation
  const tools = [
    {
      id: "select",
      icon: <MousePointer className="h-4 w-4" />,
      label: "Sélectionner",
      shortcut: "V",
    },
    {
      id: "hand",
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path></svg>,
      label: "Déplacer",
      shortcut: "H",
    },
    {
      id: "freehand",
      icon: <Pencil className="h-4 w-4" />,
      label: "Dessin libre",
      shortcut: "P",
    },
    {
      id: "rectangle",
      icon: <Square className="h-4 w-4" />,
      label: "Rectangle",
      shortcut: "R",
    },
    {
      id: "circle",
      icon: <Circle className="h-4 w-4" />,
      label: "Cercle",
      shortcut: "C",
    },
    {
      id: "arrow",
      icon: <ArrowUpRight className="h-4 w-4" />,
      label: "Flèche",
      shortcut: "A",
    },
    {
      id: "text",
      icon: <Type className="h-4 w-4" />,
      label: "Texte",
      shortcut: "T",
    },
    {
      id: "measurement",
      icon: <Ruler className="h-4 w-4" />,
      label: "Mesure",
      shortcut: "M",
    },
    {
      id: "cloud",
      icon: <Cloud className="h-4 w-4" />,
      label: "Nuage",
      shortcut: "",
    },
    {
      id: "eraser",
      icon: <Eraser className="h-4 w-4" />,
      label: "Effacer",
      shortcut: "E",
    },
  ];

  // Ajouter une fonction pour déterminer le style du curseur en fonction du handle
  const getResizeCursor = (handle: ResizeHandle): string => {
    switch (handle) {
      case "top-left":
      case "bottom-right":
        return "nwse-resize";
      case "top-right":
      case "bottom-left":
        return "nesw-resize";
      case "top":
      case "bottom":
        return "ns-resize";
      case "left":
      case "right":
        return "ew-resize";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Éditer l'image</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap justify-center gap-2 my-2">
          <div className="flex border rounded-md bg-white overflow-hidden">
            {tools.map((tool) => (
              <Button
                key={tool.id}
                variant={currentTool === tool.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentTool(tool.id as DrawingShape)}
                title={`${tool.label} ${
                  tool.shortcut ? `(${tool.shortcut})` : ""
                }`}
                className="rounded-none h-9 px-2 border-r last:border-r-0">
                {tool.icon}
              </Button>
            ))}
          </div>

          {/* Couleurs et épaisseurs dans un groupe séparé */}
          <div className="flex border rounded-md bg-white overflow-hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-none h-9 px-2 border-r">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: currentColor }}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="grid grid-cols-3 gap-1 p-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border ${
                        currentColor === color
                          ? "ring-2 ring-offset-1 ring-blue-500"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setCurrentColor(color)}
                    />
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-none h-9 px-2">
                  <div
                    className="w-4 h-0.5 rounded-full bg-current"
                    style={{ height: `${strokeWidth / 2}px` }}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="p-2 w-48">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Actions */}
          <div className="flex border rounded-md bg-white overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={drawingHistory.length === 0}
              title="Annuler (Ctrl+Z)"
              className="rounded-none h-9 px-2 border-r">
              <Undo className="h-4 w-4" />
            </Button>

            {selectedElement && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteSelected}
                  title="Supprimer (Delete)"
                  className="rounded-none h-9 px-2 text-red-600 border-r">
                  <Eraser className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDuplicateSelected}
                  title="Dupliquer (Ctrl+D)"
                  className="rounded-none h-9 px-2 border-r">
                  <Copy className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Bouton pour activer/désactiver la grille */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              title={showGrid ? "Masquer la grille" : "Afficher la grille"}
              className="rounded-none h-9 px-2">
              <Grid className="h-4 w-4" />
            </Button>

            {/* Bouton pour activer/désactiver le snap to grid */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSnapToGrid(!snapToGrid)}
              title={
                snapToGrid ? "Désactiver snap to grid" : "Activer snap to grid"
              }
              className={`rounded-none h-9 px-2 ${
                snapToGrid ? "bg-blue-100" : ""
              }`}>
              {/* Changer l'icône pour éviter la confusion */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4">
                <path d="M5 5 L19 19"></path>
                <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                <circle cx="9" cy="9" r="2"></circle>
              </svg>
            </Button>
          </div>

          {/* Panneau de propriétés pour l'élément sélectionné */}
          {selectedElement && (
            <div className="flex border rounded-md bg-white overflow-hidden ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-none h-9 px-2"
                    title="Modifier la couleur">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor:
                          drawings.find((d) => d.id === selectedElement)
                            ?.color || currentColor,
                      }}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <div className="grid grid-cols-3 gap-1 p-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border`}
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          updateSelectedElementProperties({ color })
                        }
                      />
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-none h-9 px-2"
                    title="Modifier l'épaisseur">
                    <div
                      className="w-4 h-0.5 rounded-full bg-current"
                      style={{
                        height: `${
                          (drawings.find((d) => d.id === selectedElement)
                            ?.strokeWidth || strokeWidth) / 2
                        }px`,
                      }}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <div className="p-2 w-48">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={
                        drawings.find((d) => d.id === selectedElement)
                          ?.strokeWidth || strokeWidth
                      }
                      onChange={(e) =>
                        updateSelectedElementProperties({
                          strokeWidth: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div
          ref={containerRef}
          className="relative flex-1 overflow-auto border rounded-md flex items-center justify-center bg-gray-100">
          {/* Image originale (masquée) */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Original"
            className="hidden"
          />

          {/* Canvas pour l'édition */}
          <div className="relative">
            <img
              src={normalizeImageUrl(imageUrl)}
              alt="Édition"
              className="max-w-full max-h-[60vh] object-contain"
              onError={(e) => {
                console.log("Erreur de chargement de l'image dans le rendu");
                // Utiliser une image de secours
                e.currentTarget.src =
                  "https://via.placeholder.com/800x600?text=Image+Non+Disponible";
              }}
            />

            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              style={{
                cursor: isResizing
                  ? getResizeCursor(currentResizeHandle)
                  : currentTool === "hand" && selectedElement && dragStart
                  ? "grabbing"
                  : currentTool === "hand"
                  ? "grab"
                  : currentTool === "select"
                  ? "default"
                  : "crosshair",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />

            {/* Input pour le texte */}
            {showTextInput && textPosition && (
              <form
                onSubmit={handleTextSubmit}
                className="absolute z-50" // Ajouter z-50 pour s'assurer qu'il est au-dessus
                style={{
                  left: `${
                    (textPosition.x / (canvasRef.current?.width || 1)) * 100
                  }%`,
                  top: `${
                    (textPosition.y / (canvasRef.current?.height || 1)) * 100
                  }%`,
                  transform: "translate(-50%, -50%)", // Centrer sur le point de clic
                }}>
                <Input
                  ref={textInputRef}
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="bg-white border p-1 text-sm w-48"
                  placeholder="Saisir votre texte"
                  autoFocus
                />
                <Button type="submit" size="sm" className="mt-1 w-full">
                  Ajouter
                </Button>
              </form>
            )}
          </div>
        </div>
        
        {/* Ajouter les boutons de direction de flèche manquants */}
        {selectedElement && drawings.find(d => d.id === selectedElement)?.type === "arrow" && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex border rounded-md bg-white overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateSelectedElementProperties({ arrowDirection: "right" })}
              title="Flèche à droite"
              className={`rounded-none h-9 px-2 ${
                drawings.find(d => d.id === selectedElement)?.arrowDirection === "right" ? "bg-blue-100" : ""
              }`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateSelectedElementProperties({ arrowDirection: "left" })}
              title="Flèche à gauche"
              className={`rounded-none h-9 px-2 ${
                drawings.find(d => d.id === selectedElement)?.arrowDirection === "left" ? "bg-blue-100" : ""
              }`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateSelectedElementProperties({ arrowDirection: "both" })}
              title="Flèche bidirectionnelle"
              className={`rounded-none h-9 px-2 ${
                drawings.find(d => d.id === selectedElement)?.arrowDirection === "both" ? "bg-blue-100" : ""
              }`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
                <polyline points="12 5 5 12 12 19"></polyline>
              </svg>
            </Button>
          </div>
        )}
        
        {measurementToEdit && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-4 rounded-md w-80 shadow-lg relative">
              <h3 className="font-medium mb-4">Modifier la mesure</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="measurement-value">Valeur</Label>
                  <Input
                    id="measurement-value"
                    value={measurementToEdit.value}
                    onChange={(e) =>
                      setMeasurementToEdit({
                        ...measurementToEdit,
                        value: e.target.value,
                      })
                    }
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="measurement-unit">Unité</Label>
                  <Select
                    value={measurementToEdit.unit}
                    onValueChange={(value) =>
                      setMeasurementToEdit({
                        ...measurementToEdit,
                        unit: value,
                      })
                    }>
                    <SelectTrigger id="measurement-unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm">mm</SelectItem>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="m">m</SelectItem>
                      <SelectItem value="m">m</SelectItem>
                      <SelectItem value="px">px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setMeasurementToEdit(null)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSaveMeasurement}>Enregistrer</Button>
                </div>
              </div>
            </div>
          </div>
        )}
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSaveImage}>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
