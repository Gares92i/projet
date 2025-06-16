/**
 * Calcule la progression moyenne à partir des tâches du rapport
 */
export const calculateAverageProgress = (taskProgress: { progress: number }[] | undefined): number => {
  if (!taskProgress || taskProgress.length === 0) return 0;
  
  const totalProgress = taskProgress.reduce((sum, task) => sum + (task.progress || 0), 0);
  return Math.round(totalProgress / taskProgress.length);
};