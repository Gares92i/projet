# Utilise une image Node officielle
FROM node:20

# Crée le dossier de travail
WORKDIR /app/archihub-backend

# Copie les fichiers de config nécessaires AVANT npm install
COPY package*.json ./
COPY tsconfig*.json ./

# Installe les dépendances
RUN npm install --production

# Copie tout le code du backend
COPY . .

# Build le projet NestJS
RUN npm run build

# Expose le port (à adapter si besoin)
EXPOSE 3000

# Commande de démarrage
CMD ["node", "dist/main.js"]