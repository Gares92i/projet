// Types pour les rapports de visite
import { LotTravaux } from '@';

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

export interface ArchitectInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  website?: string;
  taxId?: string;
}
