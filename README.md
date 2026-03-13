# Make Map - Trame pollinisateur (Noé)

Carte interactive pour visualiser les projets de renaturation et de préservation de la biodiversité de la [Trame pollinisateur](https://noe.org) (Noé) à travers la France.

**Client** : Noé | **Stack** : React + NestJS + MapLibre GL JS | **Monorepo** : pnpm + TurboRepo

## Structure du projet

```
make-map/
├── apps/
│   ├── frontend/           # React + Vite (consomme l'API backend)
│   ├── backend/            # NestJS (proxy Airtable + géocodage)
│   └── map-interactive/    # Version standalone originale (référence)
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

- Node.js 18+
- pnpm 9+

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
| `AIRTABLE_API_KEY` | backend | Personal Access Token Airtable |
| `AIRTABLE_BASE_ID` | backend | ID de la base (commence par `app`) |
| `AIRTABLE_PROJECTS_TABLE_ID` | backend | ID de la table des projets (commence par `tbl`) |
| `VITE_API_URL` | frontend | URL du backend (`http://localhost:3000`) |

### Lancer le projet

```bash
# Frontend + backend ensemble
pnpm dev

# Ou séparément
pnpm back:dev    # Backend (port 3000)
pnpm front:dev   # Frontend (port 5173)
```

## Applications

### Backend (`apps/backend`)

Proxy sécurisé NestJS pour l'API Airtable. Le token reste côté serveur.

- **API** : `GET /api/projects` · `GET /api/projects/:id` · `GET /api/health` · `GET /api/natura2000`
- Géocodage via [api-adresse.data.gouv.fr](https://adresse.data.gouv.fr) avec cache permanent
- Cache TTL 5 min pour les données Airtable
- `?devMode=true` pour bypasser le filtre de modération

### Frontend (`apps/frontend`)

Application React avec carte interactive MapLibre GL JS.

- Clustering (Supercluster) pour les projets de renaturation
- Filtres par type de projet, région, Natura 2000
- Vue carte + vue liste avec pagination
- Encarts DOM-TOM
- Calques administratifs (Régions, Départements, EPCI, Communes) via Vector Tiles IGN
- Design system calé sur la charte Noé (Rubik / Montserrat)

### map-interactive (`apps/map-interactive`)

Version standalone originale (Semaine IA). Conservée comme référence, non modifiée.

```bash
pnpm map:dev
```

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

- [DEVPLAN](DEVPLAN.md) : Suivi des étapes de développement.

## Liens

- Site officiel : https://noe.org
- Organisateur : [Noé](https://noe.org)

---

**POC - Astek Innovation Lab**
