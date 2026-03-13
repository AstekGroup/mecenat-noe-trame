# Backend API - Trame pollinisateur (Noé)

Backend NestJS servant de proxy sécurisé pour l'API Airtable. Gère la transformation des données, le géocodage et le cache.

## Stack

| Technologie | Usage |
|-------------|-------|
| NestJS 11 | Framework API |
| TypeScript | Langage |
| @nestjs/config | Variables d'environnement |
| api-adresse.data.gouv.fr | Géocodage (API BAN) |

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/projects` | Liste tous les projets (géocodés, filtrés) |
| `GET /api/projects?devMode=true` | Liste tous les projets (sans filtre modération) |
| `GET /api/projects/:id` | Détail d'un projet par son ID Airtable |
| `GET /api/natura2000` | Données GeoJSON des zones Natura 2000 |
| `GET /api/health` | Health check |

## Configuration

Copier `.env.example` en `.env` :

```bash
cp .env.example .env
```

Variables requises :

```env
AIRTABLE_API_KEY=votre_personal_access_token
AIRTABLE_BASE_ID=votre_base_id
AIRTABLE_PROJECTS_TABLE_ID=votre_table_id_projets
PORT=3000
```

## Développement

```bash
# Depuis la racine du monorepo
pnpm back:dev

# Ou directement
cd apps/backend
pnpm dev
```

## Architecture

```
src/
├── airtable/
│   ├── airtable.module.ts
│   ├── airtable.service.ts                  # Fetch paginé + transformation
│   ├── airtable-projects.types.ts           # Interface AirtableProjectRecord
│   └── airtable-projects-mapping.util.ts    # Mapping champs Airtable → types internes
├── geocoding/
│   ├── geocoding.module.ts
│   └── geocoding.service.ts                 # API BAN + cache mémoire
├── projects/
│   ├── projects.module.ts
│   ├── projects.controller.ts               # REST endpoints
│   └── projects.service.ts                  # Orchestration + cache TTL 5min
├── natura2000/
│   ├── natura2000.module.ts
│   ├── natura2000.controller.ts
│   └── natura2000.service.ts                # Chargement GeoJSON local
├── app.module.ts                            # Module racine
├── app.controller.ts                        # Health check global
└── main.ts                                  # Bootstrap + CORS
```

## Cache

- **Géocodage** : Cache mémoire (Map) permanent pendant la durée de vie du process.
- **Projets** : Cache avec TTL de 5 minutes pour éviter de rappeler Airtable à chaque requête.

## Sécurité

- Le token Airtable reste côté serveur (variable d'env `AIRTABLE_API_KEY`).
- CORS configuré pour accepter uniquement les origines autorisées.
- Uniquement des opérations GET (lecture seule sur Airtable).
