import React, {
  useState,
  useEffect,
  useReducer,
  useRef,
  useCallback,
} from "react";
import Timeline, {
  TimelineMarkers,
  TodayMarker,
  CursorMarker,
  CustomMarker,
} from "react-calendar-timeline";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
import moment from "moment";
import "moment/locale/fr";
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(duration);
dayjs.locale("fr");
moment.locale("fr");

import "react-calendar-timeline/dist/style.css";
import "@/styles/timeline-custom.css";
import "@/styles/timeline-progress-fix.css";
import "@/styles/force-progress.css";
import { Slider } from "@/ui/slider";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import {
  ZoomIn,
  ZoomOut,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Plus,
  Edit,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Flag,
  RefreshCcw,
  CalendarSync,
  FileText,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/popover";

import { LotTravaux } from "@/features/descriptif/types/descriptif";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import "@/features/planning/types/react-calendar-timeline.d.ts";
import { removeUnwantedElements } from "@/features/planning/components/removeOverflowElements";
import { toast } from "react-toastify";
import PlanningExport from "./PlanningExport";
import PlanningPDF from "./PlanningPDF";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Checkbox } from "@/ui/checkbox";
import { PDFViewer } from "@react-pdf/renderer";
dayjs.locale("fr");

declare global {
  interface Window {
    isScrolling?: boolean;
    blockAutoSave?: boolean;
    isUpdatingLotDurations?: boolean;
  }
}

interface PlanningTabProps {
  projectId: string;
  descriptifData?: LotTravaux[];
  startDate?: string;
  endDate?: string;
  onTaskUpdate?: (taskId: string, startDate: string, endDate: string) => void;
}

interface CustomMarkerData {
  id: string;
  date: number;
  title: string;
  type: "start" | "end" | "other";
  color: string;
}

interface ExportOptions {
  paperFormat: string;
  orientation: "portrait" | "landscape";
  dateRange: "all" | "custom" | "visible";
  showTaskNames: boolean;
  singlePage: boolean;
  fitToPage: boolean;
  quality: number;
  customStartDate: Date;
  customEndDate: Date;
}

const roundToDay = (timestamp) => {
  return dayjs(timestamp).startOf("day").valueOf();
};

const endOfDay = (timestamp) => {
  return dayjs(timestamp).endOf("day").valueOf();
};

const MAX_ZOOM_OUT = 365 * 24 * 60 * 60 * 1000;
const MIN_ZOOM_IN = 31 * 24 * 60 * 60 * 1000;

const lotColors = [
  "#4CAF50", // Vert
  "#2196F3", // Bleu
  "#8D6E63", // Marron
  "#FF9800", // Orange
  "#9C27B0", // Violet
  "#607D8B", // Bleu-gris
  "#E91E63", // Rose
  "#00BCD4", // Cyan
  "#FFC107", // Jaune
  "#673AB7", // Violet foncé
  "#3F51B5", // Indigo
  "#795548", // Marron foncé
  "#009688", // Teal
  "#CDDC39", // Lime
  "#03A9F4", // Bleu clair
  "#FF5722", // Orange foncé
  "#4DB6AC", // Teal clair
  "#FF4081", // Rose vif
  "#558B2F", // Vert foncé
  "#7986CB", // Indigo clair
];

const LotOverlayRenderer = ({ items, visibleTimeStart, visibleTimeEnd }) => {
  const lotItems = items.filter((item) => item.isHeader === true);

  return (
    <div
      className="lot-items-overlay"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}>
      {lotItems.map((lot) => (
        <PositionedLotItem
          key={lot.id}
          lot={lot}
          visibleTimeStart={visibleTimeStart}
          visibleTimeEnd={visibleTimeEnd}
        />
      ))}
    </div>
  );
};

const PositionedLotItem = ({ lot, visibleTimeStart, visibleTimeEnd }) => {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    const updatePosition = () => {
      const timelineElement = document.querySelector(
        ".react-calendar-timeline"
      );
      const sidebarElement = document.querySelector(".rct-sidebar");
      const groupElement = document.querySelector(
        `.rct-sidebar-row[data-id="${lot.group}"]`
      );

      if (!timelineElement || !sidebarElement || !groupElement) return;

      const timelineRect = timelineElement.getBoundingClientRect();
      const sidebarRect = sidebarElement.getBoundingClientRect();
      const groupRect = groupElement.getBoundingClientRect();

      const timelineWidth = timelineRect.width - sidebarRect.width;
      const timeRange = visibleTimeEnd - visibleTimeStart;
      const pixelsPerMs = timelineWidth / timeRange;

      const lotStartOffset = (lot.start_time - visibleTimeStart) * pixelsPerMs;
      const lotWidth = (lot.end_time - lot.start_time) * pixelsPerMs;

      setPosition({
        top: groupRect.top - timelineRect.top + 5,
        left: sidebarRect.width + lotStartOffset,
        width: lotWidth,
      });
    };

    updatePosition();
    const timer = setTimeout(updatePosition, 100);

    window.addEventListener("resize", updatePosition);
    const timeline = document.querySelector(".react-calendar-timeline");
    if (timeline) {
      timeline.addEventListener("scroll", updatePosition);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      if (timeline) {
        timeline.removeEventListener("scroll", updatePosition);
      }
    };
  }, [lot, visibleTimeStart, visibleTimeEnd]);

  return (
    <div
      className="lot-overlay-item"
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        height: "20px",
        backgroundColor: lot.lotColor || "#FF5722",
        border: "1px solid rgba(0,0,0,0.2)",
        borderRadius: "4px",
        color: "white",
        fontSize: "11px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        zIndex: 2000,
        pointerEvents: "none",
      }}>
      {lot.title}
    </div>
  );
};

export const PlanningTab: React.FC<PlanningTabProps> = ({
  projectId,
  descriptifData = [],
  startDate,
  endDate,
  onTaskUpdate,
}) => {
  dayjs.locale("fr");

  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState([]);
  const timelineRef = useRef(null);

  const [visibleTimeStart, setVisibleTimeStart] = useState(() => {
    const today = dayjs();
    return today.startOf("month").valueOf();
  });

  const [visibleTimeEnd, setVisibleTimeEnd] = useState(() => {
    const today = dayjs();
    return today.endOf("month").valueOf();
  });

  const [canZoomIn, setCanZoomIn] = useState(true);
  const [canZoomOut, setCanZoomOut] = useState(true);

  const [collapsedLots, setCollapsedLots] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lotRanges, setLotRanges] = useState({});
  const [customMarkers, setCustomMarkers] = useState<CustomMarkerData[]>(() => {
    const savedMarkers = localStorage.getItem(`project_${projectId}_markers`);
    if (savedMarkers) {
      try {
        return JSON.parse(savedMarkers);
      } catch (e) {
        console.error("Erreur lors du chargement des marqueurs:", e);
        return [];
      }
    }
    return [];
  });
  const [isMarkerDialogOpen, setIsMarkerDialogOpen] = useState(false);
  const [editingMarkerId, setEditingMarkerId] = useState<string | null>(null);
  const [newMarker, setNewMarker] = useState<{
    date: string;
    title: string;
    type: "start" | "end" | "other";
    color: string;
  }>({
    date: dayjs().format("YYYY-MM-DD"),
    title: "Début des travaux",
    type: "start",
    color: "#22c55e",
  });

  const [isLotDialogOpen, setIsLotDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingLotId, setEditingLotId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [parentLotId, setParentLotId] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: "lot" | "task";
    name: string;
  } | null>(null);

  const [lotForm, setLotForm] = useState({
    name: "",
    color: "#4CAF50", // Couleur par défaut
  });

  const [taskForm, setTaskForm] = useState({
    name: "",
    startDate: dayjs().format("YYYY-MM-DD"),
    endDate: dayjs().add(5, "days").format("YYYY-MM-DD"),
    progress: 0,
  });

  const timelineViewMode =
    visibleTimeEnd - visibleTimeStart >= 180 * 24 * 60 * 60 * 1000
      ? "year-view"
      : "month-view";

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const taskIdCounter = useRef(0);

  const [blockAutoSave, setBlockAutoSave] = useState(false);

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    paperFormat: "A4",
    orientation: "landscape",
    dateRange: "all",
    showTaskNames: true,
    singlePage: true,
    fitToPage: true,
    quality: 2,
    customStartDate: dayjs().subtract(1, "month").toDate(),
    customEndDate: dayjs().add(1, "month").toDate(),
  });

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState(sidebarCollapsed ? 50 : 300);
  const [isResizing, setIsResizing] = useState(false);
  const resizerRef = useRef(null);
  const minSidebarWidth = 50;
  const maxSidebarWidth = 500;

  // Ajoutez cet état au début du composant avec les autres états
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Gestionnaires pour le redimensionnement de la sidebar
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  const handleResizeMove = (e) => {
    if (!isResizing) return;

    // Calculer la nouvelle largeur basée sur la position de la souris
    const newWidth = e.clientX;

    // Appliquer les limites min et max
    const clampedWidth = Math.max(
      minSidebarWidth,
      Math.min(newWidth, maxSidebarWidth)
    );

    // Mettre à jour la largeur de la sidebar
    setSidebarWidth(clampedWidth);

    // Mettre à jour l'état "replié" en fonction de la largeur
    if (clampedWidth <= minSidebarWidth + 10) {
      setSidebarCollapsed(true);
    } else if (sidebarCollapsed) {
      setSidebarCollapsed(false);
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const newState = !prev;
      setSidebarWidth(newState ? minSidebarWidth : 300);
      return newState;
    });
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, []);

  useEffect(() => {
    if (
      customMarkers.length > 0 ||
      localStorage.getItem(`project_${projectId}_markers`)
    ) {
      localStorage.setItem(
        `project_${projectId}_markers`,
        JSON.stringify(customMarkers)
      );
    }
  }, [customMarkers, projectId]);

  useEffect(() => {
    console.log("DescriptifData reçue:", descriptifData);

    // IMPORTANT: Si descriptifData est vide, vider complètement le planning
    if (!descriptifData || descriptifData.length === 0) {
      setGroups([]);
      setItems([]);
      setLotRanges({});
      setCollapsedLots({});
      // Sauvegarder l'état vide
      setTimeout(() => savePlanningState(), 100);
      return;
    }

    // Générer le planning à partir des données du descriptif
    const newGroups = [];
    const newItems = [];
    const newLotRanges = {};
    const usedIds = new Set(); // Pour vérifier les IDs dupliqués

    // Conserver les états de repli des lots
    const savedCollapsedState = { ...collapsedLots };

    descriptifData.forEach((lot, lotIndex) => {
      if (!lot || !lot.id) return;

      const lotId = `lot-${lot.id}`;
      const lotColor = lotColors[lotIndex % lotColors.length];

      // Créer le groupe du lot
      newGroups.push({
        id: lotId,
        title: `${lotIndex + 1}. ${lot.nom || lot.name || "Sans nom"}`,
        lotColor: lotColor,
      });

      const lotTasks = lot.travaux || lot.tasks || [];

      // Même pour un lot vide, créer un en-tête visuel
      const lotHeaderId = `lot-header-${lot.id}`;

      if (lotTasks.length === 0) {
        newItems.push({
          id: lotHeaderId,
          group: lotId,
          title: (lot.nom || lot.name).toUpperCase(),
          start_time: dayjs().startOf("day").valueOf(),
          end_time: dayjs().add(30, "days").endOf("day").valueOf(),
          className: `lot-header-bar lot-${lotIndex}`,
          lotColor: lotColor,
          lotIndex: lotIndex,
          canMove: false,
          canResize: false,
          isHeader: true,
        });
        return;
      }

      let lotMinDate = Infinity;
      let lotMaxDate = -Infinity;

      lotTasks.forEach((task, taskIndex) => {
        if (!task) return;

        // Utiliser l'ID existant ou en générer un stable
        let taskUniqueId = task.id || `autogen-${lot.id}-${taskIndex}`;

        // Vérifier si cet ID est déjà utilisé
        if (usedIds.has(taskUniqueId)) {
          // Créer un ID vraiment unique en cas de conflit
          taskUniqueId = `autogen-${
            lot.id
          }-${taskIndex}-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;
        }
        usedIds.add(taskUniqueId);

        const taskId = `task-${taskUniqueId}`;

        // Obtenir les dates de début et de fin de la tâche
        const taskStartTime =
          task.startDate || task.dateDebut
            ? dayjs(task.startDate || task.dateDebut)
                .startOf("day")
                .valueOf()
            : dayjs()
                .add(lotIndex * 7 + taskIndex * 2, "days")
                .startOf("day")
                .valueOf();

        const taskEndTime =
          task.endDate || task.dateFin
            ? dayjs(task.endDate || task.dateFin)
                .endOf("day")
                .valueOf()
            : dayjs(taskStartTime).add(5, "days").endOf("day").valueOf();

        // Mettre à jour les dates min/max du lot
        lotMinDate = Math.min(lotMinDate, taskStartTime);
        lotMaxDate = Math.max(lotMaxDate, taskEndTime);

        // Créer le groupe de la tâche
        newGroups.push({
          id: taskId,
          title: `${lotIndex + 1}.${taskIndex + 1} ${
            task.name ||
            task.nom ||
            task.description ||
            `Tâche ${taskIndex + 1}`
          }`,
          parentId: lotId,
          lotColor: lotColor,
        });

        // Créer l'item de la tâche
        newItems.push({
          id: taskUniqueId,
          group: taskId,
          title:
            task.name ||
            task.nom ||
            task.description ||
            `Tâche ${taskIndex + 1}`,
          start_time: taskStartTime,
          end_time: taskEndTime,
          className: `item-${lotIndex % 6}`,
          lotColor: lotColor,
          progress: task.progression || task.progress || 0,
          canMove: true,
          canResize: true,
        });
      });

      // En dehors de la boucle, utiliser les valeurs calculées
      if (lotTasks.length > 0) {
        newLotRanges[lotId] = { start: lotMinDate, end: lotMaxDate };

        // Ajouter l'en-tête du lot avec les dates calculées
        newItems.push({
          id: lotHeaderId,
          group: lotId,
          title: (lot.nom || lot.name).toUpperCase(),
          start_time: lotMinDate,
          end_time: lotMaxDate,
          className: `lot-header-bar lot-${lotIndex}`,
          lotColor: lotColor,
          lotIndex: lotIndex,
          canMove: false,
          canResize: false,
          isHeader: true,
        });
      }
    });

    // Vérifier la cohérence des IDs avant de mettre à jour l'état
    const itemIds = new Set();
    let hasDuplicates = false;

    newItems.forEach((item) => {
      if (itemIds.has(item.id)) {
        console.error(`ID dupliqué détecté: ${item.id}`);
        hasDuplicates = true;
      }
      itemIds.add(item.id);
    });

    if (hasDuplicates) {
      console.error("Des ID dupliqués ont été détectés et corrigés.");
    }

    console.log(
      "Planning généré à partir du descriptif:",
      newGroups.length,
      "groupes,",
      newItems.length,
      "items"
    );

    // Mettre à jour l'état avec les nouvelles données
    setGroups(newGroups);
    setItems(newItems);
    setLotRanges(newLotRanges);

    // Restaurer l'état de repli des lots et sauvegarder l'état
    setTimeout(() => {
      savePlanningState();
      // Forcer une mise à jour du rendu
      forceUpdate();
    }, 100);
  }, [descriptifData, projectId]);

  useEffect(() => {
    console.log("Locale actuelle:", dayjs.locale());
    console.log("Test formatage en français:", dayjs().format("MMMM"));
  }, []);

  useEffect(() => {
    const translateHeaders = () => {
      const weekdayTranslations = {
        Mo: "Lun",
        Tu: "Mar",
        We: "Mer",
        Th: "Jeu",
        Fr: "Ven",
        Sa: "Sam",
        Su: "Dim",
        Monday: "Lundi",
        Tuesday: "Mardi",
        Wednesday: "Mercredi",
        Thursday: "Jeudi",
        Friday: "Vendredi",
        Saturday: "Samedi",
        Sunday: "Dimanche",
      };

      const monthTranslations = {
        January: "Janvier",
        February: "Février",
        March: "Mars",
        April: "Avril",
        May: "Mai",
        June: "Juin",
        July: "Juillet",
        August: "Août",
        September: "Septembre",
        October: "Octobre",
        November: "Novembre",
        December: "Décembre",
        Jan: "Jan",
        Feb: "Fév",
        Mar: "Mar",
        Apr: "Avr",
        Jun: "Juin",
        Jul: "Juil",
        Aug: "Août",
        Sep: "Sep",
        Oct: "Oct",
        Nov: "Nov",
        Dec: "Déc",
      };

      const cleanMarkedElements = () => {
        document
          .querySelectorAll('[data-translated="partial"]')
          .forEach((el) => {
            (el as HTMLElement).removeAttribute("data-translated");
          });
      };

      document
        .querySelectorAll(".rct-dateHeader-primary, .rct-dateHeader")
        .forEach((header) => {
          if ((header as HTMLElement).dataset.translated === "true") return;

          const headerText = header.textContent || "";
          let translated = false;

          Object.keys(monthTranslations).forEach((eng) => {
            if (headerText.includes(eng)) {
              const regex = new RegExp(`\\b${eng}\\b`, "g");
              header.innerHTML = header.innerHTML.replace(
                regex,
                monthTranslations[eng]
              );
              translated = true;
            }
          });

          Object.keys(weekdayTranslations).forEach((eng) => {
            if (headerText.includes(eng)) {
              const regex = new RegExp(`\\b${eng}\\b`, "g");
              header.innerHTML = header.innerHTML.replace(
                regex,
                weekdayTranslations[eng]
              );
              translated = true;
            }
          });

          if (translated) {
            (header as HTMLElement).dataset.translated = "true";
          }
        });

      cleanMarkedElements();
    };

    const initialTimeout = setTimeout(translateHeaders, 300);
    const visibilityTimeout = setTimeout(translateHeaders, 50);

    const intervalCheck = setInterval(() => {
      if (!window.isScrolling) {
        translateHeaders();
      }
    }, 1500);

    let scrollTimer;
    const scrollHandler = () => {
      window.isScrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        window.isScrolling = false;
        translateHeaders();
      }, 200);
    };

    document.addEventListener("scroll", scrollHandler, { passive: true });

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(visibilityTimeout);
      clearInterval(intervalCheck);
      document.removeEventListener("scroll", scrollHandler);
    };
  }, [visibleTimeStart, visibleTimeEnd]);

  useEffect(() => {
    // Charger l'état sauvegardé ou générer à partir du descriptif
    const loaded = loadPlanningState();

    // Si aucun état n'a été chargé et que des données descriptif sont disponibles,
    // l'effet sur descriptifData va les traiter automatiquement

    // Configurer les dates de départ si spécifiées
    if (startDate) {
      const start = dayjs(startDate).startOf("day").valueOf();
      setVisibleTimeStart(start);
    }

    if (endDate) {
      const end = dayjs(endDate).endOf("day").valueOf();
      setVisibleTimeEnd(end);
    }
  }, []);

  const handleItemMove = (itemId, dragTime, newGroupOrder) => {
    console.log(
      `Déplacement de l'item ${itemId} à ${dayjs(dragTime).format(
        "YYYY-MM-DD"
      )}`
    );

    // Ignorer le déplacement pour les en-têtes
    if (itemId.startsWith("header-")) return;

    // Sélectionner automatiquement l'item déplacé
    setSelectedItemId(itemId);

    // Arrondir dragTime au jour
    const newStartTime = dayjs(dragTime).startOf("day").valueOf();

    // Trouver l'item à déplacer
    const itemToMove = items.find((i) => i.id === itemId);
    if (!itemToMove) {
      console.error("Item introuvable:", itemId);
      return;
    }

    // Calculer la durée en millisecondes
    const duration = itemToMove.end_time - itemToMove.start_time;
    const newEndTime = newStartTime + duration;

    // IMPORTANT: Mise à jour atomique avec copie profonde pour éviter les références partagées
    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        if (item.id === itemId) {
          return {
            ...JSON.parse(JSON.stringify(item)), // Copie profonde pour éviter les modifications mutuelles
            start_time: newStartTime,
            end_time: newEndTime,
          };
        }
        return item;
      });
      return updatedItems;
    });

    // Bloquer la sauvegarde automatique pendant quelques secondes
    window.blockAutoSave = true;

    // Délai plus long pour mettre à jour les durées des lots et sauvegarder
    setTimeout(() => {
      updateLotDurations();
      window.blockAutoSave = false;
      savePlanningState();
      forceUpdate();
    }, 800); // Délai un peu plus long pour assurer la stabilité
  };

  // Compléter la fonction handleItemResize
  const handleItemResize = (itemId, time, edge) => {
    console.log(`Redimensionnement de l'item ${itemId}, bord: ${edge}`);

    // Ignorer le redimensionnement pour les en-têtes
    if (itemId.startsWith("header-")) return;

    // Arrondir au jour selon le bord modifié
    const roundedTime =
      edge === "left"
        ? dayjs(time).startOf("day").valueOf()
        : dayjs(time).endOf("day").valueOf();

    // IMPORTANT: Mise à jour atomique
    setItems((prevItems) => {
      return prevItems.map((i) => {
        if (i.id === itemId) {
          return {
            ...i,
            start_time: edge === "left" ? roundedTime : i.start_time,
            end_time: edge === "right" ? roundedTime : i.end_time,
          };
        }
        return i;
      });
    });

    // IMPORTANT: Bloquer la sauvegarde automatique
    window.blockAutoSave = true;

    // Actualiser tous les états avec un délai plus long
    setTimeout(() => {
      updateLotDurations();
      window.blockAutoSave = false;
      savePlanningState();
      forceUpdate();
    }, 500);
  };

  const handleTimeChange = (
    visibleTimeStart,
    visibleTimeEnd,
    fromButton = false
  ) => {
    const duration = visibleTimeEnd - visibleTimeStart;

    if (fromButton) {
      setCanZoomIn(duration > MIN_ZOOM_IN);
      setCanZoomOut(duration < MAX_ZOOM_OUT);
    }

    setVisibleTimeStart(visibleTimeStart);
    setVisibleTimeEnd(visibleTimeEnd);
  };

  const handleZoomIn = () => {
    const middle = (visibleTimeStart + visibleTimeEnd) / 2;
    const newDuration = MIN_ZOOM_IN;

    setVisibleTimeStart(middle - newDuration / 2);
    setVisibleTimeEnd(middle + newDuration / 2);
    setCanZoomIn(false);
    setCanZoomOut(true);

    if (timelineRef.current) {
      timelineRef.current.scrollComponent.updateScrollCanvas();
    }
  };

  const handleZoomOut = () => {
    const middle = (visibleTimeStart + visibleTimeEnd) / 2;

    const newDuration = MAX_ZOOM_OUT;

    setVisibleTimeStart(middle - newDuration / 2);
    setVisibleTimeEnd(middle + newDuration / 2);
    setCanZoomOut(false);
    setCanZoomIn(true);
  };

  useEffect(() => {
    const duration = visibleTimeEnd - visibleTimeStart;
    if (duration > MIN_ZOOM_IN && !canZoomIn) setCanZoomIn(true);
    if (duration < MAX_ZOOM_OUT && !canZoomOut) setCanZoomOut(true);
  }, [visibleTimeStart, visibleTimeEnd, canZoomIn, canZoomOut]);

  const handleGoToToday = () => {
    const today = dayjs().valueOf();
    const duration = visibleTimeEnd - visibleTimeStart;

    setVisibleTimeStart(today - duration / 2);
    setVisibleTimeEnd(today + duration / 2);
  };

  const handleGoToCurrentMonth = () => {
    const today = dayjs();
    setVisibleTimeStart(today.startOf("month").valueOf());
    setVisibleTimeEnd(today.endOf("month").valueOf());
  };

  const toggleLotCollapse = (lotId) => {
    setCollapsedLots((prev) => {
      const newState = {
        ...prev,
        [lotId]: !prev[lotId],
      };

      // Mettre à jour immédiatement les groupes pour refléter le nouvel état
      forceUpdate();

      // Enregistrer l'état avec un délai pour s'assurer que la mise à jour est terminée
      setTimeout(() => savePlanningState(), 300);

      return newState;
    });
  };

  const handleLotAction = (action: string, lotId: string | null) => {
    console.log("Lot action:", action, lotId); // Débogage

    switch (action) {
      case "add-lot": {
        // Ajout d'accolades
        setLotForm({
          name: "",
          color: "#4CAF50",
        });
        setEditingLotId(null);
        setIsLotDialogOpen(true);
        break;
      }

      case "edit": {
        // Ajout d'accolades
        if (lotId) {
          const lot = groups.find((g) => g.id === lotId);
          if (lot) {
            setLotForm({
              name: lot.title.includes(". ")
                ? lot.title.split(". ")[1]
                : lot.title,
              color: lot.lotColor || "#4CAF50",
            });
            setEditingLotId(lotId);
            setIsLotDialogOpen(true);
          }
        }
        break;
      }

      case "delete": {
        // Ajout d'accolades
        if (lotId) {
          const lot = groups.find((g) => g.id === lotId);
          if (lot) {
            setItemToDelete({
              id: lotId,
              type: "lot",
              name: lot.title.includes(". ")
                ? lot.title.split(". ")[1]
                : lot.title,
            });
            setIsDeleteConfirmOpen(true);
          }
        }
        break;
      }

      case "add": {
        // Ajout d'accolades
        setParentLotId(lotId);
        setTaskForm({
          name: "",
          startDate: dayjs().format("YYYY-MM-DD"),
          endDate: dayjs().add(5, "days").format("YYYY-MM-DD"),
          progress: 0,
        });
        setEditingTaskId(null);
        setIsTaskDialogOpen(true);
        break;
      }
    }
  };

  const handleTaskAction = (action, taskId, lotId) => {
    console.log(`Action: ${action}, TaskID: ${taskId}, LotID: ${lotId}`);

    // Si taskId commence par "task-", supprimer ce préfixe
    const realTaskId = taskId.startsWith("task-")
      ? taskId.substring(5)
      : taskId;

    switch (action) {
      case "edit": {
        // Trouver la tâche à modifier dans les items
        const taskToEdit = items.find((item) => item.id === realTaskId);
        if (taskToEdit) {
          console.log("Tâche trouvée pour modification:", taskToEdit);
          console.log(
            "Progression actuelle de la tâche:",
            taskToEdit.progress || 0
          );
          // Pré-remplir le formulaire avec la valeur de progression existante
          setTaskForm({
            name: taskToEdit.title,
            startDate: dayjs(taskToEdit.start_time).format("YYYY-MM-DD"),
            endDate: dayjs(taskToEdit.end_time).format("YYYY-MM-DD"),
            progress: taskToEdit.progress || 0, // Récupérer la progression existante
          });

          // Stocker l'ID de la tâche pour la modification
          setEditingTaskId(realTaskId);
          setParentLotId(lotId);
          setIsTaskDialogOpen(true);
        } else {
          console.error("Tâche introuvable pour l'ID:", realTaskId);
        }
        break;
      }

      case "delete": {
        // Trouver la tâche à supprimer
        const taskToDelete = items.find((item) => item.id === realTaskId);
        if (taskToDelete) {
          console.log("Tâche trouvée pour suppression:", taskToDelete);

          // Confirmer la suppression
          setItemToDelete({
            id: realTaskId,
            type: "task",
            name: taskToDelete.title,
          });
          setIsDeleteConfirmOpen(true);
        } else {
          console.error("Tâche introuvable pour l'ID:", realTaskId);
        }
        break;
      }

      default:
        console.error("Action non reconnue:", action);
    }
  };

  const handleAddTaskClick = () => {
    // Réinitialiser le formulaire
    setTaskForm({
      name: "",
      startDate: dayjs().format("YYYY-MM-DD"),
      endDate: dayjs().add(5, "days").format("YYYY-MM-DD"),
      progress: 0,
    });

    // Important: réinitialiser ces valeurs
    setEditingTaskId(null);
    setParentLotId(null); // Forcer la sélection explicite d'un lot

    // Ouvrir la boîte de dialogue
    setIsTaskDialogOpen(true);
  };

  const handleAddCustomMarker = () => {
    const marker: CustomMarkerData = {
      id: `marker-${Date.now()}`,
      date: dayjs(newMarker.date).valueOf(),
      title: newMarker.title,
      type: newMarker.type,
      color: newMarker.color,
    };

    setCustomMarkers([...customMarkers, marker]);
    setIsMarkerDialogOpen(false);

    setNewMarker({
      date: dayjs().format("YYYY-MM-DD"),
      title: "Début des travaux",
      type: "start",
      color: "#22c55e",
    });
  };

  const handleEditMarker = (markerId) => {
    const marker = customMarkers.find((m) => m.id === markerId);
    if (marker) {
      setNewMarker({
        date: dayjs(marker.date).format("YYYY-MM-DD"),
        title: marker.title,
        type: marker.type,
        color: marker.color,
      });
      setEditingMarkerId(markerId);
      setIsMarkerDialogOpen(true);
    }
  };

  const handleDeleteMarker = (markerId) => {
    if (confirm("Voulez-vous vraiment supprimer ce marqueur ?")) {
      const updatedMarkers = customMarkers.filter((m) => m.id !== markerId);
      setCustomMarkers(updatedMarkers);

      localStorage.setItem(
        `project_${projectId}_markers`,
        JSON.stringify(updatedMarkers)
      );
    }
  };

  const handleSaveMarker = () => {
    let updatedMarkers = [];

    if (editingMarkerId) {
      updatedMarkers = customMarkers.map((m) =>
        m.id === editingMarkerId
          ? {
              ...m,
              date: dayjs(newMarker.date).valueOf(),
              title: newMarker.title,
              type: newMarker.type,
              color: newMarker.color,
            }
          : m
      );
      setEditingMarkerId(null);
    } else {
      const marker: CustomMarkerData = {
        id: `marker-${Date.now()}`,
        date: dayjs(newMarker.date).valueOf(),
        title: newMarker.title,
        type: newMarker.type,
        color: newMarker.color,
      };
      updatedMarkers = [...customMarkers, marker];
    }

    setCustomMarkers(updatedMarkers);

    localStorage.setItem(
      `project_${projectId}_markers`,
      JSON.stringify(updatedMarkers)
    );

    setIsMarkerDialogOpen(false);

    setNewMarker({
      date: dayjs().format("YYYY-MM-DD"),
      title: "Début des travaux",
      type: "start",
      color: "#22c55e",
    });
  };

  const handleSaveLot = () => {
    const newGroups = [...groups]; // Créer une copie des groupes pour la modification
    const newItems = [...items]; // Créer une copie des items pour la modification

    if (editingLotId) {
      // Modifier un lot existant
      const lotIndex = newGroups.findIndex((g) => g.id === editingLotId);
      if (lotIndex >= 0) {
        const newTitle = `${lotIndex + 1}. ${lotForm.name}`;
        newGroups[lotIndex] = {
          ...newGroups[lotIndex],
          title: newTitle,
          lotColor: lotForm.color,
        };

        // Mettre à jour les tâches associées à ce lot
        for (let i = 0; i < newGroups.length; i++) {
          if (newGroups[i].parentId === editingLotId) {
            newGroups[i].lotColor = lotForm.color;
          }
        }

        // Mettre à jour les items
        for (let i = 0; i < newItems.length; i++) {
          if (newItems[i].isHeader && newItems[i].group === editingLotId) {
            newItems[i].title = lotForm.name.toUpperCase();
            newItems[i].lotColor = lotForm.color;
          }

          // Mettre à jour les items de tâches
          const taskGroup = newGroups.find((g) => g.id === newItems[i].group);
          if (taskGroup && taskGroup.parentId === editingLotId) {
            newItems[i].lotColor = lotForm.color;
          }
        }
      }
    } else {
      // Créer un nouveau lot
      const newLotId = `lot-${Date.now()}`;
      const lotIndex = newGroups.filter((g) => !g.parentId).length;

      // Ajouter le lot
      newGroups.push({
        id: newLotId,
        title: `${lotIndex + 1}. ${lotForm.name}`,
        lotColor: lotForm.color,
      });

      // Ajouter un item d'en-tête pour le lot
      const newLotHeaderId = `lot-header-${Date.now()}`;
      newItems.push({
        id: newLotHeaderId,
        group: newLotId,
        title: lotForm.name.toUpperCase(),
        start_time: dayjs().startOf("day").valueOf(),
        end_time: dayjs().add(30, "days").endOf("day").valueOf(),
        className: `lot-header-bar lot-${lotIndex}`,
        lotColor: lotForm.color,
        canMove: false,
        canResize: false,
        isHeader: true,
      });
    }

    // Mettre à jour l'état avec les nouvelles données
    setGroups(newGroups);
    setItems(newItems);

    setIsLotDialogOpen(false);

    // IMPORTANT: Forcer une sauvegarde immédiatement après l'ajout/modification
    setTimeout(() => {
      if (window.blockAutoSave) window.blockAutoSave = false; // Désactiver le blocage si actif
      savePlanningState();
      forceUpdate(); // Forcer une mise à jour du rendu
    }, 300);
  };

  setTimeout(() => {
    // Forcer une sauvegarde explicite
    if (window.blockAutoSave) {
      window.blockAutoSave = false;
    }
    savePlanningState();
  }, 500);

  const debugState = () => {
    console.log("===== ÉTAT ACTUEL DU PLANNING =====");
    console.log("Groups:", JSON.stringify(groups, null, 2));
    console.log("Items:", JSON.stringify(items, null, 2));
    console.log("CollapsedLots:", JSON.stringify(collapsedLots, null, 2));
    console.log("================================");
  };

  const handleSaveTask = () => {
    if (!taskForm.name.trim()) {
      toast.error("Le nom de la tâche ne peut pas être vide");
      return;
    }

    if (!editingTaskId && !parentLotId) {
      toast.error("Veuillez sélectionner un lot pour la tâche");
      return;
    }

    const taskStartTime = dayjs(taskForm.startDate).startOf("day").valueOf();
    const taskEndTime = dayjs(taskForm.endDate).endOf("day").valueOf();

    // Trouver le lot parent et sa couleur - récupération fiable de la couleur
    const effectiveLotId =
      parentLotId ||
      (editingTaskId
        ? groups.find((g) => g.id === `task-${editingTaskId}`)?.parentId
        : null);

    const parentLot = groups.find((g) => g.id === effectiveLotId);

    if (!parentLot) {
      console.error("Lot parent introuvable");
      return;
    }

    // Récupérer EXPLICITEMENT la couleur du lot parent - point crucial
    const lotColor = parentLot.lotColor;
    console.log(
      `Utilisation de la couleur ${lotColor} du lot ${parentLot.title}`
    );

    if (editingTaskId) {
      // === MODIFICATION D'UNE TÂCHE EXISTANTE ===
      const taskGroupId = `task-${editingTaskId}`;

      // Mise à jour atomique pour éviter les pertes
      setItems((prevItems) => {
        return prevItems.map((item) => {
          if (item.id === editingTaskId) {
            return {
              ...item,
              group: taskGroupId,
              title: taskForm.name,
              start_time: taskStartTime,
              end_time: taskEndTime,
              lotColor: lotColor, // Forcer la couleur du lot parent
              progress: taskForm.progress,
              className: undefined,
            };
          }
          return item;
        });
      });

      setGroups((prevGroups) => {
        return prevGroups.map((group) => {
          if (group.id === taskGroupId) {
            const lotNum = parseInt(
              parentLot.title.match(/^(\d+)\./)?.[1] || "1"
            );
            const tasksInLot = prevGroups.filter(
              (g) => g.parentId === effectiveLotId
            );
            const taskPosition =
              tasksInLot.findIndex((g) => g.id === taskGroupId) + 1;

            return {
              ...group,
              title: `${lotNum}.${taskPosition} ${taskForm.name}`,
              parentId: effectiveLotId,
              lotColor: lotColor, // Forcer la couleur du lot parent
            };
          }
          return group;
        });
      });
    } else {
      // === CRÉATION D'UNE NOUVELLE TÂCHE ===
      const uniqueId = `trav-${Date.now()}-${Math.floor(
        Math.random() * 100000
      )}`;
      const taskGroupId = `task-${uniqueId}`;

      const lotNum = parseInt(parentLot.title.match(/^(\d+)\./)?.[1] || "1");
      const tasksInThisLot = groups.filter((g) => g.parentId === parentLotId);
      const nextTaskNum = tasksInThisLot.length + 1;

      // Créer le groupe pour la tâche sans référence à "item-X"
      const newTaskGroup = {
        id: taskGroupId,
        title: `${lotNum}.${nextTaskNum} ${taskForm.name}`,
        parentId: parentLotId,
        lotColor: lotColor, // Couleur explicite du lot parent
      };

      // Créer l'item pour la tâche sans référence à "item-X"
      const newTaskItem = {
        id: uniqueId,
        group: taskGroupId,
        title: taskForm.name,
        start_time: taskStartTime,
        end_time: taskEndTime,
        lotColor: lotColor, // Couleur explicite du lot parent
        progress: taskForm.progress,
        canMove: true,
        canResize: true,
      };

      // Ajouter aux états
      setGroups((prevGroups) => [...prevGroups, newTaskGroup]);
      setItems((prevItems) => [...prevItems, newTaskItem]);
    }

    // Le reste du code reste inchangé...
    setTaskForm({
      name: "",
      startDate: dayjs().format("YYYY-MM-DD"),
      endDate: dayjs().add(5, "days").format("YYYY-MM-DD"),
      progress: 0,
    });
    setEditingTaskId(null);
    setParentLotId(null);
    setIsTaskDialogOpen(false);

    setTimeout(() => {
      updateLotDurations();
      window.blockAutoSave = false;

      // Force explicitement une sauvegarde, même si c'est ensuite appelé par useEffect
      savePlanningState();

      // Force le rendu pour s'assurer que tout est à jour
      forceUpdate();

      // Afficher une confirmation à l'utilisateur
      toast.success(
        editingTaskId
          ? "Tâche modifiée avec succès"
          : "Tâche ajoutée avec succès"
      );
    }, 500);
  };

  setTimeout(() => {
    // Forcer une sauvegarde explicite
    if (window.blockAutoSave) {
      window.blockAutoSave = false;
    }
    savePlanningState();
  }, 500);

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "lot") {
      // Supprimer le lot et toutes ses tâches
      const lotId = itemToDelete.id;

      // Trouver toutes les tâches associées à ce lot
      const taskGroups = groups.filter((g) => g.parentId === lotId);
      const taskIds = taskGroups.map((g) => g.id);

      // Supprimer les groupes de tâches et le lot
      setGroups(groups.filter((g) => g.id !== lotId && g.parentId !== lotId));

      // Supprimer les items associés
      setItems(
        items.filter((item) => {
          return (
            !taskIds.includes(item.group) &&
            !(item.className && item.className.includes(`lot-header-${lotId}`))
          );
        })
      );
    } else {
      // Supprimer une tâche
      const taskId = itemToDelete.id;
      const taskGroupId = `task-${taskId}`;

      // Supprimer le groupe de la tâche
      setGroups(groups.filter((g) => g.id !== taskGroupId));

      // Supprimer l'item de la tâche
      setItems(items.filter((item) => item.id !== taskId));
    }

    // Sauvegarder l'état du planning
    setTimeout(savePlanningState, 100);

    setIsDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  // Fonction pour sauvegarder l'état complet du planning
  const savePlanningState = useCallback(() => {
    if (!projectId) return;

    // Sauvegarde forcée même avec blockAutoSave
    const planningData = {
      groups,
      items,
      collapsedLots,
      customMarkers,
      lastSaved: Date.now(), // Ajouter un timestamp
    };

    // Débloquer la sauvegarde si elle était bloquée
    if (window.blockAutoSave) {
      console.log("Forçage de la sauvegarde malgré blockAutoSave");
      window.blockAutoSave = false;
    }

    try {
      // Vérifier d'abord si les données sont valides
      if (!Array.isArray(groups) || !Array.isArray(items)) {
        console.error("Données invalides pour la sauvegarde:", {
          groups,
          items,
        });
        toast.error("Impossible de sauvegarder - données invalides");
        return;
      }

      // Tentative de sauvegarde avec logging
      const dataString = JSON.stringify(planningData);
      localStorage.setItem(`project_${projectId}_planning`, dataString);

      console.log("Sauvegarde réussie:", {
        groupsCount: groups.length,
        itemsCount: items.length,
        dataSize: `${Math.round(dataString.length / 1024)} Ko`,
      });

      // Optionnel: notifier la sauvegarde
      // toast.success("Planning sauvegardé", {autoClose: 1000});
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error(
        "Erreur de sauvegarde: " + (error.message || "Erreur inconnue")
      );
    }
  }, [groups, items, collapsedLots, customMarkers, projectId]);

  // Fonction pour charger l'état du planning
  const loadPlanningState = useCallback(() => {
    if (!projectId) return false;

    try {
      const savedData = localStorage.getItem(`project_${projectId}_planning`);
      if (savedData) {
        try {
          const planningData = JSON.parse(savedData);
          // Vérifier si les données sauvegardées sont valides et complètes
          if (planningData.groups && planningData.groups.length > 0) {
            console.log(
              "Chargement des données du planning depuis le stockage local"
            );
            setGroups(planningData.groups);
            setItems(planningData.items || []);
            setCollapsedLots(planningData.collapsedLots || {});
            setCustomMarkers(planningData.customMarkers || []);
            return true;
          }
        } catch (e) {
          console.error(
            "Erreur lors du chargement des données du planning:",
            e
          );
        }
      }

      // Si aucune donnée sauvegardée n'est disponible ET que des données descriptif sont présentes,
      // alors seulement utiliser les données du descriptif comme fallback
      if (descriptifData && descriptifData.length > 0) {
        console.log(
          "Aucune donnée sauvegardée, utilisation des données du descriptif"
        );
        return false; // Laisse le useEffect de descriptifData générer le planning
      }

      return false;
    } catch (e) {
      console.error("Erreur lors du chargement des données du planning:", e);
      return false;
    }
  }, [projectId, descriptifData]);

  useEffect(() => {
    // Ajouter une condition pour éviter les appels inutiles
    if (groups.length === 0 || items.length === 0 || window.blockAutoSave)
      return;

    const savingTimeout = setTimeout(() => {
      savePlanningState();
    }, 1000);

    return () => clearTimeout(savingTimeout);
  }, [groups, items, collapsedLots, customMarkers, savePlanningState]);

  const fixItemGroupAssociations = () => {
    console.log("Correction des associations items/groupes...");

    // S'assurer que chaque item a le bon identifiant de groupe
    const updatedItems = items.map((item) => {
      // Pour les items de tâche (non header)
      if (!item.isHeader) {
        const taskGroupId = `task-${item.id}`;
        const taskGroup = groups.find((g) => g.id === taskGroupId);

        // Si le groupe existe mais que l'item pointe vers le mauvais groupe
        if (taskGroup && item.group !== taskGroupId) {
          console.log(
            `Correction: item ${item.id} associé au groupe ${taskGroupId}`
          );
          return {
            ...item,
            group: taskGroupId,
            lotColor: taskGroup.lotColor,
          };
        }
      }
      return item;
    });

    setItems(updatedItems);
    setTimeout(savePlanningState, 300);
  };

  useEffect(() => {
    if (groups.length > 0 && items.length > 0) {
      // Vérifier si une correction est vraiment nécessaire
      const needsCorrection = items.some((item) => {
        // Ignorer les items d'en-tête
        if (item.isHeader) return false;

        const taskGroupId = `task-${item.id}`;
        const taskGroup = groups.find((g) => g.id === taskGroupId);

        // Une correction est nécessaire seulement si le groupe existe
        // mais que l'item pointe vers le mauvais groupe
        return taskGroup && item.group !== taskGroupId;
      });

      if (needsCorrection) {
        console.log("Correction des associations items/groupes nécessaire");
        fixItemGroupAssociations();
      }
    }
  }, [groups, items]);

  // Ajouter cette fonction pour mettre à jour les durées des lots
  const updateLotDurations = () => {
    console.log("Mise à jour des durées des lots...");

    // Protection contre les appels récursifs
    if (window.isUpdatingLotDurations) {
      console.log("Mise à jour déjà en cours, ignorée");
      return;
    }

    try {
      window.isUpdatingLotDurations = true;

      // Structure pour stocker les plages de dates min/max par lot
      const lotRanges = {};

      // Parcourir toutes les tâches pour déterminer les plages de dates des lots
      items
        .filter((item) => !item.isHeader)
        .forEach((item) => {
          const taskGroup = groups.find((g) => g.id === item.group);
          if (!taskGroup || !taskGroup.parentId) return;

          const lotId = taskGroup.parentId;

          if (!lotRanges[lotId]) {
            lotRanges[lotId] = {
              min: item.start_time,
              max: item.end_time,
            };
          } else {
            lotRanges[lotId].min = Math.min(
              lotRanges[lotId].min,
              item.start_time
            );
            lotRanges[lotId].max = Math.max(
              lotRanges[lotId].max,
              item.end_time
            );
          }
        });

      // Vérifier si une mise à jour est nécessaire
      let needsUpdate = false;
      const updatedItems = items.map((item) => {
        if (item.isHeader && lotRanges[item.group]) {
          // CORRECTION: Utiliser exactement les mêmes dates que les tâches, sans marge
          const newMin = lotRanges[item.group].min; // Suppression de subtract(1, 'day')
          const newMax = lotRanges[item.group].max; // Suppression de add(1, 'day')

          if (item.start_time !== newMin || item.end_time !== newMax) {
            needsUpdate = true;
            return {
              ...item,
              start_time: newMin,
              end_time: newMax,
            };
          }
        }
        return item;
      });

      if (needsUpdate) {
        setItems(updatedItems);
      }
    } finally {
      window.isUpdatingLotDurations = false;
    }
  };

  // Ajouter cette fonction pour vérifier et réparer les associations automatiquement
  const verifyAndRepairTaskAssociations = useCallback(() => {
    // Vérifier si certaines tâches ne sont pas correctement affichées
    const needsRepair = items.some((item) => {
      if (item.isHeader) return false;

      // Vérifier si l'élément DOM existe pour cette tâche
      const taskElement = document.querySelector(`[data-id="${item.id}"]`);
      if (!taskElement) return true;

      return false;
    });

    if (needsRepair) {
      console.log("Réparation automatique des tâches non visibles");
      // Appliquer simplement un forceUpdate pour rafraîchir le rendu
      forceUpdate();

      // Si les problèmes persistent, appliquer une réparation douce
      setTimeout(() => {
        // Màj des durées des lots sans recréer toute la structure
        updateLotDurations();
      }, 300);
    }
  }, [items, groups]);

  // Ajouter cet useEffect pour vérifier automatiquement après chaque action
  useEffect(() => {
    const timer = setTimeout(verifyAndRepairTaskAssociations, 300);
    return () => clearTimeout(timer);
  }, [items, groups]);

  // Déplacer la fonction repairPlanningStructure ici
  const repairPlanningStructure = () => {
    window.blockAutoSave = true;
    console.log("Réparation complète de la structure du planning...");

    // 1. Séparer les lots et les tâches
    const lotsOnly = groups.filter((g) => !g.parentId);

    // 2. Réinitialiser les associations
    const newGroups = [];
    const newItems = [];
    const usedIds = new Set();

    // 3. Recréer les lots
    lotsOnly.forEach((lot, lotIndex) => {
      const lotId = lot.id;
      const lotNum = lotIndex + 1;
      // Préserver la couleur du lot original ou en assigner une nouvelle si nécessaire
      const lotColor = lot.lotColor || lotColors[lotIndex % lotColors.length];

      // Ajouter le lot
      newGroups.push({
        id: lotId,
        title: `${lotNum}. ${lot.title.split(". ")[1] || lot.title}`,
        lotColor: lotColor,
      });

      // Ajouter l'en-tête du lot
      const headerId = `header-${lotId}`;
      const headerItem = items.find((i) => i.group === lotId && i.isHeader) || {
        id: headerId,
        start_time: dayjs().valueOf(),
        end_time: dayjs().add(30, "days").valueOf(),
      };

      newItems.push({
        ...headerItem,
        id: headerId,
        group: lotId,
        title:
          lot.title.split(". ")[1]?.toUpperCase() || lot.title.toUpperCase(),
        lotColor: lotColor,
        canMove: false,
        canResize: false,
        isHeader: true,
        className: `lot-header-bar lot-${lotIndex % lotColors.length}`,
      });

      // 4. Trouver toutes les tâches de ce lot
      const lotTasks = groups.filter((g) => g.parentId === lotId);

      // 5. Recréer les tâches avec des associations correctes
      lotTasks.forEach((taskGroup, taskIndex) => {
        // IMPORTANT: Essayer de préserver l'ID original de la tâche si possible
        const originalTaskId = taskGroup.id.startsWith("task-")
          ? taskGroup.id.substring(5)
          : null;

        // Trouver l'item correspondant à cette tâche
        const existingTask = originalTaskId
          ? items.find((item) => item.id === originalTaskId)
          : null;

        const taskId =
          originalTaskId ||
          `trav-${Date.now()}-${taskIndex}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;
        const taskGroupId = `task-${taskId}`;

        // Re-numéroter correctement la tâche
        const taskNum = taskIndex + 1;
        const taskName =
          taskGroup.title.split(" ").slice(1).join(" ") || `Tâche ${taskNum}`;
        const taskTitle = `${lotNum}.${taskNum} ${taskName}`;

        // Ajouter le groupe de la tâche - IMPORTANT: Conserver la couleur du lot parent
        newGroups.push({
          id: taskGroupId,
          title: taskTitle,
          parentId: lotId,
          lotColor: lotColor, // Utiliser la même couleur que le lot parent
        });

        // Ajouter l'item de la tâche en préservant ses propriétés d'origine si possible
        newItems.push({
          ...(existingTask || {}),
          id: taskId,
          group: taskGroupId,
          title: taskName,
          start_time: existingTask?.start_time || dayjs().valueOf(),
          end_time: existingTask?.end_time || dayjs().add(5, "days").valueOf(),
          lotColor: lotColor, // IMPORTANT: Utiliser la même couleur que le lot parent
          className: `item-${lotColors.indexOf(lotColor) % lotColors.length}`, // Synchroniser la classe avec la couleur
          canMove: true,
          canResize: true,
        });
      });
    });

    // 6. Remplacer complètement les états
    setGroups(newGroups);
    setItems(newItems);

    // 7. Forcer une mise à jour des durées des lots
    setTimeout(() => {
      window.blockAutoSave = false;
      updateLotDurations();
      savePlanningState(); // IMPORTANT: Sauvegarder explicitement après réparation
      forceUpdate();
      toast.success("Structure du planning réparée avec succès");
    }, 1000);
  };

  // Ajouter cette fonction pour vérifier l'état de la sauvegarde
  const verifyAndDebugStorage = () => {
    try {
      const savedData = localStorage.getItem(`project_${projectId}_planning`);
      if (savedData) {
        const planningData = JSON.parse(savedData);
        console.log(
          "État actuel du stockage:",
          planningData.groups.length,
          "groupes,",
          planningData.items.length,
          "items"
        );
        toast.info(
          `Planning enregistré: ${planningData.groups.length} lots, ${planningData.items.length} items`
        );
      } else {
        console.log("Aucune donnée dans le stockage");
        toast.warning("Aucune donnée de planning enregistrée");
      }
    } catch (e) {
      console.error("Erreur lors de la vérification du stockage:", e);
      toast.error("Erreur lors de la vérification du planning");
    }
  };

  const updateTaskProgress = (taskId, newProgress) => {
    // Mettre à jour la progression de la tâche
    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === taskId) {
          return { ...item, progress: newProgress };
        }
        return item;
      });
    });
    
    // Sauvegarder l'état du planning
    setTimeout(() => {
      window.blockAutoSave = false;
      savePlanningState();
    }, 300);
  };

  const groupRenderer = ({ group }) => {
    try {
      if (!group.parentId) {
        const isCollapsed = collapsedLots[group.id];
        const lotId = group.id;
        const lotColor = group.lotColor;

        return (
          <div
            className="lot-sidebar-header"
            style={{
              backgroundColor: `${lotColor}20`,
              borderLeft: `4px solid ${lotColor}`,
            }}>
            {sidebarCollapsed ? (
              <div
                className="lot-number-indicator"
                style={{ backgroundColor: lotColor }}>
                {group.title.split(".")[0]}
              </div>
            ) : (
              <>
                <div className="lot-title-container">
                  <button
                    className="collapse-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLotCollapse(lotId);
                    }}>
                    {isCollapsed ? (
                      <ChevronRight size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                  <span className="lot-title">{group.title}</span>
                </div>
                <div className="lot-actions">
                  <button
                    className="action-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleLotAction("edit", lotId);
                    }}>
                    <Edit size={14} />
                  </button>
                  <button
                    className="action-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLotAction("delete", lotId);
                    }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        );
      }

      if (group.parentId) {
        const taskId = group.id;
        const lotId = group.parentId;
        const lotColor = group.lotColor;

        return (
          <div className="task-sidebar-row">
            {sidebarCollapsed ? (
              <div className="task-mini-indicator">
                <div
                  className="task-number"
                  style={{
                    borderLeftColor: lotColor,
                    backgroundColor: `${lotColor}10`,
                    color: lotColor,
                  }}>
                  {group.title.split(" ")[0]}
                </div>
              </div>
            ) : (
              <>
                <div
                  className="task-sidebar-indicator"
                  style={{ backgroundColor: lotColor }}></div>
                <span className="task-title">{group.title}</span>
                <div className="task-actions">
                  <button
                    className="action-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleTaskAction("edit", taskId, lotId);
                    }}>
                    <Edit size={12} />
                  </button>
                  <button
                    className="action-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskAction("delete", taskId, lotId);
                    }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </>
            )}
          </div>
        );
      }

      return <div>{group.title}</div>;
    } catch (error) {
      console.error("Erreur dans groupRenderer:", error);
      return <div>{group.title || "Groupe"}</div>;
    }
  };

  const itemRenderer = ({
    item,
    itemContext,
    getItemProps,
    getResizeProps,
  }) => {
    const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
    const { style, key, ...otherProps } = getItemProps();
    console.log(
      `Rendu de l'item ${item.id}, progression: ${item.progress || 0}%`
    );

    const isLotItem =
      item.isHeader === true ||
      (item.className && item.className.includes("lot-header-bar"));
    const isSelected = selectedItemId === item.id;
    const itemClassName = isLotItem
      ? "timeline-lot-item"
      : "timeline-task-item";

    const itemColor = item.lotColor;

    // Calculer la progression du lot si c'est un en-tête
    let progress = item.progress || 0;
    if (isLotItem) {
      // Trouver toutes les tâches associées à ce lot
      const lotTasks = items.filter((task) => {
        const taskGroup = groups.find((g) => g.id === task.group);
        return taskGroup && taskGroup.parentId === item.group;
      });

      // Calculer la progression moyenne du lot
      if (lotTasks.length > 0) {
        progress = Math.round(
          lotTasks.reduce((sum, task) => sum + (task.progress || 0), 0) /
            lotTasks.length
        );
      }
    }

    // Style personnalisé amélioré avec indicateur de sélection
    const customStyle = {
      position: "absolute",
      left: `${itemContext.dimensions.left}px`,
      width: `${itemContext.dimensions.width}px`,
      top: `${itemContext.dimensions.top + 5}px`,
      height: "22px",
      backgroundColor: itemColor,
      color: "white",
      cursor: isLotItem ? "default" : "move",
      borderRadius: "4px",

      boxShadow: isSelected
        ? `0 0 0 2px white, 0 0 0 4px ${itemColor}`
        : "0 1px 3px rgba(0,0,0,0.2)",
      zIndex: isSelected ? 90 : isLotItem ? 70 : 80,
      opacity: isLotItem ? 0.8 : 1,
      border: isSelected ? "2px solid black" : "1px solid rgba(0,0,0,0.2)",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      fontSize: "12px",
      
      transition: "box-shadow 0.2s, transform 0.1s",
      transform: isSelected ? "translateY(-1px)" : "none",

    };
    // Gestionnaire de double-clic pour éditer la progression
    const handleTaskProgressEdit = (e) => {
      e.stopPropagation();
      if (!isLotItem) {
        // Demander la nouvelle valeur de progression
        const newProgress = prompt(
          `Progression pour "${item.title}" (0-100%):`,
          String(progress || 0)
        );
        if (newProgress !== null) {
          const progressValue = parseInt(newProgress, 10);
          if (
            !isNaN(progressValue) &&
            progressValue >= 0 &&
            progressValue <= 100
          ) {
            updateTaskProgress(item.id, progressValue);
          } else {
            alert("Veuillez saisir une valeur entre 0 et 100");
          }
        }
      }
    };

    const roundedProgress = Math.round(progress / 5) * 5;
const progressClass = `progress-${roundedProgress}`;

// Remplacer la partie de rendu dans itemRenderer

return (
  <div
    key={key}
    style={customStyle}
    className={`${itemClassName} ${
      item.className || ""
    } timeline-item-border ${progressClass} ${isSelected ? "selected" : ""}`}
    {...otherProps}
    onClick={(e) => {
      e.stopPropagation();
      setSelectedItemId(item.id);
    }}
    onDoubleClick={handleTaskProgressEdit}
    data-tooltip-id="task-tooltip"
    data-tooltip-html={`<div class="tooltip-title">${item.title}</div>
      <div class="tooltip-dates">Début: ${dayjs(item.start_time).format(
        "D MMMM"
      )}<br>
      Fin: ${dayjs(item.end_time).format("D MMMM")}</div>
      <div class="tooltip-progress">Progression: ${progress}%</div>
      <div class="tooltip-help">Double-cliquez pour modifier la progression</div>`}>
    {/* Barre de progression avec stratégie inviolable */}
    <div
      className="super-visible-progress"
      style={{
        width: `${progress}%`,
        backgroundColor: `${itemColor}80`, // Version semi-transparente de la couleur de l'item
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.2) 10px, rgba(255,255,255,0.2) 20px)`, // Motif strié pour meilleure visibilité
      }}
    />
    {/* Poignées de redimensionnement */}
    {!isLotItem && itemContext.useResizeHandle && (
      <>
        <div
          {...leftResizeProps}
          className="custom-resize-handle left-resize-handle"
        />
        <div
          {...rightResizeProps}
          className="custom-resize-handle right-resize-handle"
        />
      </>
    )}

    {/* Contenu avec titre ET pourcentage */}
    <div className="task-content-container">
      <span className="task-title-text">{item.title}</span>

      <span className="task-progress-indicator">{progress}%</span>
    </div>
  </div>
);
}  // Close the itemRenderer function

  useEffect(() => {
    //const cleanup = removeUnwantedElements();

    return () => {
      //cleanup();
    };
  }, []);

  // Filtrer les groupes et items avant de les passer à Timeline
  const visibleGroups = groups.filter(
    (g) =>
      !g.parentId || // C'est un lot
      !collapsedLots[g.parentId] // Ou c'est une tâche dont le lot parent n'est pas replié
  );

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSidebar}
            title={
              sidebarCollapsed
                ? "Déplier la barre latérale"
                : "Replier la barre latérale"
            }>
            {sidebarCollapsed ? (
              <PanelLeft size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={!canZoomIn}
            title={
              !canZoomIn ? "Zoom maximum atteint (vue journalière)" : "Zoomer"
            }>
            <ZoomIn size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={!canZoomOut}
            title={
              !canZoomOut ? "Zoom minimum atteint (vue annuelle)" : "Dézoomer"
            }>
            <ZoomOut size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleGoToToday}>
            <Calendar size={16} className="mr-1" />
            Aujourd'hui
          </Button>

          <Popover
            open={isMarkerDialogOpen}
            onOpenChange={setIsMarkerDialogOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <div className="flex items-center">
                  <Flag size={16} className="mr-1" />
                  Marqueur
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 z-[1000]" align="start">
              <div className="grid gap-4 py-4">
                <div>
                  <h4 className="font-medium mb-2">Ajouter un marqueur</h4>
                  <p className="text-sm text-muted-foreground">
                    Créez un marqueur pour indiquer une date importante.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="marker-type">Type</Label>
                  <select
                    id="marker-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newMarker.type}
                    onChange={(e) =>
                      setNewMarker({
                        ...newMarker,
                        type: e.target.value as "start" | "end" | "other",
                      })
                    }>
                    <option value="start">Début des travaux</option>
                    <option value="end">Réception</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="marker-date">Date</Label>
                  <Input
                    id="marker-date"
                    type="date"
                    value={newMarker.date}
                    onChange={(e) =>
                      setNewMarker({ ...newMarker, date: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="marker-title">Titre</Label>
                  <Input
                    id="marker-title"
                    placeholder="Titre  ex. début d’une tache …"
                    value={newMarker.title}
                    onChange={(e) =>
                      setNewMarker({ ...newMarker, title: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Couleur</Label>
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="marker-color"
                        value="#ef4444"
                        checked={newMarker.color === "#ef4444"}
                        onChange={() =>
                          setNewMarker({ ...newMarker, color: "#ef4444" })
                        }
                        className="mr-2"
                      />
                      <div className="w-4 h-4 rounded-full bg-red-500 mr-1"></div>
                      <span>Rouge</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="marker-color"
                        value="#22c55e"
                        checked={newMarker.color === "#22c55e"}
                        onChange={() =>
                          setNewMarker({ ...newMarker, color: "#22c55e" })
                        }
                        className="mr-2"
                      />
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-1"></div>
                      <span>Vert</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="marker-color"
                        value="#3b82f6"
                        checked={newMarker.color === "#3b82f6"}
                        onChange={() =>
                          setNewMarker({ ...newMarker, color: "#3b82f6" })
                        }
                        className="mr-2"
                      />
                      <div className="w-4 h-4 rounded-full bg-blue-500 mr-1"></div>
                      <span>Bleu</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="marker-color"
                        value="#eab308"
                        checked={newMarker.color === "#eab308"}
                        onChange={() =>
                          setNewMarker({ ...newMarker, color: "#eab308" })
                        }
                        className="mr-2"
                      />
                      <div className="w-4 h-4 rounded-full bg-yellow-500 mr-1"></div>
                      <span>Jaune</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="marker-color"
                        value="#9c27b0"
                        checked={newMarker.color === "#9c27b0"}
                        onChange={() =>
                          setNewMarker({ ...newMarker, color: "#9c27b0" })
                        }
                        className="mr-2"
                      />
                      <div className="w-4 h-4 rounded-full bg-purple-500 mr-1"></div>
                      <span>Violet</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="marker-color"
                        value="#8d6e63"
                        checked={newMarker.color === "#8d6e63"}
                        onChange={() =>
                          setNewMarker({ ...newMarker, color: "#8d6e63" })
                        }
                        className="mr-2"
                      />
                      <div className="w-4 h-4 rounded-full bg-amber-800 mr-1"></div>
                      <span>Marron</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsMarkerDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSaveMarker}>
                    {editingMarkerId ? "Enregistrer" : "Ajouter"}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddTaskClick()}>
            <Plus size={16} className="mr-1" />
            Ajouter une tâche
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleLotAction("add-lot", null)}>
            <Plus size={16} className="mr-1" />
            Ajouter un lot
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (descriptifData && descriptifData.length > 0) {
                // Bloquer la sauvegarde automatique
                window.blockAutoSave = true;

                // Effacer les données actuelles
                setGroups([]);
                setItems([]);

                // Forcer le déclenchement du useEffect qui traite descriptifData
                // en modifiant une valeur qui va déclencher sa dépendance
                toast.info("Synchronisation du planning avec le descriptif...");

                // Utiliser un temporary state pour forcer la mise à jour
                const tempId = `refresh-${Date.now()}`;
                localStorage.setItem(`project_${projectId}_temp`, tempId);
                localStorage.removeItem(`project_${projectId}_temp`);

                // Au lieu de dupliquer la logique, déclencher le useEffect
                // qui utilise descriptifData comme dépendance
                setTimeout(() => {
                  forceUpdate();
                }, 200);
              } else {
                toast.info("Aucune donnée dans le descriptif à synchroniser");
              }
            }}
            title="Forcer la synchronisation avec le descriptif">
            <CalendarSync size={16} className="mr-1" />
            Synchroniser
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={repairPlanningStructure}
            title="Réparer la structure du planning">
            <RefreshCcw size={16} className="mr-1" />
            Réparer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Ouvrir une boîte de dialogue avec options
              setIsExportDialogOpen(true);
            }}>
            <FileText size={16} className="mr-1" />
            Exporter PDF
          </Button>
        </div>
      </div>

      <div
        className="content-planning"
        style={{
          height: "calc(100vh - 200px)",
          position: "relative",
          overflow: "auto",
          overflowX: "hidden",
        }}>
        <div
          className="timeline-container"
          style={{
            height: "auto",
            minHeight: "100%",
            position: "relative",
          }}>
          {/* Ajouter le redimensionneur de sidebar */}
          <div
            className={`sidebar-resizer ${isResizing ? "resizing" : ""}`}
            onMouseDown={handleResizeStart}
            style={{ left: `${sidebarWidth}px` }}
          />
          {groups.length > 0 && items.length > 0 ? (
            <>
              <Timeline
                groups={visibleGroups}
                items={items}
                visibleTimeStart={visibleTimeStart}
                visibleTimeEnd={visibleTimeEnd}
                onTimeChange={(
                  visibleTimeStart,
                  visibleTimeEnd,
                  updateScrollCanvas
                ) => {
                  const newDuration = visibleTimeEnd - visibleTimeStart;
                  const currentDuration = visibleTimeEnd - visibleTimeStart;

                  if (Math.abs(newDuration - currentDuration) < 1000) {
                    handleTimeChange(visibleTimeStart, visibleTimeEnd);
                  } else {
                    updateScrollCanvas(visibleTimeStart, visibleTimeEnd);
                  }
                }}
                canMove={true}
                canResize="both"
                stackItems={true}
                lineHeight={40}
                itemHeightRatio={0.75}
                sidebarWidth={sidebarWidth}
                minZoom={MIN_ZOOM_IN}
                maxZoom={MAX_ZOOM_OUT}
                onItemMove={handleItemMove}
                onItemResize={handleItemResize}
                traditionalZoom={false}
                itemRenderer={itemRenderer}
                groupRenderer={groupRenderer}
                headerLabelFormats={{
                  yearShort: (date) => dayjs(date).format("YY"),
                  yearLong: (date) => dayjs(date).format("YYYY"),
                  monthShort: (date) => {
                    return dayjs(date).locale("fr").format("MMM");
                  },
                  monthMedium: (date) => dayjs(date).locale("fr").format("MMM"),
                  monthLong: (date) => dayjs(date).locale("fr").format("MMM"),
                  dayShort: (date) => dayjs(date).format("D"),
                  dayMedium: (date) => dayjs(date).format("D"),
                  dayLong: (date) => dayjs(date).format("D"),
                  hourShort: (date) => dayjs(date).format("HH"),
                  hourMedium: (date) => dayjs(date).format("HH:mm"),
                  hourLong: (date) => dayjs(date).format("HH:mm"),
                  minuteShort: (date) => dayjs(date).format("mm"),
                  minuteLong: (date) => dayjs(date).format("HH:mm"),
                }}
                subHeaderLabelFormats={{
                  yearShort: (date) => dayjs(date).format("YY"),
                  yearLong: (date) => dayjs(date).format("YYYY"),
                  monthShort: (date) => dayjs(date).locale("fr").format("MMM"),
                  monthMedium: (date) => dayjs(date).locale("fr").format("MMM"),
                  monthLong: (date) => dayjs(date).locale("fr").format("MMM"),
                }}
                timeSteps={{
                  second: 1,
                  minute: 1,
                  hour: 1,
                  day: 1,
                  month: 1,
                  year: 1,
                }}
                horizontalLineClassNamesForGroup={() => ["calendar-day"]}
                className={`react-calendar-timeline ${timelineViewMode}`}
                onClickItem={(itemId) => setSelectedItemId(itemId)}
                onClick={() => setSelectedItemId(null)} // Désélectionne quand on clique sur le fond
              >
                <TimelineMarkers>
                  <CustomMarker date={dayjs().startOf("day").valueOf()}>
                    {({ styles }) => {
                      const leftPos =
                        typeof styles.left === "string"
                          ? parseFloat(styles.left)
                          : styles.left;

                      return (
                        <div>
                          <div
                            className="today-line-marker"
                            style={{
                              position: "absolute",
                              backgroundColor: "#FF4081",
                              width: "1px",
                              left: `${leftPos}px`,
                              height: "100%",
                              zIndex: 80,
                              transform: "none",
                            }}
                          />

                          <div
                            className="today-label-content"
                            style={{
                              position: "absolute",
                              top: "0px",
                              left: `${leftPos}px`,
                              transform: "translateX(-50%)",
                              zIndex: 85,
                              background: "#FF4081",
                              color: "white",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              lineHeight: "1.2",
                              pointerEvents: "none",
                            }}>
                            <div>Aujourd'hui</div>
                            <div>{dayjs().locale("fr").format("D MMM")}</div>
                          </div>
                        </div>
                      );
                    }}
                  </CustomMarker>

                  {customMarkers.map((marker) => (
                    <CustomMarker key={marker.id} date={marker.date}>
                      {({ styles }) => (
                        <div>
                          <div
                            className="custom-line-marker"
                            style={{
                              ...styles,
                              backgroundColor: marker.color,
                              width: "1px",
                              left: `calc(${styles.left}px - 0px)`,
                              height: "90%",
                              zIndex: 60,
                            }}
                          />

                          <div
                            className="custom-marker-label"
                            style={{
                              position: "absolute",
                              top: "0px",
                              transform: "translateX(0%) rotate(90deg)",
                              transformOrigin: "left top",
                              left: styles.left,
                              zIndex: 100,
                              background: marker.color,
                              color: "white",
                              padding: "3px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              lineHeight: "1.2",
                              width: "max-content",
                              fontWeight: "bold",
                              marginTop: "0px",
                              marginLeft: "-0px",
                              opacity: 0.85,
                            }}>
                            {marker.title}
                            <div className="marker-actions">
                              <button
                                className="marker-action-button"
                                onClick={() => handleEditMarker(marker.id)}
                                title="Modifier">
                                <Edit size={12} color="white" />
                              </button>
                              <button
                                className="marker-action-button"
                                onClick={() => handleDeleteMarker(marker.id)}
                                title="Supprimer">
                                <Trash2 size={12} color="white" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CustomMarker>
                  ))}
                </TimelineMarkers>
              </Timeline>
            </>
          ) : (
            <div>Aucune donnée disponible</div>
          )}
        </div>
      </div>
      <Tooltip id="task-tooltip" className="tooltip-custom" />

      {/* Dialog pour ajouter/modifier un lot */}
      <Dialog open={isLotDialogOpen} onOpenChange={setIsLotDialogOpen}>
        <DialogOverlay className="fixed inset-0 bg-black/40 z-[1000]" />
        <DialogContent
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-80 max-w-md z-[1001]"
          aria-describedby="lot-dialog-description">
          <DialogHeader>
            <DialogTitle>
              {editingLotId ? "Modifier le lot" : "Ajouter un lot"}
            </DialogTitle>
            <DialogDescription id="lot-dialog-description">
              {editingLotId
                ? "Modifiez les informations du lot"
                : "Ajoutez un nouveau lot au planning"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="lot-name">Nom du lot</Label>
              <Input
                id="lot-name"
                placeholder="Nom du lot"
                value={lotForm.name}
                onChange={(e) =>
                  setLotForm({ ...lotForm, name: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Couleur du lot</Label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded">
                {lotColors.map((color) => (
                  <label
                    key={color}
                    className="flex items-center cursor-pointer mb-2 mr-2">
                    <input
                      type="radio"
                      name="lot-color"
                      value={color}
                      checked={lotForm.color === color}
                      onChange={() => setLotForm({ ...lotForm, color: color })}
                      className="sr-only" // Cacher la radio native pour un meilleur design
                    />
                    <div
                      className={`w-7 h-7 rounded-full transition-all ${
                        lotForm.color === color
                          ? "ring-2 ring-offset-2 ring-black"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}></div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLotDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveLot}>
              {editingLotId ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour ajouter/modifier une tâche */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogOverlay className="fixed inset-0 bg-black/40 z-[1000]" />
        <DialogContent
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-80 max-w-md z-[1001]"
          aria-describedby="task-dialog-description">
          <DialogHeader>
            <DialogTitle>
              {editingTaskId ? "Modifier la tâche" : "Ajouter une tâche"}
            </DialogTitle>
            <DialogDescription id="task-dialog-description">
              {editingTaskId
                ? "Modifiez les informations de la tâche"
                : "Ajoutez une nouvelle tâche au planning"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-lot" className="text-sm font-medium">
                Lot parent <span className="text-red-500">*</span>
              </Label>
              <select
                id="task-lot"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={parentLotId || ""}
                onChange={(e) => setParentLotId(e.target.value)}
                required>
                <option value="">Sélectionnez un lot</option>
                {groups
                  .filter((g) => !g.parentId) // Filtrer pour n'avoir que les lots (pas les tâches)
                  .map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.title}
                    </option>
                  ))}
              </select>
              {!parentLotId && (
                <p className="text-sm text-red-500">
                  Veuillez sélectionner un lot
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task-name">Nom de la tâche</Label>
              <Input
                id="task-name"
                placeholder="Nom de la tâche"
                value={taskForm.name}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, name: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task-start-date">Date de début</Label>
              <Input
                id="task-start-date"
                type="date"
                value={taskForm.startDate}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, startDate: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task-end-date">Date de fin</Label>
              <Input
                id="task-end-date"
                type="date"
                value={taskForm.endDate}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, endDate: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="progress">Progression: {taskForm.progress}%</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="progress"
                min={0}
                max={100}
                step={5}
                value={[taskForm.progress]}
                onValueChange={(value) =>
                  setTaskForm({ ...taskForm, progress: value[0] })
                }
                className="flex-1"
              />
              <div className="w-12 text-center font-medium">
                {taskForm.progress}%
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTaskDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveTask}>
              {editingTaskId ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour confirmation de suppression */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogOverlay className="fixed inset-0 bg-black/40 z-[1000]" />
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-80 max-w-md z-[1001]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {itemToDelete?.type === "lot"
                  ? `Êtes-vous sûr de vouloir supprimer le lot "${itemToDelete?.name}" et toutes ses tâches ?`
                  : `Êtes-vous sûr de vouloir supprimer la tâche "${itemToDelete?.name}" ?`}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour exporter en PDF */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogOverlay className="fixed inset-0 bg-black/40 z-[1000]" />
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-[1200px] h-[90vh] z-[1001] overflow-auto">
          <DialogHeader>
            <DialogTitle>Exporter le planning</DialogTitle>
            <DialogDescription>
              Configurez les options d'exportation du planning en PDF
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-[260px_1fr] gap-4">
            {/* Panneau de gauche: options */}
            <div className="border-r pr-4">
              <h3 className="font-medium mb-4">Format</h3>
              <div className="mb-4">
                <Label>Format du papier</Label>
                <Select
                  value={exportOptions.paperFormat}
                  onValueChange={(value) =>
                    setExportOptions((prev) => ({
                      ...prev,
                      paperFormat: value,
                    }))
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Format du papier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="A3">A3</SelectItem>
                    <SelectItem value="Letter">Letter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <Label>Orientation</Label>
                <Select
                  value={exportOptions.orientation}
                  onValueChange={(value) =>
                    setExportOptions((prev) => ({
                      ...prev,
                      orientation: value as "portrait" | "landscape",
                    }))
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landscape">Paysage</SelectItem>
                    <SelectItem value="portrait">Portrait</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <h3 className="font-medium mb-2 mt-6">Affichage</h3>
              <div className="flex items-center mb-2">
                <Checkbox
                  id="showTaskNames"
                  checked={exportOptions.showTaskNames}
                  onCheckedChange={(checked) =>
                    setExportOptions((prev) => ({
                      ...prev,
                      showTaskNames: !!checked,
                    }))
                  }
                />
                <Label htmlFor="showTaskNames" className="ml-2">
                  Afficher le nom des tâches
                </Label>
              </div>

              <h3 className="font-medium mb-2 mt-6">Plage de dates</h3>
              <div className="mb-4">
                <Select
                  value={exportOptions.dateRange}
                  onValueChange={(value) =>
                    setExportOptions((prev) => ({
                      ...prev,
                      dateRange: value as "all" | "custom" | "visible",
                    }))
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Plage de dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      Toute la durée du projet
                    </SelectItem>
                    <SelectItem value="visible">
                      Dates visibles actuellement
                    </SelectItem>
                    <SelectItem value="custom">Personnalisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {exportOptions.dateRange === "custom" && (
                <div className="space-y-2">
                  <div>
                    <Label>Date de début</Label>
                    <Input
                      type="date"
                      value={dayjs(exportOptions.customStartDate).format(
                        "YYYY-MM-DD"
                      )}
                      onChange={(e) =>
                        setExportOptions((prev) => ({
                          ...prev,
                          customStartDate: dayjs(e.target.value).toDate(),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Date de fin</Label>
                    <Input
                      type="date"
                      value={dayjs(exportOptions.customEndDate).format(
                        "YYYY-MM-DD"
                      )}
                      onChange={(e) =>
                        setExportOptions((prev) => ({
                          ...prev,
                          customEndDate: dayjs(e.target.value).toDate(),
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Panneau de droite: aperçu */}
            <div className="bg-gray-100 p-2 rounded flex items-center justify-center">
              <PDFViewer width="100%" height="700px" className="border rounded">
                <PlanningPDF
                  projectId={projectId}
                  visitDate={startDate || new Date().toISOString()}
                  items={items}
                  groups={groups}
                  options={exportOptions}
                />
              </PDFViewer>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                setIsExportDialogOpen(false);
                toast.info("Préparation du PDF en cours...");

                // Utiliser les options configurées pour l'export
                import("@react-pdf/renderer").then(({ pdf }) => {
                  pdf(
                    <PlanningPDF
                      projectId={projectId}
                      visitDate={startDate || new Date().toISOString()}
                      items={items}
                      groups={groups}
                      options={exportOptions}
                    />
                  )
                    .toBlob()
                    .then((blob) => {
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `Planning-Projet-${projectId}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      setTimeout(() => URL.revokeObjectURL(url), 100);
                      toast.success("PDF généré avec succès");
                    })
                    .catch((error) => {
                      console.error(
                        "Erreur lors de la génération du PDF:",
                        error
                      );
                      toast.error("Erreur lors de la génération du PDF");
                    });
                });
              }}>
              Exporter en PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};