import { useState, useEffect } from "react";
import { uploadAnnotation } from "@/services/storageService";

export interface AsyncImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  projectId: string;
  fallback?: React.ReactNode;
  onError?: (error: Error) => React.ReactNode;
}

export const AsyncImage = ({
  src,
  alt,
  className,
  projectId,
  fallback,
  onError,
}: AsyncImageProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const convertImageIfNeeded = async () => {
      if (!src) {
        setError(new Error("Source image non fournie"));
        return;
      }

      try {
        // Pour les URLs blob, on les utilise directement
        if (src.startsWith("blob:")) {
          setImageSrc(src);
          return;
        }

        // Pour les images data:image, on vérifie si elles sont valides
        if (src.startsWith("data:image")) {
          // Vérification basique du format data:image
          if (!src.includes(";base64,")) {
            throw new Error("Format d'image base64 invalide");
          }

          try {
            setIsConverting(true);
            // Pour tester si l'image base64 est valide sans la télécharger
            const img = new Image();
            img.onload = async () => {
              try {
                // L'image est valide, on peut la convertir
                const convertedUrl = await uploadAnnotation(src, projectId);
                setImageSrc(convertedUrl);
              } catch (error) {
                console.error("Erreur lors de la conversion:", error);
                setError(new Error("Erreur de conversion"));
              } finally {
                setIsConverting(false);
              }
            };
            img.onerror = () => {
              setIsConverting(false);
              setError(new Error("Image base64 invalide"));
            };
            img.src = src;
          } catch (error) {
            setIsConverting(false);
            setError(new Error("Image base64 invalide"));
          }
          return;
        }

        // Pour les URLs HTTP ou les chemins relatifs
        setImageSrc(src);
      } catch (err) {
        console.error("Erreur lors du traitement de l'image:", err);
        setError(err instanceof Error ? err : new Error("Erreur inconnue"));
      }
    };

    convertImageIfNeeded();
  }, [src, projectId]);

  if (isConverting) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div
        className={`flex items-center justify-center bg-slate-100 ${className}`}>
        <div className="text-xs text-muted-foreground">
          Conversion en cours...
        </div>
      </div>
    );
  }

  if (error) {
    return onError ? (
      <>{onError(error)}</>
    ) : (
      <div
        className={`flex items-center justify-center bg-slate-100 ${className}`}>
        <div className="text-xs text-muted-foreground">
          Image non disponible
        </div>
      </div>
    );
  }

  if (!imageSrc) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div
        className={`flex items-center justify-center bg-slate-100 ${className}`}>
        <div className="text-xs text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className || ""}
      onError={(e) => {
        console.error(`Erreur de chargement d'image: ${imageSrc}`);
        setError(new Error("Impossible de charger l'image"));
        // Masquer l'image en erreur
        e.currentTarget.style.display = "none";
      }}
    />
  );
};
