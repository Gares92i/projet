import React, { useState, useEffect, useRef } from "react"; // Ajoutez useRef à l'import
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/ui/dialog";
import { Annotation } from "@/app/styles";
import { Textarea } from "@/ui/textarea";
import { Button } from "@/ui/button";
import {
  PlusCircle,
  X,
  CheckCircle,
  Circle,
  Calendar,
  Trash2,
  ArrowRight,
  Edit,
} from "lucide-react";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/ui/calendar";
import { uploadAnnotation } from "@/services/storageService";
import { DialogImageEditor, DrawingElement } from "./DialogImageEditor";

// Liste des lots disponibles
const LOTS = [
  "Gros œuvre",
  "Charpente",
  "Couverture",
  "Menuiserie ext.",
  "Menuiserie int.",
  "Plomberie",
  "Électricité",
  "Peinture",
  "Carrelage",
  "Isolation",
  "VRD",
  "Autre",
];

// Liste des localisations courantes
const LOCATIONS = [
  "Cuisine",
  "Salon",
  "Chambre 1",
  "Chambre 2",
  "Chambre 3",
  "Salle de bain",
  "WC",
  "Entrée",
  "Couloir",
  "Escalier",
  "Extérieur",
  "Toiture",
  "Façade",
  "Autre",
];

function formatDate(dateString: string): string {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";

    return format(date, "dd MMMM yyyy", { locale: fr });
  } catch (error) {
    return "Erreur de date";
  }
}

// Fonction pour convertir un fichier en dataURL
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(new Error("Erreur lors de la lecture du fichier"));
    reader.readAsDataURL(file);
  });
};

interface AnnotationDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedAnnotation: Annotation | null;
  onToggleResolved: (id: string, resolved?: boolean) => void;
  onUpdateAnnotation?: (
    annotationId: string,
    updatedData: Partial<Annotation>
  ) => Promise<boolean> | void;
  onAddPhoto: (id: string, photoUrl: string) => void;
  onRemovePhoto: (id: string, photoIndex: number) => void;
  onUpdateComment: (id: string, comment: string) => void;
  onConvertToTask?: () => void;
  onDeleteAnnotation?: (annotation: Annotation) => void;
  projectId?: string;
}

export const AnnotationDialog: React.FC<AnnotationDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedAnnotation,
  onToggleResolved,
  onUpdateAnnotation,
  onAddPhoto,
  onRemovePhoto,
  onUpdateComment,
  onConvertToTask,
  onDeleteAnnotation,
  projectId: propProjectId,
}) => {
  const [comment, setComment] = useState("");
  const [lot, setLot] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [resolvedDate, setResolvedDate] = useState<Date | undefined>(undefined);
  const [currentPhotoToEdit, setCurrentPhotoToEdit] = useState<string | null>(
    null
  );
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [imageDrawings, setImageDrawings] = useState<
    Record<string, DrawingElement[]>
  >({});
  const [forceUpdate, setForceUpdate] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false); // État pour contrôler l'affichage du calendrier
  const { id: urlProjectId } = useParams<{ id: string }>();
  const projectId = propProjectId || urlProjectId || "";
  const dialogRef = useRef<HTMLDivElement>(null); // Ajoutez cette référence

  useEffect(() => {
    if (selectedAnnotation) {
      setComment(selectedAnnotation.comment || "");
      setLot(selectedAnnotation.lot || "");
      setLocation(selectedAnnotation.location || "");
      setResolvedDate(
        selectedAnnotation.resolvedDate
          ? new Date(selectedAnnotation.resolvedDate)
          : undefined
      );
    } else {
      setComment("");
      setLot("");
      setLocation("");
      setResolvedDate(undefined);
    }
  }, [selectedAnnotation, isOpen]);

  // Forcer le rafraîchissement des photos après modification
  useEffect(() => {
    if (selectedAnnotation && selectedAnnotation.photos) {
      // Créer un nouvel objet pour déclencher un re-rendu
      const updatedPhotos = [...selectedAnnotation.photos];
      setForceUpdate((prev) => !prev); // Utiliser un état supplémentaire pour forcer le re-rendu
    }
  }, [selectedAnnotation?.photos]);

  const handleResolved = () => {
    if (selectedAnnotation) {
      const newResolvedState = !(
        selectedAnnotation.resolved || selectedAnnotation.isResolved
      );
      onToggleResolved(selectedAnnotation.id, newResolvedState);

      // Si on marque comme résolu, définir la date à aujourd'hui
      if (newResolvedState) {
        const today = new Date();
        setResolvedDate(today);
        if (onUpdateAnnotation) {
          onUpdateAnnotation(selectedAnnotation.id, {
            resolvedDate: today.toISOString(),
          });
        }
      } else if (onUpdateAnnotation) {
        // Si on marque comme non résolu, optionnellement effacer la date de résolution
        setResolvedDate(undefined);
        onUpdateAnnotation(selectedAnnotation.id, { resolvedDate: undefined });
      }
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const handleLotChange = (value: string) => {
    setLot(value);
    if (selectedAnnotation && onUpdateAnnotation) {
      onUpdateAnnotation(selectedAnnotation.id, { lot: value });
    }
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    if (selectedAnnotation && onUpdateAnnotation) {
      onUpdateAnnotation(selectedAnnotation.id, { location: value });
    }
  };

  // Modifiez la fonction handleResolvedDateChange pour ne pas changer automatiquement le statut resolved
  const handleResolvedDateChange = (date: Date | undefined) => {
    setResolvedDate(date);
    if (selectedAnnotation && onUpdateAnnotation) {
      // Ne changez que la date sans modifier le statut resolved
      onUpdateAnnotation(selectedAnnotation.id, {
        resolvedDate: date ? date.toISOString() : undefined,
        // Ne pas modifier le statut resolved ici
        // Supprimez ou commentez les lignes suivantes :
        // resolved: !!date,
        // isResolved: !!date
      });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedAnnotation) return;

    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner une image");
        return;
      }

      const dataUrl = await fileToDataUrl(file);
      handleAddPhoto(dataUrl);
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'image:", error);
    }
  };

  const handleAddPhoto = async (photoData) => {
    if (!selectedAnnotation) return;

    try {
      // Si c'est une base64, l'uploader vers Supabase
      let photoUrl = photoData;
      if (photoData.startsWith("data:")) {
        photoUrl = await uploadAnnotation(photoData, projectId);
      }

      // Ajouter la photo avec l'URL au lieu du base64
      onAddPhoto(selectedAnnotation.id, photoUrl);
    } catch (error) {
      console.error("Erreur lors de l'upload de la photo:", error);
      toast.error("Erreur lors de l'upload de la photo");
    }
  };

  const handleSaveComment = () => {
    if (selectedAnnotation) {
      onUpdateComment(selectedAnnotation.id, comment);
    }
  };

  // Fonction pour éditer une photo
  const handleEditPhoto = (photoUrl: string) => {
    setCurrentPhotoToEdit(photoUrl);
    setIsImageEditorOpen(true);
  };

  // Fonction pour sauvegarder l'image éditée
  const handleSaveEditedImage = async (
    editedImageUrl: string,
    drawings: DrawingElement[] = []
  ) => {
    if (!currentPhotoToEdit || !selectedAnnotation) return;

    try {
      // Sauvegarder les dessins pour pouvoir les modifier plus tard
      setImageDrawings({
        ...imageDrawings,
        [editedImageUrl]: drawings,
      });

      // Vérifier si l'image a été modifiée (si c'est une data URL)
      let finalImageUrl = editedImageUrl;
      if (editedImageUrl.startsWith("data:")) {
        // Uploader la nouvelle version de l'image
        finalImageUrl = await uploadAnnotation(editedImageUrl, projectId);
        console.log("Image modifiée uploadée:", finalImageUrl);
      }

      // Mettre à jour les photos
      const updatedPhotos =
        selectedAnnotation.photos?.map((photo) =>
          photo === currentPhotoToEdit ? finalImageUrl : photo
        ) || [];

      console.log("Photos mises à jour:", updatedPhotos);

      if (onUpdateAnnotation) {
        await onUpdateAnnotation(selectedAnnotation.id, {
          photos: updatedPhotos,
        });
        // Forcer une mise à jour de l'interface
        setForceUpdate((prev) => !prev);
      }

      setCurrentPhotoToEdit(null);
      setIsImageEditorOpen(false);

      // Ajouter un message de confirmation
      toast.success("Image modifiée avec succès");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'image éditée:", error);
      toast.error("Erreur lors de l'enregistrement de l'image modifiée");
    }
  };

  const renderContent = () => {
    if (!selectedAnnotation) {
      return <div className="p-4">Aucune annotation sélectionnée</div>;
    }

    const isResolved =
      selectedAnnotation.resolved || selectedAnnotation.isResolved;

    return (
      <div className="space-y-4">
        <div className="px-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Créée le{" "}
              {formatDate(
                selectedAnnotation.createdAt || selectedAnnotation.date || ""
              )}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResolved}
              className={isResolved ? "text-green-600" : ""}>
              {isResolved ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Circle className="h-4 w-4 mr-2" />
              )}
              {isResolved ? "Résolu" : "À résoudre"}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lot">Lot concerné</Label>
              <Select value={lot} onValueChange={handleLotChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un lot" />
                </SelectTrigger>
                <SelectContent>
                  {LOTS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <Select value={location} onValueChange={handleLocationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une localisation" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Commentaire</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={handleCommentChange}
                onBlur={handleSaveComment}
                placeholder="Ajouter un commentaire..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Date de levée</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setShowCalendar(!showCalendar)}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {resolvedDate
                  ? format(resolvedDate, "dd MMMM yyyy", { locale: fr })
                  : "Choisir une date"}
              </Button>

              {showCalendar && (
                <div
                  className="absolute bg-white border rounded-md shadow-md p-1"
                  style={{ zIndex: 9999 }}
                >
                  <div className="flex justify-between mb-2">
                    <span>Sélectionner une date</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCalendar(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CalendarComponent
                    mode="single"
                    selected={resolvedDate}
                    onSelect={(date) => {
                      handleResolvedDateChange(date);
                      setShowCalendar(false);
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Photos</Label>
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label htmlFor="photo-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    asChild>
                    <span>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Ajouter
                    </span>
                  </Button>
                </label>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {selectedAnnotation.photos &&
                selectedAnnotation.photos.length > 0 ? (
                  selectedAnnotation.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-24 h-24 object-cover rounded border"
                      />
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        {/* Bouton d'édition */}
                        <Button
                          variant="secondary"
                          size="icon"
                          className="w-6 h-6"
                          onClick={() => handleEditPhoto(photo)}>
                          <Edit className="h-3 w-3" />
                        </Button>

                        {/* Bouton de suppression existant */}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="w-6 h-6"
                          onClick={() =>
                            selectedAnnotation &&
                            onRemovePhoto &&
                            onRemovePhoto(selectedAnnotation.id, index)
                          }>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Aucune photo
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          {onDeleteAnnotation && (
            <Button
              onClick={() => {
                if (selectedAnnotation && onDeleteAnnotation) {
                  console.log(
                    "Suppression de l'annotation depuis le dialog:",
                    selectedAnnotation
                  );
                  onDeleteAnnotation(selectedAnnotation);
                  setIsOpen(false);
                }
              }}
              variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          )}
          <div className="flex gap-2">
            {onConvertToTask && (
              <Button onClick={onConvertToTask} variant="outline">
                <ArrowRight className="h-4 w-4 mr-2" />
                Convertir en tâche
              </Button>
            )}
            <Button onClick={() => setIsOpen(false)}>Fermer</Button>
          </div>
        </div>

        {/* Dialogue d'édition d'image */}
        {currentPhotoToEdit && (
          <DialogImageEditor
            open={isImageEditorOpen}
            onClose={() => setIsImageEditorOpen(false)}
            imageUrl={currentPhotoToEdit}
            onSave={handleSaveEditedImage}
            existingDrawings={imageDrawings[currentPhotoToEdit] || []}
          />
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]" ref={dialogRef}>
        <DialogHeader>
          <DialogTitle>Annotation</DialogTitle>
          <DialogDescription>
            Détails de l'annotation et options de modification.
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};
