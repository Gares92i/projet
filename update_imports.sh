#!/bin/bash
# update_imports.sh - Met à jour les imports vers la nouvelle structure feature-first

set -e  # Arrêter en cas d'erreur

echo "🔄 Mise à jour des imports dans tous les fichiers..."

# Trouver tous les fichiers TS/TSX dans le projet
FILES=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*")

for file in $FILES; do
  echo "📝 Traitement de $file"
  
  # Remplacer les imports vers les types centraux
  sed -i '' -E 's|from "\.\.\/\.\.\/types"|from "@types"|g' "$file"
  sed -i '' -E 's|from "\.\.\/types"|from "@types"|g' "$file"
  sed -i '' -E 's|from "\.\.\/\.\.\/\.\.\/types"|from "@types"|g' "$file"
  
  # Remplacer les imports vers les features
  sed -i '' -E 's|from "\.\.\/\.\.\/components\/project\/|from "@features/projects/components/|g' "$file"
  sed -i '' -E 's|from "\.\.\/\.\.\/components\/annotations\/|from "@features/annotations/components/|g' "$file"
  sed -i '' -E 's|from "\.\.\/\.\.\/services\/|from "@services/|g' "$file"
  
  # Remplacer les imports spécifiques aux features
  sed -i '' -E 's|from "\.\.\/\.\.\/features\/annotations\/|from "@features/annotations/|g' "$file"
  sed -i '' -E 's|from "\.\.\/\.\.\/features\/projects\/|from "@features/projects/|g' "$file"
  sed -i '' -E 's|from "\.\.\/\.\.\/features\/descriptif\/|from "@features/descriptif/|g' "$file"
  sed -i '' -E 's|from "\.\.\/\.\.\/features\/planning\/|from "@features/planning/|g' "$file"
  sed -i '' -E 's|from "\.\.\/\.\.\/features\/reports\/|from "@features/reports/|g' "$file"
  sed -i '' -E 's|from "\.\.\/\.\.\/features\/team\/|from "@features/team/|g' "$file"
  sed -i '' -E 's|from "\.\.\/\.\.\/features\/tasks\/|from "@features/tasks/|g' "$file"
  sed -i '' -E 's|from "\.\.\/\.\.\/features\/documents\/|from "@features/documents/|g' "$file"
  sed -i '' -E 's|from "\.\.\/\.\.\/features\/auth\/|from "@features/auth/|g' "$file"
  sed -i '' -E 's|from "\.\.\/\.\.\/features\/chat\/|from "@features/chat/|g' "$file"
  sed -i '' -E 's|from "\.\.\/\.\.\/features\/clients\/|from "@features/clients/|g' "$file"
  sed -i '' -E 's|from "\.\.\/\.\.\/features\/resources\/|from "@features/resources/|g' "$file"
  sed -i '' -E 's|from "\.\.\/\.\.\/features\/settings\/|from "@features/settings/|g' "$file"
  sed -i '' -E 's|from "\.\.\/\.\.\/features\/profile\/|from "@features/profile/|g' "$file"
  sed -i '' -E 's|from "\.\.\/\.\.\/features\/calendar\/|from "@features/calendar/|g' "$file"
  
  # Remplacer les imports vers les hooks
  sed -i '' -E 's|from "\.\.\/\.\.\/hooks\/|from "@hooks/|g' "$file"
  sed -i '' -E 's|from "\.\.\/hooks\/|from "@hooks/|g' "$file"
  
  # Remplacer les imports vers les utils/lib
  sed -i '' -E 's|from "\.\.\/\.\.\/utils\/|from "@lib/|g' "$file"
  sed -i '' -E 's|from "\.\.\/utils\/|from "@lib/|g' "$file"
  
  # Remplacer les imports vers les composants UI
  sed -i '' -E 's|from "\.\.\/\.\.\/components\/ui\/|from "@ui/|g' "$file"
  sed -i '' -E 's|from "\.\.\/components\/ui\/|from "@ui/|g' "$file"
done

echo "✅ Mise à jour des imports terminée!"