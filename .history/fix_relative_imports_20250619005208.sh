#!/bin/bash
# fix_relative_imports.sh

echo "🔧 Correction des imports relatifs..."

# Créer les fichiers manquants essentiels
mkdir -p src/features/team/utils
touch src/features/team/utils/teamStorageUtils.ts

# apiClient
mkdir -p src/services
touch src/services/apiClient.ts

echo "✅ Création des fichiers manquants terminée!"