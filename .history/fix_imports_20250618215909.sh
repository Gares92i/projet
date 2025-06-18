#!/bin/bash
# fix_imports.sh

echo "🔄 Correction des imports dans tous les fichiers..."

# 1. Correction des imports UI
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/ui/|from "@ui/|g'

# 2. Correction des imports features
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/features/|from "@features/|g'

# 3. Correction des imports components spécifiques
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/project/|from "@features/projects/components/|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/team/|from "@features/team/components/|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/chat/|from "@features/chat/components/|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/auth/|from "@features/auth/components/|g'

# 4. Correction des imports de services
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/services/|from "@features/|g'

# 5. Correction des imports pages et hooks
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/pages/|from "@pages/|g'
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/hooks/|from "@hooks/|g'

echo "✅ Correction des imports terminée!"