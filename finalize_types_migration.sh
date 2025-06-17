#!/bin/bash
# Script pour finaliser la migration des types

set -e  # Arrêter en cas d'erreur

echo "🔄 Migration des fichiers de types restants..."

# 1. Migrer react-calendar-timeline.d.ts
if [ -f "src/types/react-calendar-timeline.d.ts" ]; then
  mkdir -p "src/features/planning/types"
  cp "src/types/react-calendar-timeline.d.ts" "src/features/planning/types/"
  echo "✅ Migré: react-calendar-timeline.d.ts -> features/planning/types/"
fi

# 2. Créer les fichiers de types manquants
echo "📝 Création des fichiers de types manquants..."

# Annotations
mkdir -p "src/features/annotations/types"
cat > "src/features/annotations/types/annotation.ts" << 'EOF'
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
EOF
echo "✅ Créé: src/features/annotations/types/annotation.ts"

# Reports
mkdir -p "src/features/reports/types"
cat > "src/features/reports/types/report.ts" << 'EOF'
// Types pour les rapports de visite
import { LotTravaux } from '@features/descriptif/types/descriptif';

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
EOF
echo "✅ Créé: src/features/reports/types/report.ts"

# Documents
mkdir -p "src/features/documents/types"
cat > "src/features/documents/types/document.ts" << 'EOF'
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
EOF
echo "✅ Créé: src/features/documents/types/document.ts"

# Mettre à jour le fichier index.ts pour exporter les types
echo "🔄 Mise à jour du fichier index.ts central..."
cat > "src/types/index.ts" << 'EOF'
// Types globaux et réexportations des types spécifiques aux features

// Types primitifs globaux
export type DocumentType = "pdf" | "img";

// Réexportations des types par feature pour compatibilité avec le code existant
export * from "@features/annotations/types/annotation";
export * from "@features/auth/types/auth";
export * from "@features/chat/types/chat";
export * from "@features/descriptif/types/descriptif";
export * from "@features/documents/types/document";
export * from "@features/planning/types/planning";
export * from "@features/projects/types/project";
export * from "@features/reports/types/report";
export * from "@features/tasks/types/taskTypes";
export * from "@features/team/types/team";

// Note: Ce fichier sert uniquement à maintenir la compatibilité avec le code existant
// Pour les nouveaux développements, importez directement depuis les dossiers de features
EOF
echo "✅ Mis à jour: src/types/index.ts"

echo "✅ Migration des types terminée!"