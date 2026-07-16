# Backend API - Trame pollinisateur (Noé)

Backend NestJS placé entre le frontend public et Strapi. Il adapte les contenus Strapi au contrat `Project[]`, applique le géocodage et conserve le cache serveur. Le token Strapi n'est jamais exposé au frontend.

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/projects` | Liste des projets Strapi publiés, adaptés et géocodés |
| `GET /api/projects/:id` | Détail d'un projet par son `documentId` Strapi |
| `GET /api/corridors` | Corridors de la Trame pollinisateur depuis le GeoJSON local |
| `GET /api/natura2000` | Zones Natura 2000 en GeoJSON |
| `GET /api/health` | Health check |

`?devMode=true` reste accepté pour compatibilité avec le frontend, mais n'expose pas les brouillons. Une éventuelle prévisualisation éditoriale devra utiliser une route protégée distincte.

## Configuration

```bash
cp .env.example .env
```

```env
STRAPI_API_URL=http://localhost:1337
STRAPI_API_TOKEN=votre_token_strapi_lecture_seule
PROJECT_CACHE_INVALIDATION_SECRET=un_secret_serveur_long_et_aleatoire
PORT=3000
```

Le token doit être limité aux permissions `find` et `findOne` des content-types nécessaires. Le secret d'invalidation est partagé uniquement avec Strapi, qui appelle `POST /api/projects/cache/invalidate` après une mutation éditoriale. Aucun token d'écriture ne doit être transmis au frontend.

## Développement

```bash
# Depuis la racine du monorepo
pnpm back:dev

# Ou depuis apps/backend
pnpm dev
```

## Architecture

```text
src/
├── strapi/                 # Appel REST, pagination et adaptation vers Project[]
├── geocoding/              # API BAN et cache mémoire
├── projects/               # Endpoints publics, cache TTL et invalidation signée
├── corridors/              # GeoJSON local indépendant des projets Strapi
├── natura2000/
├── environmental-layers/
├── app.module.ts
└── main.ts
```

## Sécurité

- Le frontend consomme uniquement les endpoints GET du backend.
- Le token Strapi reste dans l'environnement backend.
- L'endpoint d'invalidation ne modifie aucune donnée et reste fermé sans secret serveur valide.
- Seuls les projets publiés sont servis par l'endpoint public.
- Les écritures passent par Strapi Admin ou une route serveur explicitement protégée.
