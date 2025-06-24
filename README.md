# ArchiPro - Plateforme de Gestion de Projets pour Architectes

ArchiPro est une application web et mobile de gestion de projets destinée aux architectes, agences d'architecture et professionnels du bâtiment. L'application vise à simplifier et centraliser les tâches liées à la gestion de projets, de la conception à la réalisation, en passant par le suivi de chantier.

## Fonctionnalités

- **Gestion de projets** : Création, suivi et gestion de projets architecturaux
- **Gestion des clients** : Base de données clients avec historique des projets
- **Gestion d'équipe** : Attribution de tâches et collaboration entre membres
- **Suivi de chantier** : Rapports de visite, annotations sur plans, suivi d'avancement
- **Calendrier** : Planification des réunions et des échéances
- **Diagramme de Gantt** : Visualisation et gestion du planning des projets
- **Gestion documentaire** : Stockage et partage de documents
- **Messagerie intégrée** : Communication entre membres de l'équipe et clients

## Technologies

- **Frontend** : React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend** : NestJS (PostgreSQL, Auth, Storage, Functions)
- **Stockage** : Backblaze B2
- **Déploiement** : Docker, GitHub Actions

## Prérequis

- Node.js 18+
- npm 9+
- Docker et Docker Compose (pour le développement local)

## Installation

1. Cloner le dépôt
   ```bash
   git clone https://github.com/votre-organisation/archipro.git
   cd archipro
   ```

2. Installer les dépendances
   ```bash
   npm install
   ```

3. Configurer les variables d'environnement
   ```bash
   cp .env.example .env
   # Modifier les valeurs dans .env avec vos propres clés
   ```

4. Lancer le script de configuration du développement
   ```bash
   chmod +x scripts/setup-dev.sh
   ./scripts/setup-dev.sh
   ```

5. Démarrer le serveur de développement
   ```bash
   npm run dev
   ```

## Structure du projet

```
archipro/
├── public/              # Fichiers statiques
├── src/                 # Code source
│   ├── components/      # Composants React
│   ├── contexts/        # Contextes React (auth, theme, etc.)
│   ├── hooks/           # Hooks React personnalisés
│   ├── integrations/    # Intégrations avec des services externes
│   ├── lib/             # Bibliothèques et utilitaires
│   ├── pages/           # Pages de l'application
│   ├── schemas/         # Schémas de validation
│   ├── services/        # Services pour la logique métier
│   └── types/           # Types TypeScript
├── scripts/             # Scripts utilitaires
└── docker-compose.yml   # Configuration Docker Compose
```

## Déploiement

### Staging

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh staging
```

### Production

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh production
```

## Modèle d'abonnement

ArchiPro propose plusieurs formules d'abonnement :

- **Basique** : Pour les architectes indépendants (jusqu'à 5 projets)
- **Professionnel** : Pour les petites agences (jusqu'à 20 projets)
- **Entreprise** : Pour les grandes agences (projets illimités)

## Licence

Propriétaire - Tous droits réservés