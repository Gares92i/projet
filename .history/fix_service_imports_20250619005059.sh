#!/bin/bash
# fix_service_imports.sh

echo "🔧 Correction des imports de services..."

# Remplacer les imports des services de composants vers features
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/services/taskService"|from "@/features/tasks/services/taskService"|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/services/reportService"|from "@/features/reports/services/reportService"|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/services/clientService"|from "@/features/clients/services/clientService"|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/services/planningService"|from "@/features/planning/services/planningService"|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/services/stripeService"|from "@/services/stripeService"|g'

# Standardiser les imports de services entre features
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/features/projectService"|from "@/features/projects/services/projectService"|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/features/annotationService"|from "@/features/annotations/services/annotationService"|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/features/teamService"|from "@/features/team/services/teamService"|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/features/storageService"|from "@/services/storageService"|g'

# Corriger les imports avec @services
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@services/|from "@/services/|g'

echo "✅ Correction des imports de services terminée!"