# Voici la version corrigée du script
#!/bin/bash

# Deployment script for production

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if environment is provided
if [ -z "$1" ]; then
    echo -e "${RED}Please specify an environment (staging or production)${NC}"
    echo -e "Usage: ./deploy.sh [staging|production]"
    exit 1
fi

ENVIRONMENT=$1

echo -e "${GREEN}Deploying to ${ENVIRONMENT}...${NC}"

# Build the application
echo -e "${GREEN}Building the application...${NC}"
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed. Aborting deployment.${NC}"
    exit 1
fi

# Deploy to the specified environment
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${GREEN}Deploying to production...${NC}"
    # Add your production deployment commands here
    # Example: firebase deploy --only hosting
elif [ "$ENVIRONMENT" = "staging" ]; then
    echo -e "${GREEN}Deploying to staging...${NC}"
    # Add your staging deployment commands here
    # Example: firebase hosting:channel:deploy staging
else
    echo -e "${RED}Invalid environment: ${ENVIRONMENT}${NC}"
    echo -e "Valid environments are: staging, production"
    exit 1
fi

# Apply database migrations
echo -e "${GREEN}Applying database migrations...${NC}"
npx supabase db push

# Configurer les buckets de stockage et leurs politiques
echo -e "${GREEN}Configuring storage buckets...${NC}"
npx supabase db execute --file ./supabase/migrations/20250410_storage_buckets.sql

echo -e "${GREEN}Deployment to ${ENVIRONMENT} completed successfully!${NC}"