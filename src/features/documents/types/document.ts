// Types pour les documents
import { Annotation } from '@features/annotations/types/annotation';

export type DocumentType = "pdf" | "img";

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  size?: string;
  date?: string;
  projectId?: string;
  annotations?: Annotation[];
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
