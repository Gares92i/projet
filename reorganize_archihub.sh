#!/bin/bash

# Script de réorganisation du projet ArchiHub vers une architecture feature-first
# Créé le: 17 juin 2025

set -e  # Arrêter en cas d'erreur

echo "🚀 Réorganisation du projet ArchiHub vers une architecture feature-first..."

# Créer une sauvegarde du projet
echo "📦 Création d'une sauvegarde..."
BACKUP_DIR="../archihub_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r ./* "$BACKUP_DIR"
echo "✅ Sauvegarde créée dans $BACKUP_DIR"

# Créer la structure de base
echo "🏗️ Création de la structure de dossiers..."
mkdir -p src/{components,contexts,hooks,lib,pages,services,ui}
mkdir -p src/components/{layout,common,feedback}
mkdir -p src/ui/{button,input,layout,feedback}

# Créer la structure de features
echo "🧩 Création des dossiers features..."
FEATURES=("projects" "planning" "descriptif" "reports" "annotations" "team" "clients")
for feature in "${FEATURES[@]}"; do
  mkdir -p "src/features/$feature"/{components,hooks,services,types,utils}
  # Créer pages seulement pour les features qui ont des pages
  if [[ "$feature" != "team" && "$feature" != "clients" ]]; then
    mkdir -p "src/features/$feature/pages"
  fi
done

# Fonction utilitaire pour créer le dossier parent si nécessaire
ensure_dir() {
  dir=$(dirname "$1")
  if [ ! -d "$dir" ]; then
    mkdir -p "$dir"
  fi
}

# Migration des fichiers: Projects
echo "🔄 Migration de la feature Projects..."
if [ -f "src/pages/Projects.tsx" ]; then
  ensure_dir "src/features/projects/pages/Projects.tsx"
  cp "src/pages/Projects.tsx" "src/features/projects/pages/Projects.tsx"
fi

if [ -f "src/pages/ProjectDetails.tsx" ]; then
  ensure_dir "src/features/projects/pages/ProjectDetails.tsx"
  cp "src/pages/ProjectDetails.tsx" "src/features/projects/pages/ProjectDetails.tsx"
fi

if [ -f "src/components/ProjectCard.tsx" ]; then
  ensure_dir "src/features/projects/components/ProjectCard.tsx"
  cp "src/components/ProjectCard.tsx" "src/features/projects/components/ProjectCard.tsx"
fi

if [ -f "src/components/project/ProjectHeader.tsx" ]; then
  ensure_dir "src/features/projects/components/ProjectHeader.tsx"
  cp "src/components/project/ProjectHeader.tsx" "src/features/projects/components/ProjectHeader.tsx"
fi

if [ -f "src/components/project/ProjectDetailsCard.tsx" ]; then
  ensure_dir "src/features/projects/components/ProjectDetailsCard.tsx"
  cp "src/components/project/ProjectDetailsCard.tsx" "src/features/projects/components/ProjectDetailsCard.tsx"
fi

if [ -f "src/components/project/ProjectProgressCard.tsx" ]; then
  ensure_dir "src/features/projects/components/ProjectProgressCard.tsx"
  cp "src/components/project/ProjectProgressCard.tsx" "src/features/projects/components/ProjectProgressCard.tsx"
fi

if [ -f "src/components/project/ProjectBudgetCard.tsx" ]; then
  ensure_dir "src/features/projects/components/ProjectBudgetCard.tsx"
  cp "src/components/project/ProjectBudgetCard.tsx" "src/features/projects/components/ProjectBudgetCard.tsx"
fi

if [ -f "src/components/project/ProjectTabs.tsx" ]; then
  ensure_dir "src/features/projects/components/ProjectTabs.tsx"
  cp "src/components/project/ProjectTabs.tsx" "src/features/projects/components/ProjectTabs.tsx"
fi

if [ -f "src/components/project/ProjectData.ts" ]; then
  ensure_dir "src/features/projects/utils/projectMockData.ts"
  cp "src/components/project/ProjectData.ts" "src/features/projects/utils/projectMockData.ts"
fi

if [ -f "src/services/projectService.ts" ]; then
  ensure_dir "src/features/projects/services/projectService.ts"
  cp "src/services/projectService.ts" "src/features/projects/services/projectService.ts"
fi

if [ -f "src/types/project.ts" ]; then
  ensure_dir "src/features/projects/types/project.ts"
  cp "src/types/project.ts" "src/features/projects/types/project.ts"
fi

# Migration des fichiers: Planning
echo "🔄 Migration de la feature Planning..."
if [ -f "src/components/project/tabs/PlanningTab.tsx" ]; then
  ensure_dir "src/features/planning/components/PlanningTab.tsx"
  cp "src/components/project/tabs/PlanningTab.tsx" "src/features/planning/components/PlanningTab.tsx"
fi

if [ -f "src/components/project/tabs/PlanningExport.tsx" ]; then
  ensure_dir "src/features/planning/components/PlanningExport.tsx"
  cp "src/components/project/tabs/PlanningExport.tsx" "src/features/planning/components/PlanningExport.tsx"
fi

if [ -f "src/components/project/tabs/PlanningPDF.tsx" ]; then
  ensure_dir "src/features/planning/components/PlanningPDF.tsx"
  cp "src/components/project/tabs/PlanningPDF.tsx" "src/features/planning/components/PlanningPDF.tsx"
fi

if [ -f "src/components/gantt/types.ts" ]; then
  ensure_dir "src/features/planning/types/gantt.ts"
  cp "src/components/gantt/types.ts" "src/features/planning/types/gantt.ts"
fi

if [ -f "src/components/project/types/planning.ts" ]; then
  ensure_dir "src/features/planning/types/planning.ts"
  cp "src/components/project/types/planning.ts" "src/features/planning/types/planning.ts"
fi

if [ -f "src/types/planningTypes.ts" ]; then
  ensure_dir "src/features/planning/types/index.ts"
  cp "src/types/planningTypes.ts" "src/features/planning/types/index.ts"
fi

if [ -f "src/services/planningService.ts" ]; then
  ensure_dir "src/features/planning/services/planningService.ts"
  cp "src/services/planningService.ts" "src/features/planning/services/planningService.ts"
fi

if [ -f "src/components/services/planningService.ts" ]; then
  ensure_dir "src/features/planning/services/legacyPlanningService.ts"
  cp "src/components/services/planningService.ts" "src/features/planning/services/legacyPlanningService.ts"
fi

# Migration des fichiers: Descriptif
echo "🔄 Migration de la feature Descriptif..."
if [ -f "src/pages/ProjectDescriptif.tsx" ]; then
  ensure_dir "src/features/descriptif/pages/ProjectDescriptif.tsx"
  cp "src/pages/ProjectDescriptif.tsx" "src/features/descriptif/pages/ProjectDescriptif.tsx"
fi

if [ -f "src/components/project/tabs/DescriptifDetailTab.tsx" ]; then
  ensure_dir "src/features/descriptif/components/DescriptifDetailTab.tsx"
  cp "src/components/project/tabs/DescriptifDetailTab.tsx" "src/features/descriptif/components/DescriptifDetailTab.tsx"
fi

if [ -f "src/services/descriptifService.ts" ]; then
  ensure_dir "src/features/descriptif/services/descriptifService.ts"
  cp "src/services/descriptifService.ts" "src/features/descriptif/services/descriptifService.ts"
fi

if [ -f "src/types/projectTypes.ts" ]; then
  ensure_dir "src/features/descriptif/types/descriptif.ts"
  cp "src/types/projectTypes.ts" "src/features/descriptif/types/descriptif.ts"
fi

# Migration des fichiers: Reports
echo "🔄 Migration de la feature Reports..."
if [ -f "src/pages/SiteVisitReportForm.tsx" ]; then
  ensure_dir "src/features/reports/pages/SiteVisitReportForm.tsx"
  cp "src/pages/SiteVisitReportForm.tsx" "src/features/reports/pages/SiteVisitReportForm.tsx"
fi

if [ -f "src/pages/SiteVisitReportDetail.tsx" ]; then
  ensure_dir "src/features/reports/pages/SiteVisitReportDetail.tsx"
  cp "src/pages/SiteVisitReportDetail.tsx" "src/features/reports/pages/SiteVisitReportDetail.tsx"
fi

if [ -f "src/components/project/SiteVisitReportUploader.tsx" ]; then
  ensure_dir "src/features/reports/components/SiteVisitReportUploader.tsx"
  cp "src/components/project/SiteVisitReportUploader.tsx" "src/features/reports/components/SiteVisitReportUploader.tsx"
fi

if [ -f "src/services/reportService.ts" ]; then
  ensure_dir "src/features/reports/services/reportService.ts"
  cp "src/services/reportService.ts" "src/features/reports/services/reportService.ts"
fi

if [ -f "src/hooks/use-report-form.ts" ]; then
  ensure_dir "src/features/reports/hooks/useReportForm.ts"
  cp "src/hooks/use-report-form.ts" "src/features/reports/hooks/useReportForm.ts"
fi

# Migration des fichiers: Annotations
echo "🔄 Migration de la feature Annotations..."
if [ -f "src/pages/ProjectAnnotations.tsx" ]; then
  ensure_dir "src/features/annotations/pages/ProjectAnnotations.tsx"
  cp "src/pages/ProjectAnnotations.tsx" "src/features/annotations/pages/ProjectAnnotations.tsx"
fi

if [ -f "src/components/project/tabs/AnnotationsTab.tsx" ]; then
  ensure_dir "src/features/annotations/components/AnnotationsTab.tsx"
  cp "src/components/project/tabs/AnnotationsTab.tsx" "src/features/annotations/components/AnnotationsTab.tsx"
fi

if [ -f "src/components/project/AnnotationsTable.tsx" ]; then
  ensure_dir "src/features/annotations/components/AnnotationsTable.tsx"
  cp "src/components/project/AnnotationsTable.tsx" "src/features/annotations/components/AnnotationsTable.tsx"
fi

if [ -f "src/components/annotations/useAnnotations.tsx" ]; then
  ensure_dir "src/features/annotations/hooks/useAnnotations.tsx"
  cp "src/components/annotations/useAnnotations.tsx" "src/features/annotations/hooks/useAnnotations.tsx"
fi

if [ -f "src/services/annotationService.ts" ]; then
  ensure_dir "src/features/annotations/services/annotationService.ts"
  cp "src/services/annotationService.ts" "src/features/annotations/services/annotationService.ts"
fi

if [ -f "src/utils/annotationUtils.ts" ]; then
  ensure_dir "src/features/annotations/utils/annotationUtils.ts"
  cp "src/utils/annotationUtils.ts" "src/features/annotations/utils/annotationUtils.ts"
fi

# Migration des fichiers: Team
echo "🔄 Migration de la feature Team..."
if [ -f "src/services/teamService.ts" ]; then
  ensure_dir "src/features/team/services/teamService.ts"
  cp "src/services/teamService.ts" "src/features/team/services/teamService.ts"
fi

if [ -f "src/services/team/legacyTeamService.ts" ]; then
  ensure_dir "src/features/team/services/legacyTeamService.ts"
  cp "src/services/team/legacyTeamService.ts" "src/features/team/services/legacyTeamService.ts"
fi

if [ -f "src/services/team/teamProjectRelationService.ts" ]; then
  ensure_dir "src/features/team/services/teamProjectRelationService.ts"
  cp "src/services/team/teamProjectRelationService.ts" "src/features/team/services/teamProjectRelationService.ts"
fi

if [ -f "src/types/team.ts" ]; then
  ensure_dir "src/features/team/types/team.ts"
  cp "src/types/team.ts" "src/features/team/types/team.ts"
fi

# Migration des fichiers: Clients
echo "🔄 Migration de la feature Clients..."
if [ -f "src/components/services/clientService.ts" ]; then
  ensure_dir "src/features/clients/services/clientService.ts"
  cp "src/components/services/clientService.ts" "src/features/clients/services/clientService.ts"
fi

# Migration des services globaux
echo "🔄 Migration des services globaux..."
if [ -f "src/services/apiClient.ts" ]; then
  ensure_dir "src/services/apiClient.ts"
  cp "src/services/apiClient.ts" "src/services/apiClient.ts"
fi

if [ -f "src/services/authService.ts" ]; then
  ensure_dir "src/services/authService.ts"
  cp "src/services/authService.ts" "src/services/authService.ts"
fi

if [ -f "src/services/fileStorageService.ts" ]; then
  ensure_dir "src/services/fileStorageService.ts"
  cp "src/services/fileStorageService.ts" "src/services/fileStorageService.ts"
fi

# Créer les fichiers d'index pour les types globaux
echo "📄 Création des fichiers d'index pour les types globaux..."
cat > "src/types/index.ts" << 'EOF'
// Types globaux partagés entre plusieurs features
export type DocumentType = "pdf" | "img";

// Réexportation des types de features pour compatibilité avec le code existant
export * from "../features/projects/types/project";
export * from "../features/planning/types/planning";
export * from "../features/descriptif/types/descriptif";
export * from "../features/annotations/types/annotation";
export * from "../features/reports/types/report";
export * from "../features/team/types/team";
export * from "../features/clients/types/client";

// Réintégration des types essentiels
import { LotTravaux } from "../features/projects/types/project";

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  projectId?: string;
  annotations?: Annotation[];
  // Autres champs spécifiques aux documents
}

export interface Annotation {
  id: string;
  projectId: string;
  documentId: string;
  x: number;
  y: number;
  comment?: string;
  resolved?: boolean;
  createdAt: string;
  // Autres champs spécifiques aux annotations
}

// Autres interfaces communes
export interface ProjectMilestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  projectId: string;
}

export interface TaskProgress {
  id: string;
  number: string;
  title: string;
  progress: number;
  color?: string;
}
EOF

# Créer des fichiers index pour les pages principales (redirection)
echo "📄 Création des fichiers de redirection pour les pages..."

mkdir -p "src/pages/projects"
cat > "src/pages/projects/index.tsx" << 'EOF'
import { Projects } from "../../features/projects/pages/Projects";
export default Projects;
EOF

cat > "src/pages/projects/[id].tsx" << 'EOF'
import { ProjectDetails } from "../../features/projects/pages/ProjectDetails";
export default ProjectDetails;
EOF

mkdir -p "src/pages/reports"
cat > "src/pages/reports/[id].tsx" << 'EOF'
import { SiteVisitReportDetail } from "../../features/reports/pages/SiteVisitReportDetail";
export default SiteVisitReportDetail;
EOF

cat > "src/pages/reports/new.tsx" << 'EOF'
import { SiteVisitReportForm } from "../../features/reports/pages/SiteVisitReportForm";
export default SiteVisitReportForm;
EOF

# Mettre à jour le tsconfig.json pour les alias
echo "🔧 Mise à jour de tsconfig.json pour les alias..."
if [ -f "tsconfig.json" ]; then
  # Vérifier si jq est installé
  if command -v jq >/dev/null 2>&1; then
    # Créer une sauvegarde du tsconfig.json
    cp tsconfig.json tsconfig.json.bak
    
    # Mettre à jour le tsconfig.json avec jq
    jq '.compilerOptions.paths = {
      "@/*": ["./src/*"],
      "@app/*": ["./src/app/*"],
      "@components/*": ["./src/components/*"],
      "@features/*": ["./src/features/*"],
      "@pages/*": ["./src/pages/*"],
      "@contexts/*": ["./src/contexts/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@services/*": ["./src/services/*"],
      "@lib/*": ["./src/lib/*"],
      "@ui/*": ["./src/ui/*"],
      "@types/*": ["./src/types/*"]
    }' tsconfig.json > tsconfig.temp.json && mv tsconfig.temp.json tsconfig.json
    
    echo "✅ Alias ajoutés au tsconfig.json"
  else
    echo "⚠️ jq n'est pas installé. Vous devrez mettre à jour manuellement les alias dans tsconfig.json."
    echo "Installer jq avec: brew install jq"
  fi
else
  echo "⚠️ tsconfig.json non trouvé. Impossible d'ajouter les alias."
fi

echo "✅ Réorganisation terminée!"
echo "⚠️ Important: Ce script a copié les fichiers dans leur nouvelle structure."
echo "   Les fichiers originaux n'ont pas été supprimés pour des raisons de sécurité."
echo "   Une fois que vous avez vérifié que tout fonctionne, vous pouvez supprimer les fichiers originaux."
echo ""
echo "🔍 Vérifiez les imports dans les fichiers déplacés - vous devrez les mettre à jour manuellement."
echo "   Utilisez les nouveaux alias (ex: @features/...) pour simplifier les imports."