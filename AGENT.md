# AGENT.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MVP POC for "Renaturons - Trame pollinisateur" - an interactive map application displaying initiatives aimed at promoting the preservation of pollinators across France. The project is a **monorepo** with a React frontend, a NestJS backend, and shared types.

**Client**: Noe.org
**Status**: Monorepo with backend API proxy for Airtable (migrated from Events to Projects)

## Monorepo Structure

```
make-map/
├── apps/
│   ├── frontend/           # React + Vite (consumes backend API)
│   ├── backend/            # NestJS (Airtable proxy + geocoding)
│   └── map-interactive/    # Original standalone version (unchanged)
├── shared/
│   └── types/              # @make-map/types (shared TypeScript types)
├── turbo.json              # TurboRepo configuration
└── pnpm-workspace.yaml     # pnpm workspaces
```

## Commands

```bash
# From root (recommended)
pnpm install              # Install all workspace dependencies
pnpm dev                  # Start frontend + backend (via turbo)
pnpm front:dev            # Start frontend only (localhost:5173)
pnpm back:dev             # Start backend only (localhost:3000)
pnpm map:dev              # Start original map-interactive
pnpm build                # Build all packages
pnpm lint                 # Lint all packages
```

## Architecture Overview

### Backend (apps/backend) - NestJS

```
src/
├── airtable/               # Airtable API integration
│   ├── airtable.service.ts     # Fetch paginated + transform records
│   ├── airtable.types.ts       # AirtableRecord interface (French field names)
│   └── airtable-mapping.util.ts # Mapping logic
├── geocoding/              # Address geocoding
│   └── geocoding.service.ts    # api-adresse.data.gouv.fr + in-memory cache
├── projects/               # REST API (formerly events)
│   ├── projects.controller.ts  # GET /api/projects, GET /api/projects/:id
│   └── projects.service.ts     # Orchestration + TTL cache (5min)
├── app.module.ts           # Root module (ConfigModule, ProjectsModule)
├── app.controller.ts       # GET /api/health
└── main.ts                 # Bootstrap + CORS config
```

**Key features**:
- Airtable token stays server-side (env var `AIRTABLE_API_KEY`)
- Geocoding via api-adresse.data.gouv.fr with permanent in-memory cache
- 5-minute TTL cache for Airtable data
- CORS configured for localhost dev ports
- `?devMode=true` query param to bypass moderation filter

### Frontend (apps/frontend) - React + Vite

Simplified API layer adapted for Projects:
- `services/api.ts` makes HTTP calls to `/api/projects`
- No Airtable/geocoding code client-side
- Types imported from `@make-map/types` (via re-export in `types/project.ts`)

### Shared Types (@make-map/types)

Shared types in `shared/types/src/project.ts` (re-exported via `index.ts`):
- `Project` - Core project model
- `ProjectType` - Enums (renaturation, restauration, sensibilisation, etc.)
- `GeoJSONProject`, `ProjectsGeoJSON` - GeoJSON representations
- `ClusterFeature`, `ProjectMapFeature` - Supercluster types
- `isProjectCluster` - Type guard for clusters
- Label constants: `PROJECT_TYPE_LABELS`, `PROJECT_TYPE_COLORS`, etc.

### Frontend Application Structure

The frontend follows a **hook-first architecture**:

```
RouterProvider (root)
├── HomePage (/)                 # Landing page hub
├── MapPage (/carte)             # Interactive map with sidebar
│   ├── useProjects hook         # Calls backend API, manages filters
│   ├── MapView component        # MapLibre integration
│   │   ├── useClusters hook     # Supercluster integration
│   │   └── DOMTOMInset          # Overseas territories mini-maps
│   ├── Sidebar component        # Project list & filters
│   └── ProjectListView          # List view with pagination
├── ProjectsListPage (/projets)  # Projects list page
└── ProjectDetailPage (/projet/:id) # Project detail
```

### Data Flow

```
Frontend                    Backend                    External
--------                    -------                    --------
useProjects() ──GET /api/projects──> ProjectsController
                                     └─> ProjectsService (cache check)
                                          └─> AirtableService
                                               ├─> Airtable API (fetch)
                                               ├─> mapping (transform)
                                               └─> GeocodingService
                                                    └─> api-adresse.data.gouv.fr
```

## Design System

Custom design system matching branding (in `tailwind.config.ts`):

**Colors**: `primary` (#003081), `accent-coral` (#f56476), `accent-magenta` (#cc3366), `surface-beige` (#ffeed1)
**Typography**: Rubik (titles), Palanquin (body)

## Environment Variables

**Backend** (`apps/backend/.env`):
```
AIRTABLE_API_KEY=...   # Airtable Personal Access Token
AIRTABLE_BASE_ID=...   # Airtable Base ID
AIRTABLE_TABLE_ID=...  # Airtable Table ID (Projects table)
PORT=3000
```

**Frontend** (`apps/frontend/.env`):
```
VITE_API_URL=http://localhost:3000  # Backend URL
VITE_MAPTILER_KEY=...              # MapTiler API key
```

## Path Aliases

Frontend uses `@/` alias:
```typescript
import { useProjects } from '@/hooks';
import { Project } from '@/types/project';
```

## Performance Considerations

- **Clustering**: Supercluster handles large point sets efficiently
- **Server-side geocoding**: Geocoded once, cached in memory permanently
- **Backend cache**: 5-minute TTL avoids repeated Airtable calls
- **Memoization**: Extensive use of `useMemo` and `useCallback`

## Important Notes

- `apps/map-interactive` is the original standalone version - DO NOT MODIFY
- All French text/labels should remain in French
- Backend is READ-ONLY on Airtable (only GET operations)
- Global nomenclature: Use "Projet" instead of "Événement"
