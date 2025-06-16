export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
  client: string;
  location: string;
  manager?: string;
  // autres propriétés qui peuvent être nécessaires
}
// Option 1: Créer un nouveau fichier pour ce type
// filepath: /Users/mouradgares/Downloads/project/src/types/project.ts
export interface ExtendedLotTravaux {
  id: string;
  numero: string;
  nom: string;
  name?: string;
  count?: number;
  sortOrder?: number;
  isExpanded?: boolean;
  travaux: {
    id: string;
    nom: string;
    description?: string;
    quantite?: number;
    unite?: string;
    prixUnitaire?: number;
    prixTotal?: number;
  }[];
  // Ajout de la propriété metadata
  metadata?: {
    description?: string;
    localisations?: string[];
  };
}
export interface LotTravaux {
  id: string;
  name: string;
  tasks: {
    id: string;
    name: string;
    quantite?: number;
    unite?: string;
    pu?: number;
    tva?: number;
    startDate?: string;
    endDate?: string;
    // autres propriétés
  }[];
  // autres propriétés
}

export type DescriptifData = LotTravaux[];