#!/bin/bash
# fix_imports_to_standard.sh

echo "🔄 Standardisation des imports vers le format @/..."

# Corriger tous les imports qui n'utilisent pas @/
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@ui/|from "@/ui/|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@pages/|from "@/pages/|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@hooks/|from "@/hooks/|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@contexts/|from "@/contexts/|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@lib/|from "@/lib/|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@components/|from "@/components/|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@features/|from "@/features/|g'

# Correction des chemins relatifs spécifiques (ajustez selon vos besoins)
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "../features/|from "@/features/|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "../../features/|from "@/features/|g'

echo "✅ Standardisation des imports terminée!"