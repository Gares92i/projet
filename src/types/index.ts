// Types communs pour toute l'application
import { LotTravaux } from './project';
export type DocumentType = "pdf" | "img";
export * from './team';
// Interface Document unifiée
export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;

  // Champs spécifiques
  size?: string;
  date?: string;
  projectId?: string;

  // Champs pour annotations
  documentUrl?: string;
  imageUrl?: string;
  imageWithAnnotations?: string;
  annotatedImageUrl?: string;
  capturedImageUrl?: string;
  documentWithAnnotations?: string;
  renderedAnnotationsUrl?: string;
  annotations?: Annotation[];
}

export interface Annotation {
  id: string;
   projectId: string;
  documentId: string;
  documentName?: string;
  x: number;
  y: number;
  position?: { x: number; y: number };
  comment?: string;
  resolved?: boolean;
  isResolved?: boolean;
  date?: string;
  createdAt: string;
  photos?: string[];
   text?: string;
  author?: string;
  lot?: string;
  location?: string;
  resolvedDate?: string;
  documentUrl?: string;
  imageUrl?: string;
  imageWithAnnotations?: string;
  annotatedImageUrl?: string;
    capturedImageUrl?: string;
  documentWithAnnotations?: string;
}

// Ajout des interfaces manquantes depuis types.ts.bak
export interface Observation {
  id: string;
  item: number;
  observation: string;
  description: string;
  photoUrl?: string;
}

export interface Recommendation {
  id: string;
  item: number;
  observation: string;
  action: string;
  responsible: string;
  status: "pending" | "in-progress" | "completed" | "on-hold";
  photoUrl?: string;
}

export interface Participant {
  id: string;
  role: string;
  contact: string;
  address: string;
  email: string;
  phone: string;
  presence: "P" | "R" | "A" | "E";
}
export interface TaskProgress {
  id: string;
  number: string;
  title: string;
  progress: number;
  color?: string;
}

export interface Reserve {
  id: string;
  location: string;
  lot: string;
  description: string;
  photos?: string[];
  createdAt: string;
  resolvedAt?: string;
  annotationId?: string;
  documentName?: string;
  imageUrl?: string;
}

// Réintégration de SiteVisitReport
export interface SiteVisitReport {
  id: string;
  projectId: string;
  visitDate: string;
  contractor: string;
  inCharge: string;
  progress: number;
  observations: Observation[];
  recommendations: Recommendation[];
  participants?: Participant[];
  taskProgress?: TaskProgress[];
  additionalDetails?: string;
  photos: string[];
  signatures: {
    inCharge?: string;
    engineer?: string;
    visitor?: string;
  };
  attachments?: string[];
  reportNumber?: string;
  templateId?: string;
  descriptif: LotTravaux[];
  createdAt: string;
  updatedAt: string;
  reserves?: Reserve[];
  weather?: string;
  notes?: string;
}

// Autres interfaces utiles du fichier types.ts.bak
export interface ArchitectInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  website?: string;
  taxId?: string;
}

// Remplacer la définition existante de TeamMember par une référence
import { TeamMember as TeamMemberType } from './team';

// Renommer l'interface existante pour éviter le conflit
export interface ProjectTeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

// Réexporter TeamMember pour maintenir la compatibilité


export interface ProjectMilestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  projectId: string;
}

export interface ProjectStats {
  budgetTotal: number;
  budgetUsed: number;
  timelineProgress: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksTodo: number;
  documentsCount: number;
  commentsCount: number;
  meetingsCount: number;
  projectId: string;
}
export interface ProjectDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
  lastModified?: string;
  projectId: string;
  annotations?: Annotation[];
}
