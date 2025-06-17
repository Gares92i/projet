#!/bin/bash

set -e

echo "🔧 Réorganisation du projet Vite + React (architecture modulaire)..."

mkdir -p src/{app,pages,components,features,contexts,hooks,services,lib,styles,schemas,integrations}

# 📁 Déplacement de fichiers globaux
[[ -f src/main.tsx ]] && mv src/main.tsx src/app/
[[ -f src/App.tsx ]] && mv src/App.tsx src/app/
[[ -f src/router.tsx ]] && mv src/router.tsx src/app/
[[ -f src/index.css ]] && mv src/index.css src/styles/

# 🧠 Fonction pour déplacer une feature complète
move_feature() {
  name=$1
  mkdir -p src/features/$name/{components,services,hooks,types}
  [[ -d src/$name/components ]] && mv src/$name/components src/features/$name/
  [[ -d src/$name/services ]] && mv src/$name/services src/features/$name/
  [[ -d src/$name/hooks ]] && mv src/$name/hooks src/features/$name/
  [[ -f src/$name/types.ts || -f src/$name/types.d.ts ]] && mv src/$name/types.* src/features/$name/types/
  [[ -f src/$name/index.ts ]] && mv src/$name/index.ts src/features/$name/
  # Déplacement de fichiers restants
  for f in src/$name/*.tsx; do [[ -f "$f" ]] && mv "$f" src/features/$name/components/; done
  rm -rf src/$name
}

# 🔁 Liste des features à déplacer (modifie selon ton projet réel)
for feature in projet planning clients taches equipe annotations rapports calendrier chat documents utilisateurs; do
  if [[ -d src/$feature ]]; then
    echo "📦 Organisation de la feature: $feature"
    move_feature $feature
  fi
done

# 🔄 Rendre les imports plus propres avec tsconfig.json
echo "🔧 Mise à jour de tsconfig.json..."

# Vérifie si "paths" existe déjà
if grep -q '"paths"' tsconfig.json; then
  echo "⚠️ Les alias semblent déjà configurés. Tu peux les adapter manuellement si besoin."
else
  # Injecte les alias
  jq '.compilerOptions.paths += {
    "@app/*": ["./src/app/*"],
    "@components/*": ["./src/components/*"],
    "@features/*": ["./src/features/*"],
    "@pages/*": ["./src/pages/*"],
    "@contexts/*": ["./src/contexts/*"],
    "@hooks/*": ["./src/hooks/*"],
    "@services/*": ["./src/services/*"],
    "@lib/*": ["./src/lib/*"],
    "@styles/*": ["./src/styles/*"],
    "@schemas/*": ["./src/schemas/*"],
    "@integrations/*": ["./src/integrations/*"]
  }' tsconfig.json > tsconfig.tmp && mv tsconfig.tmp tsconfig.json
  echo "✅ Alias ajoutés à tsconfig.json"
fi

echo "✅ Réorganisation terminée avec succès."
