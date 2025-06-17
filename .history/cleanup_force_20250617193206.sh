#!/bin/bash
# cleanup_force.sh - Supprime complètement tous les anciens fichiers et dossiers

set -e  # Arrêter en cas d'erreur

echo "🧹 Suppression forcée de tous les anciens fichiers..."

# 1. Supprimer les anciens dossiers complets
echo "🗑️ Suppression des anciens dossiers..."

# Sauvegarder ui/components car ils sont probablement encore utilisés
if [ -d "src/components/ui" ]; then
  echo "📦 Sauvegarde des composants UI..."
  mkdir -p src/ui_temp
  cp -r src/components/ui/* src/ui_temp/
fi

# Supprimer tous les anciens dossiers
rm -rf src/components
rm -rf src/hooks
rm -rf src/services/chat
rm -rf src/services/team
rm -rf src/services/storage
rm -rf src/utils
rm -rf src/schemas

# 2. Supprimer les fichiers individuels dans les dossiers principaux
echo "🗑️ Suppression des anciens fichiers..."

# Pages
find src/pages -type f -name "*.tsx" -not -path "*/*/index.tsx" -delete

# Services
find src/services -type f -name "*.ts" -delete

# Types
find src/types -type f -name "*.ts" -not -name "index.ts" -delete

# 3. Restaurer les composants UI si nécessaire
if [ -d "src/ui_temp" ]; then
  echo "📦 Restauration des composants UI..."
  mkdir -p src/ui
  cp -r src/ui_temp/* src/ui/
  rm -rf src/ui_temp
fi

# 4. Suppression des dossiers vides
echo "🧹 Nettoyage des dossiers vides..."
find src -type d -empty -delete

echo "✅ Nettoyage forcé terminé!"

# 5. Commit et push Git
echo "🔄 Préparation du commit Git..."

# Vérifier s'il y a des changements à commiter
if [ -z "$(git status --porcelain)" ]; then
  echo "⚠️ Aucun changement à commiter"
  exit 0
fi

# Ajouter tous les fichiers supprimés
git add .

# Commit avec un message détaillé
git commit -m "Chore: Suppression complète des anciens fichiers

- Suppression de tous les fichiers dans src/components
- Suppression de tous les fichiers dans src/hooks
- Suppression des anciens services
- Suppression des anciens types
- Conservation uniquement de la structure feature-first"

# Pousser les changements
CURRENT_BRANCH=$(git branch --show-current)
echo "🚀 Envoi des suppressions sur la branche $CURRENT_BRANCH..."
git push origin $CURRENT_BRANCH

echo "✅ Nettoyage complet terminé et poussé avec succès!"