#!/bin/bash
# filepath: /Users/mouradgares/Downloads/project/fix_imports.sh

echo "🔄 Démarrage de la correction des imports..."

# 1. Correction des imports de services
echo "🔧 Correction des imports de services..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/services/taskService"|from "@/features/tasks/services/taskService"|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/services/reportService"|from "@/features/reports/services/reportService"|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/services/clientService"|from "@/features/clients/services/clientService"|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/services/planningService"|from "@/features/planning/services/planningService"|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/services/stripeService"|from "@/services/stripeService"|g'

# 2. Correction des imports de features
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/features/projectService"|from "@/features/projects/services/projectService"|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/features/annotationService"|from "@/features/annotations/services/annotationService"|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/features/teamService"|from "@/features/team/services/teamService"|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/features/storageService"|from "@/services/storageService"|g'

# 3. Correction des imports UI
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/ui/|from "@/ui/|g'

# 4. Correction des imports avec @services
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@services/|from "@/services/|g'

# 5. Correction des imports de components
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/project/|from "@/features/projects/components/|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/team/|from "@/features/team/components/|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/settings/|from "@/features/settings/components/|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/maps/|from "@/features/maps/components/|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/resources/|from "@/features/resources/components/|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/annotations/|from "@/features/annotations/components/|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/tasks/|from "@/features/tasks/components/|g'

# 6. Correction des imports spécifiques problématiques
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/project/tabs/DescriptifDetailTab"|from "@/features/descriptif/components/DescriptifDetailTab"|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/TaskList"|from "@/features/tasks/components/TaskList"|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/DocumentsList"|from "@/features/documents/components/DocumentsList"|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/ProjectCard"|from "@/features/projects/components/ProjectCard"|g'

# 7. Création des dossiers manquants
mkdir -p src/features/team/utils
mkdir -p src/services

echo "✅ Correction des imports terminée!"