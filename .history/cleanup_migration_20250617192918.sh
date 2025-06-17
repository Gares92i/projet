#!/bin/bash
# cleanup_migration.sh - Supprime les anciens fichiers après migration feature-first

set -e  # Arrêter en cas d'erreur

echo "🧹 Suppression des fichiers migrés vers la structure feature-first..."

# Liste des pages à préserver (celles qui sont des redirections)
PRESERVED_PAGES=()
for file in src/pages/**/index.tsx; do
  dir=$(dirname "$file")
  PRESERVED_PAGES+=("$dir")
done

# 1. Supprimer les anciennes pages
echo "🗑️ Suppression des anciennes pages..."
find src/pages -type f -name "*.tsx" | while read -r file; do
  # Vérifier si le fichier est dans un dossier préservé
  is_preserved=false
  for dir in "${PRESERVED_PAGES[@]}"; do
    if [[ "$file" == "$dir"/* ]]; then
      is_preserved=true
      break
    fi
  done
  
  # Ne supprimer que si le fichier n'est pas préservé
  if [ "$is_preserved" = false ]; then
    # Extraire le nom de base du fichier sans extension
    base_name=$(basename "$file" .tsx)

    # Vérifier si une page correspondante existe dans features
    if find src/features -path "*/pages/$base_name.tsx" -o -path "*/pages/${base_name,,}.tsx" | grep -q .; then
      echo "  ✅ Suppression de $file (migré vers features)"
      rm "$file"
    else
      echo "  ⚠️ Conservation de $file (pas de correspondance trouvée dans features)"
    fi
  fi
done

# 2. Supprimer les anciens composants
echo "🗑️ Suppression des anciens composants..."
find src/components -type f \( -name "*.tsx" -o -name "*.ts" \) | while read -r file; do
  # Extraire le nom de base du fichier sans extension
  base_name=$(basename "$file" .tsx)
  base_name=${base_name%.ts}

  # Vérifier si un composant correspondant existe dans features
  if find src/features -path "*/components/$base_name.tsx" -o -path "*/components/$base_name.ts" -o -path "*/components/${base_name,,}.tsx" -o -path "*/components/${base_name,,}.ts" | grep -q .; then
    echo "  ✅ Suppression de $file (migré vers features)"
    rm "$file"
  else
    echo "  ⚠️ Conservation de $file (pas de correspondance trouvée dans features)"
  fi
done

# 3. Supprimer les anciens hooks
echo "🗑️ Suppression des anciens hooks..."
find src/hooks -type f \( -name "*.tsx" -o -name "*.ts" \) | while read -r file; do
  # Extraire le nom de base du fichier sans extension
  base_name=$(basename "$file" .tsx)
  base_name=${base_name%.ts}
  
  # Vérifier si un hook correspondant existe dans features
  if find src/features -path "*/hooks/$base_name.tsx" -o -path "*/hooks/$base_name.ts" -o -path "*/hooks/${base_name,,}.tsx" -o -path "*/hooks/${base_name,,}.ts" | grep -q .; then
    echo "  ✅ Suppression de $file (migré vers features)"
    rm "$file"
  else
    echo "  ⚠️ Conservation de $file (pas de correspondance trouvée dans features)"
  fi
done

# 4. Supprimer les anciens services
echo "🗑️ Suppression des anciens services..."
find src/services -type f -name "*.ts" | while read -r file; do
  # Extraire le nom de base du fichier sans extension
  base_name=$(basename "$file" .ts)
  
  # Vérifier si un service correspondant existe dans features
  if find src/features -path "*/services/$base_name.ts" -o -path "*/services/${base_name,,}.ts" | grep -q .; then
    echo "  ✅ Suppression de $file (migré vers features)"
    rm "$file"
  else
    echo "  ⚠️ Conservation de $file (service global ou pas migré)"
  fi
done

# 5. Supprimer les anciens types
echo "🗑️ Suppression des anciens types..."
find src/types -type f -name "*.ts" | while read -r file; do
  # Ne pas supprimer index.ts qui contient les réexportations
  if [ "$(basename "$file")" == "index.ts" ]; then
    continue
  fi
  
  # Extraire le nom de base du fichier sans extension
  base_name=$(basename "$file" .ts)
  
  # Vérifier si un type correspondant existe dans features
  if find src/features -path "*/types/$base_name.ts" -o -path "*/types/${base_name,,}.ts" | grep -q .; then
    echo "  ✅ Suppression de $file (migré vers features)"
    rm "$file"
  else
    echo "  ⚠️ Conservation de $file (pas de correspondance trouvée dans features)"
  fi
done

# 6. Supprimer les anciens utils
echo "🗑️ Suppression des anciens utils..."
find src/utils -type f -name "*.ts" | while read -r file; do
  # Extraire le nom de base du fichier sans extension
  base_name=$(basename "$file" .ts)
  
  # Vérifier si un util correspondant existe dans features ou lib
  if find src/features -path "*/utils/$base_name.ts" -o -path "*/utils/${base_name,,}.ts" -o -path "src/lib/$base_name.ts" -o -path "src/lib/${base_name,,}.ts" | grep -q .; then
    echo "  ✅ Suppression de $file (migré vers features ou lib)"
    rm "$file"
  else
    echo "  ⚠️ Conservation de $file (pas de correspondance trouvée)"
  fi
done

# 7. Supprimer les dossiers vides
echo "🧹 Suppression des dossiers vides..."
find src -type d -empty -delete

echo "✅ Nettoyage terminé!"

# 8. Commit et push Git
echo "🔄 Préparation du commit Git pour la suppression des fichiers..."

# Vérifier s'il y a des changements à commiter
if [ -z "$(git status --porcelain)" ]; then
  echo "⚠️ Aucun changement à commiter"
  exit 0
fi

# Ajouter tous les fichiers supprimés
git add .

# Commit avec un message détaillé
git commit -m "Chore: Suppression des fichiers obsolètes après migration feature-first

- Suppression des composants, hooks, services et types migrés
- Nettoyage des dossiers vides
- Finalisation de la structure feature-first

Cette opération de nettoyage complète la migration vers l'architecture modulaire
par domaine métier, éliminant les duplications et clarifiant la structure du projet."

# Pousser les changements
CURRENT_BRANCH=$(git branch --show-current)
echo "🚀 Envoi des suppressions sur la branche $CURRENT_BRANCH..."
git push origin $CURRENT_BRANCH

echo "✅ Nettoyage poussé avec succès!"
echo ""
echo "🎉 Migration feature-first TERMINÉE ! 🎉"