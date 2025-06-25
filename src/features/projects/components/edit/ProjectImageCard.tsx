import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import ProjectImageUpload from "@/features/projects/components/ProjectImageUpload";

interface ProjectImageCardProps {
  imageUrl?: string;
  projectName: string;
  projectId: string;
  onImageUploaded: (url: string) => void;
}

export const ProjectImageCard = ({ imageUrl, projectName, projectId, onImageUploaded }: ProjectImageCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Image du projet</CardTitle>
        <CardDescription>Ajoutez ou modifiez l'image du projet</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {imageUrl && (
            <div className="border rounded-md overflow-hidden">
              <img 
                src={imageUrl} 
                alt={projectName} 
                className="w-full h-40 object-cover"
              />
            </div>
          )}
          <ProjectImageUpload
            projectId={projectId}
            currentImageUrl={imageUrl}
            onUploadSuccess={onImageUploaded}
          />
          <p className="text-xs text-muted-foreground">
            Format recommandé: JPG ou PNG, taille max: 5MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
};