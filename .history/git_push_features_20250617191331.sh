#!/bin/bash
# git_push_features.sh - Pousse la structure feature-first sur Git

set -e  # Arrêter en cas d'erreur

echo "🚀 Préparation du commit pour la migration feature-first..."

# Vérifier s'il y a des changements à commiter
if [ -z "$(git status --porcelain)" ]; then
  echo "⚠️ Aucun changement à commiter"
  exit 0
fi

# Créer une nouvelle branche pour la migration
BRANCH_NAME="refactor/feature-first-architecture-$(date +%Y%m%d)"
git checkout -b $BRANCH_NAME

# Ajouter tous les fichiers
git add .

# Commit avec un message détaillé
git commit -m "Refactoring: Migration complète vers l'architecture feature-first

- Réorganisation de la structure du projet par domaines métier
- Migration des composants, services, hooks et types par feature
- Uniformisation des imports avec les alias (@features, @types, etc.)
- Création de pages de redirection pour préserver la compatibilité
- Amélioration de la séparation des préoccupations et de la maintenabilité

Cette migration facilitera l'évolution du projet et l'intégration de nouvelles fonctionnalités."

# Pousser la branche
echo "🔄 Envoi des changements sur la branche $BRANCH_NAME..."
git push origin $BRANCH_NAME

echo "✅ Migration poussée avec succès!"
echo ""
echo "Prochaines étapes:"
echo "1. Créer une Pull Request sur GitHub depuis la branche $BRANCH_NAME"
echo "2. Faire réviser les changements par l'équipe"
echo "3. Tester l'application pour s'assurer que tout fonctionne"
echo "4. Merger la PR dans la branche principale"