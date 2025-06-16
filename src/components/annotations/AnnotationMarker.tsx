import React from "react";
import { cn } from "@/lib/utils";



interface AnnotationMarkerProps {
  x: number;
  y: number;
  selected?: boolean;
  resolved?: boolean;
  annotationNumber: number;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  scaleWithZoom?: boolean;
}

export const AnnotationMarker: React.FC<AnnotationMarkerProps> = ({
  x,
  y,
  selected = false,
  resolved = false,
  annotationNumber,
  onClick,
  className = "",
  scaleWithZoom = false,
}) => {
  // Convertir les coordonnées relatives (pourcentage) en px
  // x et y sont des pourcentages (0-100)
  const getPositionStyle = () => {
    // Limiter aux valeurs valides entre 0 et 100
    const validX = Math.min(Math.max(0, x), 100);
    const validY = Math.min(Math.max(0, y), 100);

    return {
      left: `${validX}%`,
      top: `${validY}%`,
      transform: "translate(-50%, -50%)",
      position: "absolute" as const, // Correction ici - utilisez "as const" au lieu de "as 'absolute'"
      // Aucun besoin de correctifs de zoom car l'élément parent est déjà zoomé
    };
  };
  return (
    <div
      className={`annotation-marker ${
        selected ? "ring-2 ring-blue-500" : ""
      } ${className}`}
      style={getPositionStyle()}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      data-testid={`annotation-${annotationNumber}`}>
      <div
        className={`flex items-center justify-center rounded-full 
          ${resolved ? "bg-green-500" : "bg-orange-500"}
          text-white font-bold transition-all duration-100 
          ${selected ? "scale-110 shadow-md" : ""}`}
        style={{
          width: "28px",
          height: "28px",
          border: selected
            ? "2px solid white"
            : "1px solid rgba(255,255,255,0.5)",
        }}>
        {annotationNumber}
      </div>
    </div>
  );
};