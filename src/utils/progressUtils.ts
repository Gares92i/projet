import { TaskProgress } from "@/types/index";

/**
 * Calcule la progression moyenne à partir d'un tableau de valeurs
 * @param values Tableau de nombres représentant des pourcentages de progression
 * @returns Progression moyenne arrondie à l'entier le plus proche
 */
export const calculateAverageProgress = (values: number[]): number => {
  if (!values || values.length === 0) return 0;
  
  const validValues = values.filter(v => typeof v === 'number' && !isNaN(v));
  if (validValues.length === 0) return 0;
  
  const sum = validValues.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / validValues.length);
};

/**
 * Calcule la progression globale d'un projet à partir des tâches
 * @param tasks Liste des tâches avec leur progression
 * @returns Progression globale du projet
 */
export const calculateProjectProgress = (tasks: TaskProgress[]): number => {
  return calculateAverageProgress(tasks.map(task => task.progress));
};

/**
 * Détermine la couleur en fonction du niveau de progression
 * @param progress Valeur de progression (0-100)
 * @returns Classe CSS ou code couleur
 */
export const getProgressColor = (progress: number): string => {
  if (progress < 25) return 'bg-red-500';
  if (progress < 50) return 'bg-orange-500';
  if (progress < 75) return 'bg-yellow-500';
  return 'bg-green-500';
};

/**
 * Détermine le statut textuel en fonction de la progression
 * @param progress Valeur de progression (0-100)
 * @returns Description textuelle du statut
 */
export const getProgressStatus = (progress: number): string => {
  if (progress === 0) return 'Non commencé';
  if (progress < 25) return 'Démarrage';
  if (progress < 50) return 'En cours';
  if (progress < 100) return 'Avancé';
  return 'Terminé';
};

/**
 * Analyse une date au format chaîne et la convertit en date formatée pour l'affichage
 * @param dateString Chaîne de date (ISO ou autre format)
 * @param fallback Valeur par défaut si la date est invalide
 * @returns Date formatée pour l'affichage
 */
export const formatProgressDate = (dateString?: string, fallback: string = 'Non défini'): string => {
  if (!dateString) return fallback;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return fallback;
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return fallback;
  }
};