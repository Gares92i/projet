import React, { useState, useRef } from "react";
import { Button } from "@/ui/button";
import { FileUp, Image, FileText } from "lucide-react";
import { toast } from "sonner";

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface AddFileButtonProps {
  onDocumentUpdate: (url: string, filename: string) => void;
}

export const AddFileButton: React.FC<AddFileButtonProps> = ({ onDocumentUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Seuls les fichiers images et PDF sont acceptés");
      return;
    }
    
    // Check file size and warn if too large
    if (file.size > MAX_FILE_SIZE) {
      toast.warning(`Le fichier est volumineux (${(file.size / (1024 * 1024)).toFixed(2)}MB). Le chargement peut prendre du temps.`);
    }

    setIsUploading(true);
    const loadingToast = toast.loading(`Chargement de ${file.name}...`);

    try {
      // Create a file reader to convert to Data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          try {
            const dataUrl = event.target.result;
            
            // For images, optimize if they're large
            if (file.type.startsWith("image/") && file.size > 2 * 1024 * 1024) {
              // For images larger than 2MB, optimize them
              optimizeImage(dataUrl, 1800, 1800, 0.8)
                .then(optimizedUrl => {
                  onDocumentUpdate(optimizedUrl, file.name);
                  toast.dismiss(loadingToast);
                  toast.success(`Fichier ${file.name} ajouté avec succès`);
                })
                .catch(err => {
                  console.error("Erreur lors de l'optimisation:", err);
                  // Fall back to original if optimization fails
                  onDocumentUpdate(dataUrl, file.name);
                  toast.dismiss(loadingToast);
                  toast.success(`Fichier ${file.name} ajouté avec succès`);
                });
            } else {
              // For smaller images and PDFs, use as-is
              onDocumentUpdate(dataUrl, file.name);
              toast.dismiss(loadingToast);
              toast.success(`Fichier ${file.name} ajouté avec succès`);
            }
          } catch (error) {
            console.error("Erreur lors du traitement du fichier:", error);
            toast.dismiss(loadingToast);
            toast.error(`Erreur lors du traitement de ${file.name}`);
          }
        }
        setIsUploading(false);
      };

      reader.onerror = () => {
        toast.dismiss(loadingToast);
        toast.error(`Erreur lors du chargement de ${file.name}`);
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.dismiss(loadingToast);
      toast.error(`Erreur lors du chargement de ${file.name}`);
      setIsUploading(false);
    }
  };

  // Function to optimize images
  const optimizeImage = (dataUrl: string, maxWidth: number, maxHeight: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        const aspectRatio = width / height;
        
        // Resize if image exceeds maximum dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            // Width is the limiting factor
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            // Height is the limiting factor
            height = maxHeight;
            width = height * aspectRatio;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Impossible de créer le contexte 2D"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Use the original image format if possible, fallback to JPEG
        let optimizedUrl;
        if (dataUrl.startsWith('data:image/png')) {
          optimizedUrl = canvas.toDataURL("image/png", quality);
        } else {
          optimizedUrl = canvas.toDataURL("image/jpeg", quality);
        }
        
        resolve(optimizedUrl);
      };

      img.onerror = reject;
      img.src = dataUrl;
    });
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="text-center">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*, application/pdf"
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="bg-muted/30 rounded-full p-6">
          <FileUp className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-lg">Aucun document</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Ajoutez un plan, un PDF ou une image pour commencer à annoter.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <Button onClick={handleButtonClick} disabled={isUploading}>
            <Image className="h-4 w-4 mr-2" />
            Ajouter une image
          </Button>
          <Button variant="outline" onClick={handleButtonClick} disabled={isUploading}>
            <FileText className="h-4 w-4 mr-2" />
            Importer un PDF
          </Button>
        </div>
      </div>
    </div>
  );
};