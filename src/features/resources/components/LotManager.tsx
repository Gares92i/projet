import { useState, useEffect } from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
// Remplacer react-beautiful-dnd par @dnd-kit
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  UniqueIdentifier
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  Plus,
  Search,
  MoreHorizontal,
  Copy,
  FileSpreadsheet,
  FileDown,
  GripVertical,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import { Label } from "@/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { toast } from "sonner";

// Types pour lots et tâches
interface Task {
  id: string;
  name: string;
  sortOrder: number;
}

interface Lot {
  id: string;
  name: string;
  count: number;
  sortOrder: number;
  tasks: Task[];
  isExpanded: boolean;
}

const defaultLots: Lot[] = [
  {
    id: "electricite",
    name: "Électricité / Éclairage",
    count: 43,
    sortOrder: 0,
    tasks: [
      { id: "elec-1", name: "Installation prises électriques", sortOrder: 0 },
      { id: "elec-2", name: "Installation luminaires", sortOrder: 1 },
    ],
    isExpanded: false
  },
  {
    id: "menuiserie",
    name: "Menuiserie / Agencement",
    count: 46,
    sortOrder: 1,
    tasks: [
      { id: "menu-1", name: "Pose portes intérieures", sortOrder: 0 },
      { id: "menu-2", name: "Installation placards", sortOrder: 1 },
    ],
    isExpanded: false
  },
  {
    id: "serrurerie",
    name: "Serrurerie / Métallerie",
    count: 27,
    sortOrder: 2,
    tasks: [
      { id: "serr-1", name: "Installation serrures", sortOrder: 0 },
      { id: "serr-2", name: "Pose garde-corps", sortOrder: 1 },
    ],
    isExpanded: false
  },
  {
    id: "miroiterie",
    name: "Miroiterie",
    count: 4,
    sortOrder: 3,
    tasks: [
      { id: "miro-1", name: "Fourniture et pose d'un miroir", sortOrder: 0 },
      { id: "miro-2", name: "Pose d'un miroir", sortOrder: 1 },
    ],
    isExpanded: true
  }
];


// Modifier l'interface du composant pour accepter les props
interface LotManagerProps {
  isLotDialogOpen?: boolean;
  setIsLotDialogOpen?: (open: boolean) => void;
}

// Composants pour les éléments triables
function SortableLot({
  lot,
  index,
  toggleLotExpansion,
  handleEditLot, 
  confirmDeleteLot,
  setCurrentLotId, 
  setIsAddTaskDialogOpen,
  handleTaskDragEnd,  // Ajouter ces nouvelles props
  handleEditTask,
  handleDuplicateTask, 
  confirmDeleteTask
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lot.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: '8px',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="bg-white p-3 flex items-center gap-2">
        {/* Zone de grip */}
        <div
          {...attributes}
          {...listeners}
          className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-5 w-5 text-gray-500" />
        </div>

        {/* Contenu cliquable */}
        <div
          className="flex-grow flex items-center gap-2 cursor-pointer"
          onClick={() => toggleLotExpansion(lot.id)}
        >
          <span className="font-medium">{lot.name}</span>
          <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
            {lot.count}
          </span>
        </div>

        {/* Menu à droite */}
        <Popover>
          <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="ml-auto">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40" align="end">
            <div className="grid gap-1">
              <Button 
                variant="ghost"
                size="sm" 
                className="justify-start"
                onClick={() => {
                  setCurrentLotId(lot.id);
                  setIsAddTaskDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une tâche
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start"
                onClick={() => handleEditLot(lot)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="justify-start text-red-500 hover:text-red-600"
                onClick={() => confirmDeleteLot(lot.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Tâches */}
      {lot.isExpanded && (
        <TasksContainer 
          lot={lot} 
          handleTaskDragEnd={handleTaskDragEnd}
          handleEditTask={handleEditTask}
          handleDuplicateTask={handleDuplicateTask}
          confirmDeleteTask={confirmDeleteTask}
          setCurrentLotId={setCurrentLotId}
          setIsAddTaskDialogOpen={setIsAddTaskDialogOpen}
        />
      )}
    </div>
  );
}

// Modifiez la définition de TasksContainer pour accepter les fonctions nécessaires en props

// 1. Ajouter l'interface pour les props
interface TasksContainerProps {
  lot: Lot;
  handleTaskDragEnd: (event: DragEndEvent, lotId: string) => void;
  handleEditTask: (lotId: string, task: Task) => void;
  handleDuplicateTask: (lotId: string, task: Task) => void;
  confirmDeleteTask: (lotId: string, taskId: string) => void;
  setCurrentLotId: (lotId: string) => void;
  setIsAddTaskDialogOpen: (open: boolean) => void;
}

// 2. Modifier TasksContainer pour accepter ces props
function TasksContainer({ 
  lot, 
  handleTaskDragEnd, 
  handleEditTask, 
  handleDuplicateTask, 
  confirmDeleteTask,
  setCurrentLotId,
  setIsAddTaskDialogOpen
}: TasksContainerProps) {
  // Définir les sensors au niveau supérieur du composant, jamais dans une condition
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), // Augmenter la distance pour éviter les déclenchements accidentels
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }), // Augmenter le délai et la tolérance
    useSensor(KeyboardSensor)
  );

  return (
    <div className="bg-gray-50 px-4 py-2 space-y-1">
      {lot.tasks.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={(event) => handleTaskDragEnd(event, lot.id)}
        >
          <div className="min-h-[50px]"> {/* Hauteur minimum pour stabiliser le conteneur */}
            <SortableContext
              items={lot.tasks.map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              {lot.tasks.map((task) => (
                <SortableTask 
                  key={task.id} 
                  task={task} 
                  lotId={lot.id}
                  handleEditTask={handleEditTask}
                  handleDuplicateTask={handleDuplicateTask}
                  confirmDeleteTask={confirmDeleteTask}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      ) : (
        <div className="text-center py-2 text-gray-500">
          Aucune tâche dans ce lot.
        </div>
      )}
      
      {/* Ajouter un bouton pour créer directement une tâche */}
      <div className="pt-2 pb-1 flex justify-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            setCurrentLotId(lot.id);
            setIsAddTaskDialogOpen(true);
          }}
          className="w-full text-sm"
        >
          <Plus className="h-3 w-3 mr-1" />
          Ajouter une tâche
        </Button>
      </div>
    </div>
  );
}

function SortableTask({ task, lotId, handleEditTask, handleDuplicateTask, confirmDeleteTask }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded p-2 flex justify-between items-center"
    >
      <div className="flex items-center gap-2">
        <div 
          {...attributes}
          {...listeners}
          className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        <span>{task.name}</span>
      </div>

      <Popover>
        <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40" align="end">
          <div className="grid gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="justify-start"
              onClick={() => handleEditTask(lotId, task)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="justify-start"
              onClick={() => handleDuplicateTask(lotId, task)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Dupliquer
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="justify-start text-red-500 hover:text-red-600"
              onClick={() => confirmDeleteTask(lotId, task.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

const LotManager: React.FC<LotManagerProps> = ({
  isLotDialogOpen = false,
  setIsLotDialogOpen
}) => {
  const [lots, setLots] = useState<Lot[]>(defaultLots);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [newLotName, setNewLotName] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [currentLotId, setCurrentLotId] = useState<string | null>(null);
  const [filteredLots, setFilteredLots] = useState<Lot[]>(lots);
  const [isAddLotDialogOpen, setIsAddLotDialogOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [editingTask, setEditingTask] = useState<{ lotId: string, task: Task } | null>(null);
  const [isEditLotDialogOpen, setIsEditLotDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [editedLotName, setEditedLotName] = useState("");
  const [editedTaskName, setEditedTaskName] = useState("");
  const [deleteConfirmLotId, setDeleteConfirmLotId] = useState<string | null>(null);
  const [deleteConfirmTaskInfo, setDeleteConfirmTaskInfo] = useState<{lotId: string, taskId: string} | null>(null);
  const [isDeleteLotDialogOpen, setIsDeleteLotDialogOpen] = useState(false);
  const [isDeleteTaskDialogOpen, setIsDeleteTaskDialogOpen] = useState(false);

  useEffect(() => {
    // Filtrer les lots selon la recherche
    if (searchQuery) {
      setFilteredLots(
        lots.filter(lot => 
          lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lot.tasks.some(task => task.name.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      );
    } else {
      setFilteredLots(lots);
    }
  }, [searchQuery, lots]);

  // Remplacer handleDragEnd par la version pour @dnd-kit
  const handleLotDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setLots((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const reordered = arrayMove(items, oldIndex, newIndex);
        
        // Mettre à jour l'ordre
        return reordered.map((lot, index) => ({
          ...lot,
          sortOrder: index
        }));
      });
    }
  };

  // Fonction pour gérer le drag & drop des tâches
  const handleTaskDragEnd = (event: DragEndEvent, lotId: string) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setLots((items) => {
        const lotIndex = items.findIndex(lot => lot.id === lotId);
        if (lotIndex === -1) return items;
        
        const lotCopy = { ...items[lotIndex] };
        
        const oldIndex = lotCopy.tasks.findIndex(task => task.id === active.id);
        const newIndex = lotCopy.tasks.findIndex(task => task.id === over.id);
        
        lotCopy.tasks = arrayMove(lotCopy.tasks, oldIndex, newIndex).map((task, index) => ({
          ...task,
          sortOrder: index
        }));
        
        const newItems = [...items];
        newItems[lotIndex] = lotCopy;
        
        return newItems;
      });
    }
  };

  // Ajouter un nouveau lot
  const handleAddLot = () => {
    if (!newLotName.trim()) {
      toast.error("Le nom du lot ne peut pas être vide");
      return;
    }

    const newLot: Lot = {
      id: `lot-${Date.now()}`,
      name: newLotName,
      count: 0,
      sortOrder: lots.length,
      tasks: [],
      isExpanded: false
    };

    setLots([...lots, newLot]);
    setNewLotName("");
    handleLotDialogOpen(false);
    toast.success("Lot ajouté avec succès");
  };

  // Ajouter une nouvelle tâche
  const handleAddTask = () => {
    if (!newTaskName.trim() || !currentLotId) {
      toast.error("Le nom de la tâche ne peut pas être vide");
      return;
    }

    const lotIndex = lots.findIndex(lot => lot.id === currentLotId);
    if (lotIndex === -1) return;

    const lotCopy = { ...lots[lotIndex] };
    const tasksCopy = [...lotCopy.tasks];

    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: newTaskName,
      sortOrder: tasksCopy.length
    };

    tasksCopy.push(newTask);
    lotCopy.tasks = tasksCopy;
    lotCopy.count += 1;

    const updatedLots = [...lots];
    updatedLots[lotIndex] = lotCopy;

    setLots(updatedLots);
    setNewTaskName("");
    setIsAddTaskDialogOpen(false);
    toast.success("Tâche ajoutée avec succès");
  };

  // Modifier la fonction handleDeleteLot pour afficher une confirmation
  const confirmDeleteLot = (lotId: string) => {
    setDeleteConfirmLotId(lotId);
    setIsDeleteLotDialogOpen(true);
  };

  const handleDeleteLotConfirmed = () => {
    if (!deleteConfirmLotId) return;
    
    setLots(lots.filter(lot => lot.id !== deleteConfirmLotId));
    setIsDeleteLotDialogOpen(false);
    toast.success("Lot supprimé avec succès");
  };

  // Modifier la fonction handleDeleteTask pour afficher une confirmation
  const confirmDeleteTask = (lotId: string, taskId: string) => {
    setDeleteConfirmTaskInfo({ lotId, taskId });
    setIsDeleteTaskDialogOpen(true);
  };

  const handleDeleteTaskConfirmed = () => {
    if (!deleteConfirmTaskInfo) return;
    
    const { lotId, taskId } = deleteConfirmTaskInfo;
    const lotIndex = lots.findIndex(lot => lot.id === lotId);
    if (lotIndex === -1) return;

    const lotCopy = { ...lots[lotIndex] };
    lotCopy.tasks = lotCopy.tasks.filter(task => task.id !== taskId);
    lotCopy.count = lotCopy.tasks.length;

    const updatedLots = [...lots];
    updatedLots[lotIndex] = lotCopy;

    setLots(updatedLots);
    setIsDeleteTaskDialogOpen(false);
    toast.success("Tâche supprimée avec succès");
  };

  // Développer/réduire un lot
  const toggleLotExpansion = (lotId: string) => {
    setLots(
      lots.map(lot =>
        lot.id === lotId ? { ...lot, isExpanded: !lot.isExpanded } : lot
      )
    );
  };

  // Utilisez la prop externe si elle existe, sinon utilisez l'état local
  const handleLotDialogOpen = (open: boolean) => {
    if (setIsLotDialogOpen) {
      setIsLotDialogOpen(open);
    }
    
    // Toujours mettre à jour l'état local, même si un état externe est fourni
    setIsAddLotDialogOpen(open);
  };

  // Nouvelle fonction pour dupliquer une tâche
  const handleDuplicateTask = (lotId: string, task: Task) => {
    const lotIndex = lots.findIndex(lot => lot.id === lotId);
    if (lotIndex === -1) return;

    const lotCopy = { ...lots[lotIndex] };
    
    const duplicatedTask: Task = {
      id: `task-${Date.now()}`,
      name: `${task.name} (copie)`,
      sortOrder: lotCopy.tasks.length
    };
    
    lotCopy.tasks = [...lotCopy.tasks, duplicatedTask];
    lotCopy.count = lotCopy.tasks.length;
    
    const updatedLots = [...lots];
    updatedLots[lotIndex] = lotCopy;
    
    setLots(updatedLots);
    toast.success("Tâche dupliquée avec succès");
  };
  
  // Fonction pour modifier un lot
  const handleEditLot = (lot: Lot) => {
    setEditingLot(lot);
    setEditedLotName(lot.name);
    setIsEditLotDialogOpen(true);
  };
  
  // Fonction pour appliquer les modifications à un lot
  const applyLotEdit = () => {
    if (!editingLot) return;
    if (!editedLotName.trim()) {
      toast.error("Le nom du lot ne peut pas être vide");
      return;
    }
    
    const updatedLots = lots.map(lot =>
      lot.id === editingLot.id ? { ...lot, name: editedLotName } : lot
    );
    
    setLots(updatedLots);
    setIsEditLotDialogOpen(false);
    setEditingLot(null);
    toast.success("Lot modifié avec succès");
  };
  
  // Fonction pour modifier une tâche
  const handleEditTask = (lotId: string, task: Task) => {
    setEditingTask({ lotId, task });
    setEditedTaskName(task.name);
    setIsEditTaskDialogOpen(true);
  };
  
  // Fonction pour appliquer les modifications à une tâche
  const applyTaskEdit = () => {
    if (!editingTask) return;
    if (!editedTaskName.trim()) {
      toast.error("Le nom de la tâche ne peut pas être vide");
      return;
    }
    
    const lotIndex = lots.findIndex(lot => lot.id === editingTask.lotId);
    if (lotIndex === -1) return;
    
    const lotCopy = { ...lots[lotIndex] };
    lotCopy.tasks = lotCopy.tasks.map(task => 
      task.id === editingTask.task.id ? { ...task, name: editedTaskName } : task
    );
    
    const updatedLots = [...lots];
    updatedLots[lotIndex] = lotCopy;
    
    setLots(updatedLots);
    setIsEditTaskDialogOpen(false);
    setEditingTask(null);
    toast.success("Tâche modifiée avec succès");
  };

  // Fonction pour exporter en Excel
  const handleExportExcel = () => {
    // Logique d'export Excel à implémenter
    toast.success("Export Excel en cours...");
  };

  // Fonction pour exporter en PDF
  const handleExportPDF = () => {
    // Logique d'export PDF à implémenter
    toast.success("Export PDF en cours...");
  };

  // Mise en place des sensors pour le drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 1 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 1 } }),
    useSensor(KeyboardSensor)
  );

  return (
    <div>
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => handleLotDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un lot
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Remplacer DragDropContext par DndContext */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleLotDragEnd}
      >
        <SortableContext
          items={filteredLots.map(lot => lot.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4"> 
            {filteredLots.map((lot, index) => (
              <SortableLot
                key={lot.id}
                lot={lot}
                index={index}
                toggleLotExpansion={toggleLotExpansion}
                handleEditLot={handleEditLot}
                confirmDeleteLot={confirmDeleteLot}
                setCurrentLotId={setCurrentLotId}
                setIsAddTaskDialogOpen={setIsAddTaskDialogOpen}
                handleTaskDragEnd={handleTaskDragEnd}
                handleEditTask={handleEditTask}
                handleDuplicateTask={handleDuplicateTask}
                confirmDeleteTask={confirmDeleteTask}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Dialogue pour ajouter un lot */}
      <Dialog
        open={(isLotDialogOpen || isAddLotDialogOpen) === true}
        onOpenChange={handleLotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un lot</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="lot-name">Nom du lot</Label>
              <Input
                id="lot-name"
                value={newLotName}
                onChange={(e) => setNewLotName(e.target.value)}
                placeholder="Ex: Maçonnerie / Gros œuvre"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleLotDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddLot}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue pour ajouter une tâche */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une tâche</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-name">Nom de la tâche</Label>
              <Input
                id="task-name"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Ex: Installation étagères"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddTaskDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddTask}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue pour modifier un lot */}
      <Dialog open={isEditLotDialogOpen} onOpenChange={setIsEditLotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier un lot</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-lot-name">Nom du lot</Label>
              <Input
                id="edit-lot-name"
                value={editedLotName}
                onChange={(e) => setEditedLotName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditLotDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={applyLotEdit}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue pour modifier une tâche */}
      <Dialog
        open={isEditTaskDialogOpen}
        onOpenChange={setIsEditTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier une tâche</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-task-name">Nom de la tâche</Label>
              <Input
                id="edit-task-name"
                value={editedTaskName}
                onChange={(e) => setEditedTaskName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditTaskDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={applyTaskEdit}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression d'un lot */}
      <AlertDialog
        open={isDeleteLotDialogOpen}
        onOpenChange={setIsDeleteLotDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce lot ? Cette action est
              irréversible et supprimera également toutes les tâches associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteLotConfirmed}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogue de confirmation de suppression d'une tâche */}
      <AlertDialog
        open={isDeleteTaskDialogOpen}
        onOpenChange={setIsDeleteTaskDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteTaskConfirmed}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LotManager;