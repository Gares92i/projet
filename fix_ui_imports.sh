#!/bin/bash
# fix_ui_imports.sh

echo "🔧 Correction des imports UI..."

# Remplacer tous les imports UI de components vers ui
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' -E 's|from "@/components/ui/|from "@/ui/|g'

echo "✅ Correction des imports UI terminée!"