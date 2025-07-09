import React, { useState } from "react";
import { Button } from "@/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Upload, X, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  placeholder = "Cliquez pour uploader",
  size = "md",
  shape = "circle",
  className
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast.error("L'image ne peut pas dépasser 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Pour l'instant, on utilise une URL temporaire
      // TODO: Implémenter l'upload vers un service comme Cloudinary ou UploadThing
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onChange(result);
        setIsUploading(false);
        toast.success("Image uploadée avec succès");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      console.error("Erreur lors de l'upload:", error);
      toast.error("Erreur lors de l'upload de l'image");
    }
  };

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32"
  };

  const shapeClasses = {
    circle: "rounded-full",
    square: "rounded-lg"
  };

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      <div className="relative">
        <Avatar className={cn(sizeClasses[size], shapeClasses[shape])}>
          {value ? (
            <AvatarImage src={value} alt="Uploaded image" />
          ) : (
            <AvatarFallback className={cn(sizeClasses[size], shapeClasses[shape])}>
              <UserCircle className="h-8 w-8 text-muted-foreground" />
            </AvatarFallback>
          )}
        </Avatar>
        
        {value && onRemove && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => document.getElementById('image-upload')?.click()}
          className="relative"
        >
          {isUploading ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Upload en cours...</span>
            </div>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {placeholder}
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          Max: 5MB
        </p>
      </div>

      <input
        type="file"
        id="image-upload"
        className="hidden"
        accept="image/*"
        onChange={handleUpload}
        disabled={isUploading}
      />
    </div>
  );
}; 