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
