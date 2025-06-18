import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableRow, TableCell } from "@/components/ui/table";
import { Trash2, GripVertical, Image, Upload } from "lucide-react";
import { Observation } from "@/app/styles";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface SortableObservationItemProps {
  observation: Observation;
  updateObservation: (id: string, data: Partial<Observation>) => void;
  removeObservation: (id: string) => void;
}

export const SortableObservationItem = ({ 
  observation, 
  updateObservation, 
  removeObservation 
}: SortableObservationItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: observation.id });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
    position: isDragging ? 'relative' as const : 'static' as const,
    opacity: isDragging ? 0.8 : 1,
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log("Fichier sélectionné dans SortableObservationItem:", file.name, file.type);
    
    if (!file.type.startsWith("image/")) {
      toast.error("Seules les images sont acceptées");
      return;
    }
    
    setIsUploading(true);
    const loadingToast = toast.loading(`Téléchargement de ${file.name} en cours...`);
    
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          console.log("Image lue avec succès, mise à jour de l'observation");
          updateObservation(observation.id, { photoUrl: e.target.result as string });
          toast.dismiss(loadingToast);
          toast.success("Image téléchargée avec succès");
        } else {
          console.error("Résultat de lecture null");
          toast.dismiss(loadingToast);
          toast.error("Erreur lors de la lecture de l'image");
        }
        setIsUploading(false);
      };
      
      reader.onerror = (error) => {
        console.error("Erreur lecture fichier:", error);
        toast.dismiss(loadingToast);
        toast.error("Erreur lors du téléchargement de l'image");
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.dismiss(loadingToast);
      toast.error("Erreur lors du téléchargement de l'image");
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <TableRow ref={setNodeRef} style={style} className={cn(isDragging && "bg-muted")}>
      <TableCell className="w-12">
        <div className="flex items-center">
          <button 
            type="button" 
            {...attributes} 
            {...listeners} 
            className="cursor-grab touch-manipulation active:cursor-grabbing p-2 -m-2 rounded-full hover:bg-muted"
            aria-label="Déplacer l'élément"
            onTouchStart={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          <span className="ml-2">{observation.item}</span>
        </div>
      </TableCell>
      <TableCell>
        <Input
          value={observation.observation}
          onChange={(e) => updateObservation(observation.id, { observation: e.target.value })}
          placeholder="Type d'observation"
        />
      </TableCell>
      <TableCell>
        <Input
          value={observation.description}
          onChange={(e) => updateObservation(observation.id, { description: e.target.value })}
          placeholder="Description détaillée"
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {observation.photoUrl ? (
            <div className="relative group w-16 h-16">
              <img 
                src={observation.photoUrl}
                alt={`Photo observation ${observation.item}`} 
                className="w-16 h-16 object-cover rounded-md border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => updateObservation(observation.id, { photoUrl: undefined })}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? "Téléchargement..." : "Ajouter photo"}
              </Button>
            </>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => removeObservation(observation.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
