import { TaskProgress } from "@/app/styles";

// Interfaces pour la structure de données du planning
interface PlanningGroup {
  id: string;
  title: string;
  parentId?: string;
  lotColor?: string;
  [key: string]: unknown;
}

interface PlanningItem {
  id: string;
  group: string;
  title?: string;
  isHeader?: boolean;
  progress?: number;
  [key: string]: unknown;
}

interface PlanningData {
  groups: PlanningGroup[];
  items: PlanningItem[];
}

// Récupère les avancements de lots depuis la table planning pour un projet spécifique
export const fetchTaskProgressFromPlanning = async (projectId: string): Promise<TaskProgress[]> => {
  try {
    console.log(`Récupération des avancements de lots depuis la planification pour le projet ${projectId}`);
    
    // Récupérer les données du planning avec la clé correcte
    const savedData = localStorage.getItem(`project_${projectId}_planning`);
    if (!savedData) {
      console.log("Aucune donnée de planning trouvée dans le localStorage");
      return [];
    }
    
    // Parser les données sauvegardées
    const planningData = JSON.parse(savedData) as PlanningData;
    
    // Vérifier si les données sont valides
    if (!planningData.groups || !planningData.items) {
      console.log("Structure de données de planning invalide");
      return [];
    }
    
    const { groups, items } = planningData;
    const tasks: TaskProgress[] = [];

    // Trouver tous les lots (groupes sans parentId)
    const lots = groups.filter((group: PlanningGroup) => !group.parentId);
    
    lots.forEach((lot: PlanningGroup) => {
      const lotId = lot.id;
      // Récupérer le titre du lot sans le numéro
      const lotTitle = lot.title.includes(". ") ? lot.title.split(". ")[1] : lot.title;
      const lotColor = lot.lotColor;
      const lotNumber = lot.title.split(". ")[0];
      
      // Trouver l'item d'en-tête du lot pour voir sa progression
      const lotHeaderItem = items.find((item: PlanningItem) => item.group === lotId && item.isHeader);
      
      // Trouver toutes les tâches de ce lot
      const lotTasks = items.filter((item: PlanningItem) => {
        const taskGroupId = item.group;
        const taskGroup = groups.find((g: PlanningGroup) => g.id === taskGroupId);
        return taskGroup && taskGroup.parentId === lotId;
      });
      
      // Calculer la progression moyenne du lot
      let progress = 0;
      if (lotTasks.length > 0) {
        progress = Math.round(
          lotTasks.reduce((sum: number, task: PlanningItem) => sum + (task.progress || 0), 0) /
          lotTasks.length
        );
      } else if (lotHeaderItem && lotHeaderItem.progress !== undefined) {
        progress = lotHeaderItem.progress;
      }
      
      // Ajouter le lot à la liste des tâches
      tasks.push({
        id: lotId,
        number: lotNumber,
        title: lotTitle,
        progress: progress,
        color: lotColor || getDefaultLotColor(lotNumber)
      });
    });
    
    if (tasks.length === 0) {
      console.log("Aucun lot trouvé dans les données de planning");
    } else {
      console.log(`${tasks.length} lots trouvés dans le planning`);
    }
    
    return tasks;
  } catch (error) {
    console.error("Erreur lors de la récupération des avancements depuis la planification:", error);
    return [];
  }
};

// Fonction utilitaire pour générer une couleur par défaut basée sur le numéro de lot
function getDefaultLotColor(lotNumber: string | number | undefined): string {
  const colors = [
    "#78909C", // Gris bleuté
    "#4CAF50", // Vert
    "#2196F3", // Bleu
    "#9C27B0", // Violet
    "#FF9800", // Orange
    "#F44336", // Rouge
    "#009688", // Turquoise
    "#795548", // Marron
    "#607D8B", // Bleu-gris
  ];
  
  if (lotNumber === undefined) {
    return colors[0];
  }
  
  const num = typeof lotNumber === 'string' ? 
    parseInt(lotNumber.replace(/\D/g, ''), 10) || 0 : 
    lotNumber || 0;
  
  return colors[num % colors.length];
}