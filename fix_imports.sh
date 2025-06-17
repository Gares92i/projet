#!/bin/bash
# Corriger les imports après migration feature-first

echo "🔄 Correction des imports..."

# Liste des dossiers features à traiter
FEATURES=(
  "annotations"
  "auth"
  "calendar"
  "chat"
  "clients"
  "descriptif"
  "documents"
  "planning"
  "profile"
  "projects"
  "reports"
  "resources"
  "settings"
  "tasks"
  "team"
)

# Pour chaque feature
for feature in "${FEATURES[@]}"; do
  echo "📂 Mise à jour des imports dans la feature: $feature"
  
  # Trouver tous les fichiers .ts et .tsx dans cette feature
  find "src/features/$feature" -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
    # Remplacer les imports relatifs profonds par les imports avec alias
    sed -i '' -E 's|from "../../../components/|from "@components/|g' "$file"
    sed -i '' -E 's|from "../../components/|from "@components/|g' "$file"
    sed -i '' -E 's|from "../components/|from "@components/|g' "$file"
    
    sed -i '' -E 's|from "../../../services/|from "@services/|g' "$file"
    sed -i '' -E 's|from "../../services/|from "@services/|g' "$file"
    sed -i '' -E 's|from "../services/|from "@services/|g' "$file"
    
    sed -i '' -E 's|from "../../../hooks/|from "@hooks/|g' "$file"
    sed -i '' -E 's|from "../../hooks/|from "@hooks/|g' "$file"
    sed -i '' -E 's|from "../hooks/|from "@hooks/|g' "$file"
    
    sed -i '' -E 's|from "../../../types/|from "@types/|g' "$file"
    sed -i '' -E 's|from "../../types/|from "@types/|g' "$file"
    sed -i '' -E 's|from "../types/|from "@types/|g' "$file"
    
    sed -i '' -E 's|from "../../../utils/|from "@lib/|g' "$file"
    sed -i '' -E 's|from "../../utils/|from "@lib/|g' "$file"
    sed -i '' -E 's|from "../utils/|from "@lib/|g' "$file"
    
    # Mettre à jour les imports entre features
    for other_feature in "${FEATURES[@]}"; do
      if [ "$feature" != "$other_feature" ]; then
        sed -i '' -E "s|from \"../../../features/$other_feature/|from \"@features/$other_feature/|g" "$file"
        sed -i '' -E "s|from \"../../features/$other_feature/|from \"@features/$other_feature/|g" "$file"
        sed -i '' -E "s|from \"../features/$other_feature/|from \"@features/$other_feature/|g" "$file"
      fi
    done
    
    echo "✅ Traité: $file"
  done
done

echo "✅ Correction des imports terminée!"