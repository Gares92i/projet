import React, { useRef, useState } from 'react';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectImageUploadProps {
  projectId: string;
  currentImageUrl?: string;
  onUploadSuccess?: (imageUrl: string) => void;
  projectName?: string;
}

const ProjectImageUpload: React.FC<ProjectImageUploadProps> = ({
  projectId,
  currentImageUrl,
  onUploadSuccess,
  projectName = 'Projet'
}) => {
  const [preview, setPreview] = useState<string | undefined>(currentImageUrl);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Le fichier est trop volumineux. Taille maximum : 5MB');
        return;
      }

      setLoading(true);
      
      // Créer un aperçu local pour l'affichage
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        
        // Au lieu d'envoyer l'image en base64, on utilise un placeholder
        // L'image sera uploadée séparément plus tard
        const placeholderUrl = `placeholder://${file.name}`;
        onUploadSuccess?.(placeholderUrl);
        
        setLoading(false);
        toast.success('Image sélectionnée avec succès !');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(undefined);
    onUploadSuccess?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Aperçu de l'image */}
          {preview && (
            <div className="relative">
              <img 
                src={preview} 
                alt={`Image de ${projectName}`} 
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Zone d'upload classique */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
            {loading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Traitement en cours...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUploadClick}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>{preview ? 'Changer l\'image' : 'Ajouter une image'}</span>
                </Button>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF jusqu'à 5MB
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectImageUpload; 