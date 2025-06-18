import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Textarea } from "@/ui/textarea";
import { Input } from "@/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { useToast } from "@/ui/use-toast";
import {
  Search,
  Plus,
  Import,
  Download,
  Pencil,
  Trash2,
  Copy,
  GripVertical,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import DescriptifHeader from "@/features/reports/components/DescriptifHeader";
import ReportFooter from "@/features/reports/components/ReportFooter";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePersistence } from "@/contexts/DataPersistenceContext";

// Modifier l'import pour utiliser l'interface existante
import {
  LotTravaux,
  ExtendedLotTravaux as ProjectExtendedLotTravaux,
} from "@ExtendedLotTravaux as ProjectExtendedLotTravaux,/types/project";
// Extension de l'interface ExtendedTask pour la compatibilité avec les travaux
interface ExtendedTaskCompatible {
  id: string;
  nom: string; // Pour l'interface cible
  name?: string; // Pour la compatibilité avec l'ancienne version
  description?: string;
  quantite?: number;
  unite?: string;
  prixUnitaire?: number; // Pour l'interface cible
  pu?: number; // Pour la compatibilité
  prixTotal?: number;
  tva?: number; // Non présent dans l'interface cible mais utilisé
  sortOrder?: number; // Pour la compatibilité
  startDate?: string; // Pour la compatibilité
  endDate?: string; // Pour la compatibilité
}
export type { ProjectExtendedLotTravaux };
// Type pour assurer la compatibilité lors de la conversion
interface CompatibleLotTravaux {
  id: string;
  numero: string;
  nom: string;
  travaux: ExtendedTaskCompatible[];
  name?: string;
  count?: number;
  sortOrder?: number;
  isExpanded?: boolean;
  tasks?: ExtendedTask[]; // Pour la compatibilité
}
// Étendre l'interface Task pour inclure les propriétés supplémentaires
export interface ExtendedTask {
  id: string;
  name: string;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
  quantite?: number;
  unite?: string;
  pu?: number;
  tva?: number;
}

// Renommer votre interface pour éviter les conflits
export interface ComponentExtendedLotTravaux {
  id: string;
  name: string;
  count?: number;
  sortOrder?: number;
  isExpanded?: boolean;
  tasks: ExtendedTask[];
}

// Types pour le descriptif détaillé
interface TravailItem {
  id: string;
  numero: string;
  description: string;
  localisation: string;
  quantite: number;
  unite: string;
  pu: number;
  tva: number;
  total?: number;
  startDate?: string;
  endDate?: string;
}

// Renommer pour éviter les conflits de nommage
interface DetailLot {
  id: string;
  numero: string;
  nom: string;
  travaux: TravailItem[];
}

// Types pour les données venant de LotManager
interface LotManagerTask {
  id: string;
  title: string;
  description?: string;
  status?: string;
  position: number;
}

interface LotManagerLot {
  id: string;
  title: string;
  position: number;
  tasks: LotManagerTask[];
}

interface DescriptifDetailTabProps {
  projectId: string;
  onDataUpdate?: (data: ProjectExtendedLotTravaux[]) => void; // Changez le type ici
  initialData?: ProjectExtendedLotTravaux[]; // Et ici aussi
}

// Fonction pour extraire les métadonnées des données
function extractMetadata(data: ProjectExtendedLotTravaux[]): {
  description: string;
} {
  // Valeurs par défaut
  const defaultData = {
    description:
      "Description du projet\n\nCeci est un projet de rénovation d'un appartement situé au 42 rue de la République, 75011 Paris.\n\nLe projet est divisé en plusieurs lots, chacun correspondant à une étape de la rénovation.\n\n\n\n",
  };

  // Si pas de données ou tableau vide, renvoyer les valeurs par défaut
  if (!data || !Array.isArray(data) || data.length === 0) {
    return defaultData;
  }

  // Extraire les métadonnées du premier lot
  const firstLot = data[0];
  if (!firstLot.metadata) {
    return defaultData;
  }

  return {
    description: firstLot.metadata.description || defaultData.description,
  };
}

// Fonction de conversion vers le format projet - CORRIGÉE
function convertToProjectFormat(
  detailLots: DetailLot[],
  description?: string
): ProjectExtendedLotTravaux[] {
  // Créer le tableau avec les objets de base
  const result = detailLots.map((lot) => {
    const lotObj: Omit<ProjectExtendedLotTravaux, "metadata"> = {
      id: lot.id,
      numero: lot.numero,
      nom: lot.nom,
      travaux: lot.travaux.map((travail) => ({
        id: travail.id,
        nom: travail.description,
        description: travail.description,
        quantite: travail.quantite,
        unite: travail.unite,
        prixUnitaire: travail.pu,
        prixTotal: travail.quantite * travail.pu,
        localisation: travail.localisation, // Conservez la localisation au niveau du travail
      })),
      name: lot.nom,
      count: lot.travaux.length,
      sortOrder: parseInt(lot.numero) || 0,
      isExpanded: false,
    };
    return lotObj;
  });

  // Ajouter uniquement la description dans les métadonnées
  if (result.length > 0) {
    (result[0] as ProjectExtendedLotTravaux).metadata = {
      description: description || "",
    };
  }

  return result as ProjectExtendedLotTravaux[];
}

// Fonction de conversion depuis le format projet
function convertFromProjectFormat(
  projectLots: ProjectExtendedLotTravaux[]
): DetailLot[] {
  // Vérifier si projectLots est défini
  if (!projectLots || !Array.isArray(projectLots)) {
    console.warn("Données de lot invalides ou manquantes", projectLots);
    return [];
  }

  // Convertir les données
  const convertedLots = projectLots
    .map((lot, lotIndex) => {
      // Vérifier si lot est un objet valide
      if (!lot) {
        console.warn("Lot invalide trouvé à l'index", lotIndex);
        return null;
      }

      // Le numéro du lot est conservé pour le moment, sera réordonné par renumberAllLots
      const lotNumber = lot.numero || `${lotIndex + 1}`;

      // Vérifier les différentes structures de données possibles
      const travauxArray =
        lot.travaux || (lot as CompatibleLotTravaux).tasks || [];

      return {
        id: lot.id || `lot-${Date.now()}-${lotIndex}`,
        numero: lotNumber,
        nom: lot.nom || lot.name || `Lot ${lotNumber}`,
        travaux: travauxArray.map((travail, taskIndex) => {
          // Le numéro de chaque tâche est "numéroLot.indexTâche+1" temporairement
          return {
            id: travail.id || `trav-${Date.now()}-${lotIndex}-${taskIndex}`,
            numero: `${lotNumber}.${taskIndex + 1}`,
            description:
              travail.nom || travail.description || travail.name || "",
            localisation: travail.localisation || "",
            quantite: travail.quantite || 1,
            unite: travail.unite || "ens",
            pu: travail.prixUnitaire || travail.pu || 0,
            tva: travail.tva || 10,
          };
        }),
      };
    })
    .filter(Boolean) as DetailLot[];

  // CORRECTION : Ajouter le retour manquant
  return convertedLots;
}

// Fonction de renumérotation des lots et travaux
const renumberAllLots = (lots: DetailLot[]): DetailLot[] => {
  // Vérification défensive
  if (!lots || !Array.isArray(lots)) {
    console.warn("Données de lot invalides dans renumberAllLots", lots);
    return [];
  }

  return lots.map((lot, lotIndex) => {
    const lotNumber = lotIndex + 1;
    return {
      ...lot,
      numero: `${lotNumber}`,
      // Vérifier que travaux est un tableau avant d'appeler map
      travaux: Array.isArray(lot.travaux)
        ? lot.travaux.map((travail, travailIndex) => {
            const travailNumber = travailIndex + 1;
            return {
              ...travail,
              numero: `${lotNumber}.${travailNumber}`,
            };
          })
        : [],
    };
  });
};

// Composant pour une tâche drag and drop
function SortableTravail({
  travail,
  lotId,
  handleEditTravail,
  handleDuplicateTravail,
  handleDeleteTravail,
  handleQuantiteChange,
  handlePUChange,
  handleTVAChange,
  handleUniteChange,
  handleLocalisationChange,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: travail.id,
    data: { type: "travail", lotId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 999 : "auto",
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="transition-colors hover:bg-slate-50">
      <TableCell className="font-medium">
        <div className="flex items-center">
          <div {...attributes} {...listeners} className="cursor-grab mr-2">
            <GripVertical size={16} className="text-gray-400" />
          </div>
          {travail.numero}
        </div>
      </TableCell>

      {/* Un seul champ localisation */}
      <TableCell>
        <Input
          type="text"
          value={travail.localisation || ""}
          onChange={(e) =>
            handleLocalisationChange(lotId, travail.id, e.target.value)
          }
          placeholder="Localisation"
          className="w-[120px]"
        />
      </TableCell>

      <TableCell>
        <div className="font-medium">{travail.description}</div>
      </TableCell>

      <TableCell className="text-center">
        <Input
          type="number"
          value={travail.quantite}
          onChange={(e) =>
            handleQuantiteChange(lotId, travail.id, Number(e.target.value))
          }
          className="w-20 no-spinner text-center mx-auto"
        />
      </TableCell>
      <TableCell className="text-center">
        <Select
          value={travail.unite}
          onValueChange={(value) =>
            handleUniteChange(lotId, travail.id, value)
          }>
          <SelectTrigger className="w-20 mx-auto">
            <SelectValue placeholder="Unité" />
          </SelectTrigger>
          <SelectContent>
            {unites.map((unite) => (
              <SelectItem key={unite} value={unite}>
                {unite}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center">
          <Input
            type="number"
            value={travail.pu}
            onChange={(e) =>
              handlePUChange(lotId, travail.id, Number(e.target.value))
            }
            className="w-20 no-spinner text-right"
          />
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center">
          <Input
            type="number"
            value={travail.tva}
            onChange={(e) =>
              handleTVAChange(lotId, travail.id, Number(e.target.value))
            }
            className="w-12 no-spinner"
          />
        </div>
      </TableCell>
      <TableCell className="text-right font-medium">
        {(travail.quantite * travail.pu).toFixed(2)} €
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEditTravail(lotId, travail)}>
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDuplicateTravail(lotId, travail)}>
              <Copy className="h-4 w-4 mr-2" />
              Dupliquer
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeleteTravail(lotId, travail.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

// Composant pour un lot drag and drop
function SortableLot({
  lot,
  children,
  handleEditLot,
  handleDuplicateLot,
  handleDeleteLot,
  handleAddTravail,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lot.id,
    data: { type: "lot" },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    zIndex: isDragging ? 999 : "auto",
    marginBottom: "2rem",
  };

  const calculateLotTotal = () => {
    return lot.travaux.reduce(
      (sum, travail) => sum + travail.quantite * travail.pu,
      0
    );
  };

  return (
    <Card ref={setNodeRef} style={style}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div
            {...attributes}
            {...listeners}
            className="flex items-center cursor-grab">
            <GripVertical size={16} className="text-gray-400 mr-2" />
            <CardTitle>
              Lot {lot.numero}: {lot.nom}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddTravail(lot.id)}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter travail
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditLot(lot.id)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDuplicateLot(lot.id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Dupliquer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteLot(lot.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[8%] text-center">N°</TableHead>
              <TableHead className="w-[12%] text-center">
                Localisation
              </TableHead>
              <TableHead className="w-[35%]">Description</TableHead>
              <TableHead className="w-[8%] text-center">Qté</TableHead>
              <TableHead className="w-[8%] text-center">Unité</TableHead>

              <TableHead className="w-[10%] text-center">P.U. HT</TableHead>
              <TableHead className="w-[6%] text-center">TVA</TableHead>
              <TableHead className="w-[10%] text-right">Total HT</TableHead>
              <TableHead className="w-[5%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{children}</TableBody>
        </Table>
        <div className="flex justify-end mt-4 font-medium">
          Total lot: {calculateLotTotal().toFixed(2)} €
        </div>
      </CardContent>
    </Card>
  );
}

const unites = ["ens", "U", "ml", "m2", "m3", "h", "j", "kg", "t"];

export const DescriptifDetailTab = ({
  projectId,
  onDataUpdate,
  initialData = [],
}: DescriptifDetailTabProps) => {
  const { toast } = useToast();
  // Utiliser le hook ici à l'intérieur du composant, pas au niveau du module
  const { saveTableData, getTableData } = usePersistence();

  const tableContainerRef = useRef(null);

  const [detailLots, setDetailLots] = useState<DetailLot[]>(() => {
    try {
      // Convertir les données initiales
      const convertedData = initialData
        ? convertFromProjectFormat(initialData)
        : [];
      // Appliquer la renumérotation pour s'assurer que les lots ont des numéros séquentiels
      return renumberAllLots(convertedData);
    } catch (error) {
      console.error("Erreur lors de l'initialisation des données:", error);
      return [];
    }
  });

  // Ajouter cet état avec les autres états du composant
  const [projectDescription, setProjectDescription] = useState<string>(
    ""
  );

  // Ajouter ce gestionnaire avec les autres gestionnaires
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newDescription = e.target.value;
    setProjectDescription(newDescription);
  };

  // Ajouter ce useEffect pour vérifier la numérotation des lots après chargement
  useEffect(() => {
    // Vérifier si la numérotation est correcte après chargement des données
    const hasIncorrectNumbering = detailLots.some(
      (lot, index) => lot.numero !== `${index + 1}`
    );

    // Si la numérotation est incorrecte, forcer une renumérotation
    if (hasIncorrectNumbering && detailLots.length > 0) {
      console.log("Correction de la numérotation des lots après chargement");
      setDetailLots(renumberAllLots(detailLots));
    }
  }, []);

  // Ajouter un flag pour suivre le chargement initial
  const initialLoadDoneRef = useRef<boolean>(false);

  // Modifier l'effet de chargement pour éviter les conflits
  useEffect(() => {
    const savedData = getTableData(projectId, "descriptif");
    if (savedData && Array.isArray(savedData) && !initialLoadDoneRef.current) {
      try {
        // Extraire les métadonnées
        const metadata = extractMetadata(
          savedData as ProjectExtendedLotTravaux[]
        );

        // Mettre à jour les états en une seule fois
        const convertedLots = convertFromProjectFormat(
          savedData as ProjectExtendedLotTravaux[]
        );

        // Utiliser une fonction de mise à jour d'état pour éviter les problèmes de timing
        setDetailLots(convertedLots);
        setProjectDescription(metadata.description);

        // Mettre à jour les références pour éviter les sauvegardes inutiles
        prevDetailLotsRef.current = JSON.stringify(convertedLots);
        prevDescriptionRef.current = JSON.stringify(metadata.description);

        // Marquer le chargement initial comme terminé
        initialLoadDoneRef.current = true;
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    }
  }, [projectId, getTableData]);

  // Ajouter ces références pour éviter les sauvegardes inutiles
  const prevDetailLotsRef = useRef<string>("");
  const prevDescriptionRef = useRef<string>("");

  // Ajouter une référence pour le timeout de debounce
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Modifier l'effet de sauvegarde avec un debounce
  useEffect(() => {
    // Éviter les calculs inutiles si les données sont vides
    if (detailLots.length === 0 && !projectDescription) {
      return;
    }

    // Annuler tout timeout précédent
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Créer un nouveau timeout (debounce de 500ms)
    saveTimeoutRef.current = setTimeout(() => {
      const currentDetailLotsJSON = JSON.stringify(detailLots);
      const currentDescriptionJSON = JSON.stringify(projectDescription);

      const dataChanged =
        currentDetailLotsJSON !== prevDetailLotsRef.current ||
        currentDescriptionJSON !== prevDescriptionRef.current;

      if (dataChanged) {
        console.log("Sauvegarde des données");
        prevDetailLotsRef.current = currentDetailLotsJSON;
        prevDescriptionRef.current = currentDescriptionJSON;

        // Convertir avec les données
        const projectFormatData = convertToProjectFormat(
          detailLots,
          projectDescription
        );

        // Sauvegarde effective des données
        saveTableData(projectId, "descriptif", projectFormatData);

        // Informer le parent
        if (onDataUpdate) {
          onDataUpdate(projectFormatData);
        }
      }
    }, 500); // Attendre 500ms avant de sauvegarder

    // Cleanup function
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    detailLots,
    projectDescription,
    projectId,
    saveTableData,
    onDataUpdate,
  ]);

  useEffect(() => {
    // Initialiser les références pour éviter les comparaisons avec undefined
    prevDetailLotsRef.current = JSON.stringify(detailLots);
    prevDescriptionRef.current = JSON.stringify(projectDescription);
  }, []); // Une seule fois au montage

  const [lotManagerData, setLotManagerData] = useState<LotManagerLot[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editTravauxOpen, setEditTravauxOpen] = useState(false);
  const [editLotOpen, setEditLotOpen] = useState(false);
  const [selectedLots, setSelectedLots] = useState<Record<string, boolean>>({});
  const [selectedTasks, setSelectedTasks] = useState<Record<string, boolean>>(
    {}
  );
  const [currentTravail, setCurrentTravail] = useState<TravailItem | null>(
    null
  );
  const [currentLotId, setCurrentLotId] = useState<string | null>(null);
  const [currentLot, setCurrentLot] = useState<DetailLot | null>(null);
  const [activeDragItem, setActiveDragItem] = useState(null);

  const [newTravail, setNewTravail] = useState<Partial<TravailItem>>({
    description: "",
    localisation: "", // Ajouté
    quantite: 1,
    unite: "ens",
    pu: 0,
    tva: 10,
  });

  const [newLot, setNewLot] = useState<Partial<DetailLot>>({
    nom: "",
    numero: "",
  });

  // Configuration des capteurs pour le drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Récupérer les données de LotManager
  useEffect(() => {
    const loadLotManagerData = async () => {
      try {
        // Dans un environnement réel, récupérez les données depuis votre API
        // const data = await fetchLots(projectId);
        // Données simulées pour la démo
        const data: LotManagerLot[] = [
          {
            id: "lm-1",
            title: "Electricité / Eclairage",
            position: 1,
            tasks: [
              {
                id: "lmt-1",
                title: "Installation prises électriques",
                position: 1,
              },
              { id: "lmt-2", title: "Installation luminaires", position: 2 },
              { id: "lmt-3", title: "Tableau électrique", position: 3 },
            ],
          },
          {
            id: "lm-2",
            title: "Plomberie",
            position: 2,
            tasks: [
              { id: "lmt-4", title: "Installation sanitaires", position: 1 },
              {
                id: "lmt-5",
                title: "Tuyauterie eau chaude/froide",
                position: 2,
              },
            ],
          },
          {
            id: "lm-3",
            title: "Menuiserie",
            position: 3,
            tasks: [
              { id: "lmt-6", title: "Pose portes intérieures", position: 1 },
              { id: "lmt-7", title: "Installation placards", position: 2 },
            ],
          },
        ];
        setLotManagerData(data);
      } catch (error) {
        console.error("Erreur lors du chargement des lots:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les lots et tâches.",
          variant: "destructive",
        });
      }
    };

    loadLotManagerData();
  }, [projectId]);

  const calculateTotal = (travail: TravailItem) => {
    return travail.quantite * travail.pu;
  };

  const calculateLotTotal = (lot: DetailLot) => {
    return lot.travaux.reduce(
      (sum, travail) => sum + calculateTotal(travail),
      0
    );
  };

  const calculateTotalHT = () => {
    return detailLots.reduce((sum, lot) => sum + calculateLotTotal(lot), 0);
  };

  const handleQuantiteChange = (
    lotId: string,
    travailId: string,
    value: number
  ) => {
    setDetailLots(
      detailLots.map((lot) => {
        if (lot.id === lotId) {
          return {
            ...lot,
            travaux: lot.travaux.map((travail) => {
              if (travail.id === travailId) {
                return { ...travail, quantite: value };
              }
              return travail;
            }),
          };
        }
        return lot;
      })
    );
  };

  const handleUniteChange = (
    lotId: string,
    travailId: string,
    value: string
  ) => {
    setDetailLots(
      detailLots.map((lot) => {
        if (lot.id === lotId) {
          return {
            ...lot,
            travaux: lot.travaux.map((travail) => {
              if (travail.id === travailId) {
                return { ...travail, unite: value };
              }
              return travail;
            }),
          };
        }
        return lot;
      })
    );
  };

  const handlePUChange = (lotId: string, travailId: string, value: number) => {
    setDetailLots(
      detailLots.map((lot) => {
        if (lot.id === lotId) {
          return {
            ...lot,
            travaux: lot.travaux.map((travail) => {
              if (travail.id === travailId) {
                return { ...travail, pu: value };
              }
              return travail;
            }),
          };
        }
        return lot;
      })
    );
  };

  const handleTVAChange = (lotId: string, travailId: string, value: number) => {
    setDetailLots(
      detailLots.map((lot) => {
        if (lot.id === lotId) {
          return {
            ...lot,
            travaux: lot.travaux.map((travail) => {
              if (travail.id === travailId) {
                return { ...travail, tva: value };
              }
              return travail;
            }),
          };
        }
        return lot;
      })
    );
  };

  // Version simplifiée de handleLocalisationChange qui accepte directement la valeur texte
  const handleLocalisationChange = (
    lotId: string,
    travailId: string,
    value: string
  ) => {
    setDetailLots(prevLots =>
      prevLots.map(lot => {
        if (lot.id === lotId) {
          return {
            ...lot,
            travaux: lot.travaux.map(travail => {
              if (travail.id === travailId) {
                return { ...travail, localisation: value };
              }
              return travail;
            }),
          };
        }
        return lot;
      })
    );
  };

  const handleEditTravail = (lotId: string, travail: TravailItem) => {
    setCurrentLotId(lotId);
    setCurrentTravail(travail);
    setNewTravail({
      description: travail.description,
      localisation: travail.localisation, // Ajouté
      quantite: travail.quantite,
      unite: travail.unite,
      pu: travail.pu,
      tva: travail.tva,
    });
    setEditTravauxOpen(true);
  };

  const handleDuplicateTravail = (lotId: string, travail: TravailItem) => {
    const lotIndex = detailLots.findIndex((lot) => lot.id === lotId);
    if (lotIndex === -1) return;

    const lot = { ...detailLots[lotIndex] };
    const nextTaskIndex = lot.travaux.length + 1;
    const newTravailId = `trav-${Date.now()}`;

    const duplicatedTravail = {
      ...travail,
      id: newTravailId,
      numero: `${lot.numero}.${nextTaskIndex}`,
      description: `${travail.description} (copie)`,
    };

    const updatedLots = [...detailLots];
    updatedLots[lotIndex] = {
      ...lot,
      travaux: [...lot.travaux, duplicatedTravail],
    };

    setDetailLots(updatedLots);

    toast({
      title: "Succès",
      description: "Travail dupliqué avec succès",
    });
  };

  const handleEditLot = (lotId: string) => {
    const lot = detailLots.find((l) => l.id === lotId);
    if (lot) {
      setCurrentLot(lot);
      setNewLot({
        nom: lot.nom,
        numero: lot.numero,
      });
      setEditLotOpen(true);
    }
  };

  const handleDuplicateLot = (lotId: string) => {
    const lot = detailLots.find((l) => l.id === lotId);
    if (!lot) return;

    const newLotNumber = detailLots.length + 1;
    const newLotId = `lot-${Date.now()}`;

    const duplicatedLot: DetailLot = {
      id: newLotId,
      numero: `${newLotNumber}`,
      nom: `${lot.nom} (copie)`,
      travaux: lot.travaux.map((travail, index) => ({
        ...travail,
        id: `trav-${newLotId}-${index}`,
        numero: `${newLotNumber}.${index + 1}`,
      })),
    };

    setDetailLots([...detailLots, duplicatedLot]);

    toast({
      title: "Succès",
      description: "Lot dupliqué avec succès",
    });
  };

  const handleDeleteLot = (lotId: string) => {
    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce lot et toutes ses tâches ?"
    );
    if (!confirmDelete) return;

    const updatedLots = detailLots.filter((lot) => lot.id !== lotId);

    // Renuméroter les lots restants
    const renumberedLots = updatedLots.map((lot, index) => ({
      ...lot,
      numero: `${index + 1}`,
      travaux: lot.travaux.map((travail, taskIndex) => ({
        ...travail,
        numero: `${index + 1}.${taskIndex + 1}`,
      })),
    }));

    setDetailLots(renumberedLots);

    toast({
      title: "Succès",
      description: "Lot supprimé avec succès",
    });
  };

  const handleSaveLot = () => {
    if (!newLot.nom) {
      toast({
        title: "Erreur",
        description: "Le nom du lot est obligatoire",
        variant: "destructive",
      });
      return;
    }

    if (currentLot) {
      // Modification d'un lot existant
      setDetailLots(
        detailLots.map((lot) => {
          if (lot.id === currentLot.id) {
            return {
              ...lot,
              nom: newLot.nom!,
            };
          }
          return lot;
        })
      );

      toast({
        title: "Succès",
        description: "Lot modifié avec succès",
      });
    } else {
      // Création d'un nouveau lot
      const newLotNumber = detailLots.length + 1;
      const newLotId = `lot-${Date.now()}`;

      const newLotObj: DetailLot = {
        id: newLotId,
        numero: `${newLotNumber}`,
        nom: newLot.nom!,
        travaux: [],
      };

      setDetailLots(renumberAllLots([...detailLots, newLotObj]));

      toast({
        title: "Succès",
        description: "Nouveau lot ajouté",
      });
    }

    setEditLotOpen(false);
    setCurrentLot(null);
    setNewLot({
      nom: "",
      numero: "",
    });
  };

  const handleSaveTravail = () => {
    if (!currentLotId) {
      toast({
        title: "Erreur",
        description: "Lot non spécifié",
        variant: "destructive",
      });
      return;
    }

    if (!newTravail.description) {
      toast({
        title: "Erreur",
        description: "La description est obligatoire",
        variant: "destructive",
      });
      return;
    }

    const lotIndex = detailLots.findIndex((lot) => lot.id === currentLotId);
    if (lotIndex === -1) {
      toast({
        title: "Erreur",
        description: "Lot introuvable",
        variant: "destructive",
      });
      return;
    }

    const updatedLots = [...detailLots];
    const lot = { ...updatedLots[lotIndex] };

    if (currentTravail) {
      // Modification d'un travail existant
      const travailIndex = lot.travaux.findIndex(
        (t) => t.id === currentTravail.id
      );
      if (travailIndex !== -1) {
        lot.travaux[travailIndex] = {
          ...lot.travaux[travailIndex],
          description: newTravail.description!,
          localisation: newTravail.localisation!, // Ajouté
          quantite: newTravail.quantite!,
          unite: newTravail.unite!,
          pu: newTravail.pu!,
          tva: newTravail.tva!,
        };
      }
    } else {
      // Ajout d'un nouveau travail
      const travaux = [...lot.travaux];
      const nextTaskIndex = travaux.length + 1;
      const newNumero = `${lot.numero}.${nextTaskIndex}`; // Format correct "1.1", "1.2", etc.

      travaux.push({
        id: `trav-${Date.now()}`, // L'ID reste unique grâce au timestamp
        numero: newNumero, // Mais le numéro visible suit le format correct
        description: newTravail.description!,
        localisation: newTravail.localisation!, // Ajouté
        quantite: newTravail.quantite!,
        unite: newTravail.unite!,
        pu: newTravail.pu!,
        tva: newTravail.tva!,
      });

      lot.travaux = travaux;
    }

    updatedLots[lotIndex] = lot;
    setDetailLots(updatedLots);
    setEditTravauxOpen(false);

    if (currentTravail) {
      toast({
        title: "Succès",
        description: "Travail modifié avec succès",
      });
    } else {
      toast({
        title: "Succès",
        description: "Travail ajouté avec succès",
      });
    }
  };

  const handleDeleteTravail = (lotId: string, travailId: string) => {
    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce travail ?"
    );
    if (!confirmDelete) return;

    const lotIndex = detailLots.findIndex((lot) => lot.id === lotId);
    if (lotIndex === -1) return;

    const lot = detailLots[lotIndex];
    const updatedTravaux = lot.travaux.filter((t) => t.id !== travailId);

    // Renuméroter les tâches
    const renumberedTravaux = updatedTravaux.map((travail, index) => ({
      ...travail,
      numero: `${lot.numero}.${index + 1}`,
    }));

    const updatedLots = [...detailLots];
    updatedLots[lotIndex] = {
      ...lot,
      travaux: renumberedTravaux,
    };

    setDetailLots(updatedLots);

    toast({
      title: "Succès",
      description: "Travail supprimé avec succès",
    });
  };

  const handleAddTravail = (lotId: string) => {
    setCurrentLotId(lotId);
    setCurrentTravail(null);
    setNewTravail({
      description: "",
      localisation: "", // Ajouté
      quantite: 1,
      unite: "ens",
      pu: 0,
      tva: 10,
    });
    setEditTravauxOpen(true);
  };

  const handleAddLot = () => {
    setCurrentLot(null);
    setNewLot({
      nom: "",
      numero: "",
    });
    setEditLotOpen(true);
  };

  // Gestion du drag & drop des lots
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (!active) return;

    // Sauvegarder l'élément actif pour l'afficher pendant le drag
    const { id, data } = active;

    if (data?.current?.type === "lot") {
      const draggedLot = detailLots.find((lot) => lot.id === id);
      if (draggedLot) {
        setActiveDragItem({
          type: "lot",
          item: draggedLot,
        });
      }
    } else if (data?.current?.type === "travail") {
      const lotId = data.current.lotId;
      const lot = detailLots.find((lot) => lot.id === lotId);
      const travail = lot?.travaux.find((t) => t.id === id);

      if (travail) {
        setActiveDragItem({
          type: "travail",
          item: travail,
          lotId,
        });
      }
    }
  };

  // Gestion du drag & drop des lots et travaux
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;
    const activeData = active.data.current;
    const overData = over.data.current;

    // Réorganisation des lots
    if (activeData?.type === "lot" && overData?.type === "lot") {
      const oldIndex = detailLots.findIndex((lot) => lot.id === activeId);
      const newIndex = detailLots.findIndex((lot) => lot.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedLots = arrayMove(detailLots, oldIndex, newIndex);

        // Renuméroter les lots et leurs tâches
        const renumberedLots = reorderedLots.map((lot, index) => ({
          ...lot,
          numero: `${index + 1}`,
          travaux: lot.travaux.map((travail) => ({
            ...travail,
            numero: `${index + 1}.${travail.numero.split(".")[1]}`,
          })),
        }));

        setDetailLots(renumberedLots);
      }
    }
    // Réorganisation des tâches à l'intérieur d'un même lot
    else if (activeData?.type === "travail" && overData?.type === "travail") {
      const activeLotId = activeData.lotId;
      const overLotId = overData.lotId;

      // Si les tâches sont dans le même lot
      if (activeLotId === overLotId) {
        const lotIndex = detailLots.findIndex((lot) => lot.id === activeLotId);
        if (lotIndex === -1) return;

        const lot = detailLots[lotIndex];
        const oldIndex = lot.travaux.findIndex((t) => t.id === activeId);
        const newIndex = lot.travaux.findIndex((t) => t.id === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedTravaux = arrayMove(lot.travaux, oldIndex, newIndex);

          // Renuméroter les tâches
          const renumberedTravaux = reorderedTravaux.map((travail, index) => ({
            ...travail,
            numero: `${lot.numero}.${index + 1}`,
          }));

          const updatedLots = [...detailLots];
          updatedLots[lotIndex] = {
            ...lot,
            travaux: renumberedTravaux,
          };

          setDetailLots(updatedLots);
        }
      }
      // Si les tâches sont dans des lots différents (déplacement entre lots)
      else {
        const sourceLotIndex = detailLots.findIndex(
          (lot) => lot.id === activeLotId
        );
        const targetLotIndex = detailLots.findIndex(
          (lot) => lot.id === overLotId
        );

        if (sourceLotIndex !== -1 && targetLotIndex !== -1) {
          const sourceLot = detailLots[sourceLotIndex];
          const targetLot = detailLots[targetLotIndex];

          const taskToMove = sourceLot.travaux.find((t) => t.id === activeId);
          if (!taskToMove) return;

          // Supprimer la tâche de son lot d'origine
          const updatedSourceTravaux = sourceLot.travaux.filter(
            (t) => t.id !== activeId
          );

          // Ajouter la tâche au lot cible
          const targetTravaux = [...targetLot.travaux];
          const insertIndex = targetLot.travaux.findIndex(
            (t) => t.id === overId
          );

          if (insertIndex !== -1) {
            targetTravaux.splice(insertIndex, 0, {
              ...taskToMove,
              numero: `${targetLot.numero}.${insertIndex + 1}`,
            });
          } else {
            targetTravaux.push({
              ...taskToMove,
              numero: `${targetLot.numero}.${targetTravaux.length + 1}`,
            });
          }

          // Renuméroter les tâches dans les deux lots
          const renumberedSourceTravaux = updatedSourceTravaux.map(
            (travail, index) => ({
              ...travail,
              numero: `${sourceLot.numero}.${index + 1}`,
            })
          );

          const renumberedTargetTravaux = targetTravaux.map(
            (travail, index) => ({
              ...travail,
              numero: `${targetLot.numero}.${index + 1}`,
            })
          );

          const updatedLots = [...detailLots];
          updatedLots[sourceLotIndex] = {
            ...sourceLot,
            travaux: renumberedSourceTravaux,
          };
          updatedLots[targetLotIndex] = {
            ...targetLot,
            travaux: renumberedTargetTravaux,
          };

          setDetailLots(updatedLots);
        }
      }
    }
  };

  // Gestion de la sélection dans le tableau d'importation
  const toggleSelectLot = (lotId: string) => {
    const newSelectedLots = { ...selectedLots };
    newSelectedLots[lotId] = !newSelectedLots[lotId];

    // Sélectionner/désélectionner toutes les tâches du lot
    const newSelectedTasks = { ...selectedTasks };
    const lot = lotManagerData.find((l) => l.id === lotId);
    if (lot) {
      lot.tasks.forEach((task) => {
        newSelectedTasks[task.id] = newSelectedLots[lotId];
      });
    }

    setSelectedLots(newSelectedLots);
    setSelectedTasks(newSelectedTasks);
  };

  const toggleSelectTask = (taskId: string) => {
    const newSelectedTasks = { ...selectedTasks };
    newSelectedTasks[taskId] = !newSelectedTasks[taskId];
    setSelectedTasks(newSelectedTasks);
  };

  const handleImportFromLibrary = () => {
    // Filtrer les lots et tâches sélectionnés
    const selectedLotIds = Object.keys(selectedLots).filter(
      (id) => selectedLots[id]
    );
    const selectedTaskIds = Object.keys(selectedTasks).filter(
      (id) => selectedTasks[id]
    );

    if (selectedTaskIds.length === 0) {
      toast({
        title: "Information",
        description: "Aucune tâche sélectionnée",
      });
      return;
    }

    // Création de nouveaux lots et tâches
    const newLots: DetailLot[] = [...detailLots];
    let nextLotNumber = detailLots.length + 1;

    // Organiser les tâches sélectionnées par lot
    lotManagerData.forEach((lotManagerLot) => {
      const selectedLotTasks = lotManagerLot.tasks.filter((task) =>
        selectedTaskIds.includes(task.id)
      );

      if (selectedLotTasks.length > 0) {
        // Vérifier si le lot existe déjà dans le descriptif
        let existingLot = newLots.find((l) => l.nom === lotManagerLot.title);

        if (!existingLot) {
          // Créer un nouveau lot avec un numéro temporaire
          existingLot = {
            id: `lot-${Date.now()}-${nextLotNumber}`,
            numero: `${nextLotNumber}`, // Ce numéro sera remplacé par renumberAllLots
            nom: lotManagerLot.title,
            travaux: [],
          };
          newLots.push(existingLot);
          nextLotNumber++;
        }

        // Ajouter les tâches sélectionnées au lot
        let nextTaskNumber = existingLot.travaux.length + 1;
        selectedLotTasks.forEach((task) => {
          existingLot!.travaux.push({
            id: `trav-${Date.now()}-${nextTaskNumber}`,
            numero: `${existingLot!.numero}.${nextTaskNumber}`, // Sera corrigé après renumérotation
            description: task.title,
            localisation: "",
            quantite: 1,
            unite: "ens",
            pu: 0,
            tva: 10,
          });
          nextTaskNumber++;
        });
      }
    });

    // CORRECTION: Appliquer la fonction de renumérotation pour s'assurer
    // que tous les lots ont des numéros séquentiels corrects
    const renumberedLots = renumberAllLots(newLots);

    setDetailLots(renumberedLots);
    setIsImportDialogOpen(false);

    toast({
      title: "Succès",
      description: `${selectedTaskIds.length} tâches importées avec succès`,
    });

    if (onDataUpdate) {
      onDataUpdate(convertToProjectFormat(renumberedLots));
    }
  };

  const currentDate = new Date().toISOString();

  return (
    <div className="space-y-6 descriptif-container">
      {/* En-tête du descriptif avec informations du projet */}
      <DescriptifHeader
        projectId={projectId}
        visitDate={currentDate}
        reportNumber="DESC-001"
      />

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Descriptif détaillé</h2>
        <div className="flex gap-2">
          <Button onClick={handleAddLot}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un lot
          </Button>
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Import className="h-4 w-4 mr-2" />
            Importer des tâches
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Ajouter ce Card pour la description du projet */}
      <Card className="mt-4 mb-6">
        <CardContent className="pt-4">
          <Textarea
            placeholder="Description du projet"
            value={projectDescription}
            onChange={handleDescriptionChange}
            className="min-h-[150px] resize-y"
          />
        </CardContent>
      </Card>

      {/* Liste des lots et leurs travaux avec drag and drop */}
      <div className="space-y-8" ref={tableContainerRef}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}>
          <SortableContext
            items={detailLots.map((lot) => lot.id)}
            strategy={verticalListSortingStrategy}>
            {detailLots.map((lot) => (
              <SortableLot
                key={lot.id}
                lot={lot}
                handleEditLot={handleEditLot}
                handleDuplicateLot={handleDuplicateLot}
                handleDeleteLot={handleDeleteLot}
                handleAddTravail={handleAddTravail}>
                <SortableContext
                  items={lot.travaux.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}>
                  {lot.travaux.map((travail) => (
                    <SortableTravail
                      key={travail.id}
                      travail={travail}
                      lotId={lot.id}
                      handleEditTravail={handleEditTravail}
                      handleDuplicateTravail={handleDuplicateTravail}
                      handleDeleteTravail={handleDeleteTravail}
                      handleQuantiteChange={handleQuantiteChange}
                      handlePUChange={handlePUChange}
                      handleTVAChange={handleTVAChange}
                      handleUniteChange={handleUniteChange}
                      handleLocalisationChange={handleLocalisationChange}
                    />
                  ))}
                </SortableContext>
              </SortableLot>
            ))}
          </SortableContext>
        </DndContext>

        {detailLots.length > 0 && (
          <div className="flex justify-end items-center gap-4">
            <span>TOTAL HT:</span>
            <span className="font-bold text-lg">
              {calculateTotalHT().toFixed(2)} €
            </span>
          </div>
        )}

        {detailLots.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground mb-4">
              Aucun lot n'a été ajouté au descriptif
            </div>
            <Button onClick={handleAddLot}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un lot
            </Button>
          </Card>
        )}
      </div>

      {/* Pied de page */}
      <ReportFooter />

      {/* Dialog pour importer des tâches depuis LotManager */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Importer des tâches depuis la bibliothèque
            </DialogTitle>
            <DialogDescription>
              Sélectionnez les tâches à importer pour votre descriptif. Les
              champs quantité, unité, PU et TVA seront à compléter après
              l'importation.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto my-2">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead className="w-10">
                    <input type="checkbox" />
                  </TableHead>
                  <TableHead>Lot / Tâche</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lotManagerData.map((lot) => (
                  <React.Fragment key={lot.id}>
                    <TableRow className="bg-gray-50">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedLots[lot.id] || false}
                          onChange={() => toggleSelectLot(lot.id)}
                        />
                      </TableCell>
                      <TableCell className="font-bold">{lot.title}</TableCell>
                    </TableRow>
                    {lot.tasks.map((task) => (
                      <TableRow key={task.id} className="hover:bg-gray-50">
                        <TableCell className="pl-8">
                          <input
                            type="checkbox"
                            checked={selectedTasks[task.id] || false}
                            onChange={() => toggleSelectTask(task.id)}
                          />
                        </TableCell>
                        <TableCell className="pl-8">{task.title}</TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleImportFromLibrary}>
              <Import className="h-4 w-4 mr-2" />
              Importer la sélection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour ajouter/modifier un lot */}
      <Dialog open={editLotOpen} onOpenChange={setEditLotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentLot ? "Modifier un lot" : "Ajouter un lot"}
            </DialogTitle>
            <DialogDescription>
              {currentLot
                ? "Modifiez les informations du lot de travaux."
                : "Ajoutez un nouveau lot de travaux au descriptif."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom du lot</label>
              <Input
                value={newLot.nom || ""}
                onChange={(e) => setNewLot({ ...newLot, nom: e.target.value })}
                placeholder="Nom du lot (ex: Électricité, Plomberie...)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditLotOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveLot}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour ajouter/éditer un travail */}
      <Dialog open={editTravauxOpen} onOpenChange={setEditTravauxOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentTravail ? "Modifier un travail" : "Ajouter un travail"}
            </DialogTitle>
            <DialogDescription>
              {currentTravail
                ? "Modifiez les détails de ce travail."
                : "Ajoutez un nouveau travail à ce lot."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={newTravail.description || ""}
                onChange={(e) =>
                  setNewTravail({ ...newTravail, description: e.target.value })
                }
                placeholder="Description du travail"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Localisation</label>
              <Input
                type="text"
                value={newTravail.localisation || ""}
                onChange={(e) =>
                  setNewTravail({ ...newTravail, localisation: e.target.value })
                }
                placeholder="Entrez la localisation"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantité</label>
                <Input
                  type="number"
                  value={newTravail.quantite || 0}
                  onChange={(e) =>
                    setNewTravail({
                      ...newTravail,
                      quantite: Number(e.target.value),
                    })
                  }
                  className="no-spinner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Unité</label>
                <Select
                  value={newTravail.unite}
                  onValueChange={(value) =>
                    setNewTravail({ ...newTravail, unite: value })
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Unité" />
                  </SelectTrigger>
                  <SelectContent>
                    {unites.map((unite) => (
                      <SelectItem key={unite} value={unite}>
                        {unite}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prix Unitaire (€)</label>
                <Input
                  type="number"
                  value={newTravail.pu || 0}
                  onChange={(e) =>
                    setNewTravail({ ...newTravail, pu: Number(e.target.value) })
                  }
                  className="no-spinner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">TVA (%)</label>
                <Input
                  type="number"
                  value={newTravail.tva || 10}
                  onChange={(e) =>
                    setNewTravail({
                      ...newTravail,
                      tva: Number(e.target.value),
                    })
                  }
                  className="no-spinner"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTravauxOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveTravail}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
