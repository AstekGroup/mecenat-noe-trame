# Make Map - Trame pollinisateur (Noé)

Carte interactive pour visualiser les projets de renaturation et de préservation de la biodiversité de la [Trame pollinisateur](https://noe.org) (Noé) à travers la France.

**Client** : Noé | **Stack** : React + NestJS + MapLibre GL JS + Strapi | **Monorepo** : pnpm + TurboRepo

Strapi est la source active unique des projets. Le frontend passe toujours par le backend NestJS, qui conserve le géocodage, le cache et les transformations métier.

## Structure du projet

```
make-map/
├── apps/
│   ├── frontend/           # React + Vite (consomme l'API backend)
│   ├── backend/            # NestJS (adaptation Strapi + géocodage)
│   └── strapi/             # Strapi v5 (CMS headless, SQLite)
├── shared/
│   └── types/              # @make-map/types (types TypeScript partagés)
├── deploy/                 # Docker Compose + Caddy (production)
├── scripts/                # Scripts de déploiement
├── resources/              # Analyses et design system de référence
├── turbo.json
└── pnpm-workspace.yaml
```

## Démarrage rapide

### Prérequis

- Node.js 22+
- pnpm 11.7+

### Installation

```bash
pnpm install
```

### Variables d'environnement

Copier les fichiers `.env.example` et renseigner les valeurs :

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

| Variable | Où | Description |
|---|---|---|
| `STRAPI_API_URL` | backend | URL de l'API Strapi (`http://localhost:1337`) |
| `STRAPI_API_TOKEN` | backend | Token Strapi limité à la lecture des contenus nécessaires |
| `VITE_API_URL` | frontend | URL du backend (`http://localhost:3000`) |

### Lancer le projet

```bash
# Strapi + backend + frontend ensemble
pnpm dev:all

# Ou séparément
pnpm strapi:dev  # Strapi (port 1337)
pnpm back:dev    # Backend (port 3000)
pnpm front:dev   # Frontend (port 5173)
```

## Applications

### Backend (`apps/backend`)

API NestJS sécurisée entre le frontend et Strapi. Le token Strapi reste côté serveur.

- **API** : `GET /api/projects` · `GET /api/projects/:id` · `GET /api/health` · `GET /api/natura2000`
- Géocodage via [api-adresse.data.gouv.fr](https://adresse.data.gouv.fr) avec cache permanent
- Cache TTL 5 min pour les projets Strapi
- `?devMode=true` reste accepté pour compatibilité, mais n'expose jamais les brouillons Strapi sur l'endpoint public.

### Frontend (`apps/frontend`)

Application React avec carte interactive MapLibre GL JS.

- Clustering (Supercluster) pour les projets de renaturation
- Filtres par type de projet, région, Natura 2000
- Vue carte + vue liste avec pagination
- Encarts DOM-TOM
- Calques administratifs (Régions, Départements, EPCI, Communes) via Vector Tiles IGN
- Design system calé sur la charte Noé (Rubik / Montserrat)

### Strapi (`apps/strapi`)

CMS Strapi v5 (TypeScript, SQLite en local) avec les projets, départements, partenaires et taxonomies utiles à la carte.

```bash
pnpm strapi:dev    # Strapi Admin sur http://localhost:1337/admin
```

**Configuration locale :**

```bash
cp apps/strapi/.env.example apps/strapi/.env
# Générer les clés : openssl rand -base64 32
```

| Variable | Description |
|---|---|
| `APP_KEYS` | Clés de session (2 valeurs séparées par virgule) |
| `API_TOKEN_SALT` | Sel pour les tokens API |
| `ADMIN_JWT_SECRET` | Secret JWT admin |
| `TRANSFER_TOKEN_SALT` | Sel pour les tokens de transfert |
| `STRAPI_DISABLE_NPS` | Désactiver le programme d'amélioration Strapi |

**Fichiers ignorés par Git :** `.env`, `data/` (SQLite), `dist/`, `.cache/`, `.strapi/`, `public/uploads/`.

## Package partagé

### @make-map/types (`shared/types`)

Types TypeScript partagés : `Project`, `ProjectType`, `GeoJSONProject`, constantes de labels, liste des régions.

## Déploiement

Instance **Scaleway** avec Docker Compose : Caddy (HTTPS auto) + Nginx (frontend) + NestJS (backend).

```bash
pnpm deploy:v2
```

Voir [deploy/README.md](deploy/README.md) pour le guide complet.

## Ressources

- [AGENTS](AGENTS.md) : consignes de travail pour les agents IA.
- [CONSTITUTION](CONSTITUTION.md) : règles techniques non négociables.
- [DECISION](DECISION.md) : décisions d'architecture acceptées.
- [ROADMAP](ROADMAP.md) : feuille de route active.
- [ROADMAP_HISTORY](ROADMAP_HISTORY.md) : archive des phases terminées.
- [Correspondance Airtable - Strapi](DATA_MODEL_AIRTABLE_STRAPI.md) : champs, types, listes contrôlées et exposition publique.
- [DEVPLAN_HISTORY](DEVPLAN_HISTORY.md) : historique du POC initial.

## Liens

- Site officiel : https://noe.org
- Organisateur : [Noé](https://noe.org)

---

**POC - Astek Innovation Lab**
