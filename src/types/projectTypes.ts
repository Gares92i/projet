// Définir des interfaces spécifiques pour les différents types de tâches
export interface BaseTask {
  id: string;
  startDate?: string;
  endDate?: string;
}

export interface PlanningTask extends BaseTask {
  name: string;
}

export interface DescriptifTask extends BaseTask {
  description?: string;
  nom?: string;
  dateDebut?: string;
  dateFin?: string;
  quantite?: number;
  unite?: string;
  pu?: number;
  tva?: number;
}

export interface LotTravaux {
  id: string;
  name: string;
  nom?: string;  // Ajout pour compatibilité avec le descriptif
  tasks: PlanningTask[];
  travaux?: DescriptifTask[];
  // autres propriétés
}

// Type compatible avec les deux structures
export interface DescriptifLot {
  id: string;
  name?: string;
  nom?: string;
  tasks?: PlanningTask[];
  travaux?: DescriptifTask[];
  // autres propriétés communes
}

export type DescriptifData = LotTravaux[] | DescriptifLot[];

// Ajouter progress/progression dans les interfaces existantes

interface TaskData {
  id?: string;
  name?: string;
  nom?: string;
  description?: string;
  startDate?: string;
  dateDebut?: string;
  endDate?: string;
  dateFin?: string;
  progress?: number; // Ajout du champ progress
  progression?: number; // Alternative si le champ s'appelle progression
}