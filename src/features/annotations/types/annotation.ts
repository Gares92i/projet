// Types pour les annotations
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

export interface Document {
  id: string;
  name: string;
  type: "pdf" | "img";
  url: string;
  size?: string;
  date?: string;
  projectId?: string;
  documentUrl?: string;
  imageUrl?: string;
  imageWithAnnotations?: string;
  annotatedImageUrl?: string;
  capturedImageUrl?: string;
  documentWithAnnotations?: string;
  renderedAnnotationsUrl?: string;
  annotations?: Annotation[];
}

export type DocumentType = "pdf" | "img";
