#!/bin/bash

# ============================================================
# Script de déploiement sur Scaleway DEV1-S
# Usage: pnpm deploy:v2
#
# Prérequis:
#   - Instance Scaleway DEV1-S créée avec Docker installé
#   - Clé SSH configurée pour se connecter à l'instance
#   - envmap configuré avec les secrets de production
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Déploiement Make Map - Scaleway DEV1-S${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================================
# 1. Charger les secrets via envmap
# ============================================================

echo -e "${YELLOW}[1/5] Chargement des secrets...${NC}"

if command -v envmap &> /dev/null && [ -f ".envmap.yaml" ]; then
    SCW_INSTANCE_IP=$(envmap get --env prod SCW_INSTANCE_IP --raw 2>/dev/null | tr -d '\001' || echo "")
    STRAPI_API_URL=$(envmap get --env prod STRAPI_API_URL --raw 2>/dev/null | tr -d '\001' || echo "")
    STRAPI_API_TOKEN=$(envmap get --env prod STRAPI_API_TOKEN --raw 2>/dev/null | tr -d '\001' || echo "")
    VITE_MAPTILER_KEY=$(envmap get --env prod VITE_MAPTILER_KEY --raw 2>/dev/null | tr -d '\001' || echo "")
    DOMAIN=$(envmap get --env prod DOMAIN --raw 2>/dev/null | tr -d '\001' || echo "localhost")
fi

# Fallback sur variables d'environnement si envmap pas dispo
SCW_INSTANCE_IP="${SCW_INSTANCE_IP:-$SCW_INSTANCE_IP}"
DEPLOY_USER="${DEPLOY_USER:-root}"

# Validation
if [ -z "$SCW_INSTANCE_IP" ]; then
    echo -e "${RED}Erreur: SCW_INSTANCE_IP non défini${NC}"
    echo "Configurez-le avec: envmap set --env prod SCW_INSTANCE_IP --prompt"
    echo "Ou exportez: export SCW_INSTANCE_IP=x.x.x.x"
    exit 1
fi

if [ -z "$STRAPI_API_URL" ]; then
    echo -e "${RED}Erreur: STRAPI_API_URL non défini${NC}"
    exit 1
fi

if [ -z "$STRAPI_API_TOKEN" ]; then
    echo -e "${RED}Erreur: STRAPI_API_TOKEN non défini${NC}"
    exit 1
fi

echo -e "  Instance: ${GREEN}${DEPLOY_USER}@${SCW_INSTANCE_IP}${NC}"
echo -e "  Domaine:  ${GREEN}${DOMAIN:-localhost}${NC}"
echo ""

# ============================================================
# 2. Préparer les fichiers à envoyer
# ============================================================

echo -e "${YELLOW}[2/5] Préparation des fichiers...${NC}"

REMOTE_DIR="/opt/make-map"
SSH_CMD="ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${SCW_INSTANCE_IP}"

# Créer le répertoire distant
$SSH_CMD "mkdir -p ${REMOTE_DIR}/deploy"

# Sync les fichiers nécessaires via rsync
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.turbo' \
    --exclude 'dist' \
    --exclude '.git' \
    --exclude '*.md' \
    --exclude '.cursor' \
    --exclude '.vscode' \
    --exclude 'coverage' \
    --exclude '.env' \
    --exclude '.env.local' \
    --exclude '.env.*.local' \
    ./ ${DEPLOY_USER}@${SCW_INSTANCE_IP}:${REMOTE_DIR}/

echo -e "  ${GREEN}Fichiers synchronisés${NC}"
echo ""

# ============================================================
# 3. Créer le fichier .env.prod sur le serveur
# ============================================================

echo -e "${YELLOW}[3/5] Configuration des variables d'environnement...${NC}"

$SSH_CMD "cat > ${REMOTE_DIR}/deploy/.env.prod << 'ENVEOF'
STRAPI_API_URL=${STRAPI_API_URL}
STRAPI_API_TOKEN=${STRAPI_API_TOKEN}
VITE_MAPTILER_KEY=${VITE_MAPTILER_KEY}
DOMAIN=${DOMAIN:-localhost}
CORS_ORIGIN=*
ENVEOF"

echo -e "  ${GREEN}.env.prod créé sur le serveur${NC}"
echo ""

# ============================================================
# 4. Build et démarrage des containers
# ============================================================

echo -e "${YELLOW}[4/5] Build et démarrage des containers Docker...${NC}"

$SSH_CMD "cd ${REMOTE_DIR}/deploy && \
    docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build --remove-orphans"

echo -e "  ${GREEN}Containers démarrés${NC}"
echo ""

# ============================================================
# 5. Health check
# ============================================================

echo -e "${YELLOW}[5/5] Vérification du déploiement...${NC}"

# Attendre que le backend soit prêt
echo -e "  Attente du backend..."
for i in $(seq 1 30); do
    if $SSH_CMD "wget -q --spider http://localhost:8080/api/health 2>/dev/null" 2>/dev/null; then
        echo -e "  ${GREEN}Backend OK${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "  ${RED}Backend non disponible après 30 tentatives${NC}"
        echo -e "  Vérifiez les logs: ssh ${DEPLOY_USER}@${SCW_INSTANCE_IP} 'cd ${REMOTE_DIR}/deploy && docker compose -f docker-compose.prod.yml logs'"
        exit 1
    fi
    sleep 2
done

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Déploiement terminé !${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "${DOMAIN}" != "localhost" ] && [ -n "${DOMAIN}" ]; then
    echo -e "  Frontend: ${BLUE}https://${DOMAIN}${NC}"
    echo -e "  API:      ${BLUE}https://${DOMAIN}/api/projects${NC}"
    echo -e "  Health:   ${BLUE}https://${DOMAIN}/api/health${NC}"
else
    echo -e "  Frontend: ${BLUE}http://${SCW_INSTANCE_IP}${NC}"
    echo -e "  API:      ${BLUE}http://${SCW_INSTANCE_IP}/api/projects${NC}"
    echo -e "  Health:   ${BLUE}http://${SCW_INSTANCE_IP}/api/health${NC}"
fi

echo ""
echo -e "  Logs:     ssh ${DEPLOY_USER}@${SCW_INSTANCE_IP} 'cd ${REMOTE_DIR}/deploy && docker compose -f docker-compose.prod.yml logs -f'"
echo ""
