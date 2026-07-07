# AUDIT_PHASE0.md - Audit du repo et de la carte existante

Audit en lecture seule du flux actuel `frontend -> NestJS -> Airtable + geocodage`, realise avant toute installation Strapi. Aucun comportement applicatif n'a ete modifie. `apps/map-interactive` n'a ete qu'inspecte en lecture.

## 1. Objet et perimetre

Capturer l'etat de reference de la carte Trame pollinisateur avant la migration Airtable vers Strapi (Phases 1 a 4). Sert de base de comparaison pour valider une migration mecanique sans regression.

## 2. Architecture actuelle

Monorepo pnpm + TurboRepo. Trois applications, un package de types partage.

| Package | Role |
|---|---|
| `apps/frontend` | React + Vite. Vitrine, carte, liste, filtres, detail. Consomme le backend. |
| `apps/backend` | NestJS. Proxy securise Airtable, geocodage, calques GeoJSON locaux. |
| `apps/map-interactive` | Application standalone heritee du POC Semaine IA. Reference fonctionnelle, non modifiee. |
| `shared/types` | `@make-map/types`. Types `Project`, `ProjectType`, `GeoJSONProject`, `ProjectsGeoJSON`, `REGIONS`, labels et couleurs. |

## 3. Flux de donnees

```
React (apps/frontend)
  └─ services/api.ts  ->  GET /api/projects  ->  Project[]
       └─ projectsToGeoJSON()  ->  ProjectsGeoJSON  ->  MapView + useClusters (Supercluster)
       └─ filtres cote client (useProjects)  ->  liste, sidebar, stats

NestJS (apps/backend)
  └─ ProjectsController  ->  ProjectsService (cache TTL 5 min)
       └─ AirtableService.fetchProjects()
            ├─ fetch pagine Airtable REST (token serveur)
            ├─ transformProjectRecord() : champs Airtable FR -> Project
            └─ GeocodingService.batchGeocode() : api-adresse.data.gouv.fr (BAN)
```

Le frontend ne connait ni Airtable ni le geocodage : tout passe par le backend qui garde le token serveur et le cache. Les calques GeoJSON (Natura 2000, corridors, calques environnementaux) sont lus depuis des fichiers locaux dans `apps/backend/src/data/` et exposes par le backend.

## 4. Endpoints NestJS

| Endpoint | Sortie | Notes |
|---|---|---|
| `GET /api/health` | `{ status, timestamp, service }` | Health check. |
| `GET /api/projects` | `Project[]` | `?devMode=true` pour inclure d'eventuels projets non publies. |
| `GET /api/projects/:id` | `Project` | `404` si introuvable. `:id` = identifiant Airtable. |
| `GET /api/natura2000` | GeoJSON `FeatureCollection` | Fichier local `src/data/natura2000-simple.json`. |
| `GET /api/corridors` | GeoJSON `FeatureCollection` | Fichier local `src/data/TramePollinisateursGjson.geojson`, conversion Lambert 93 -> WGS 84 via proj4. |
| `GET /api/environmental-layers/:layerName` | GeoJSON `FeatureCollection` | Fichier `src/data/environmental-layers/{layerName}-simple.json`. |

CORS : `methods: 'GET'` uniquement, origine configurable via `CORS_ORIGIN`. Lecture seule partout.

## 5. Comportement proxy Airtable + geocodage + cache

### Airtable
- `AirtableService.fetchProjectRecords()` : pagination `pageSize=100` + `offset`, header `Authorization: Bearer ${AIRTABLE_API_KEY}`.
- Variables lues : `AIRTABLE_API_KEY`, `AIRTABLE_PROJECTS_BASE_ID` (fallback `AIRTABLE_BASE_ID`), `AIRTABLE_PROJECTS_TABLE_ID`.
- `buildProjectsFilterFormula(devMode)` retourne actuellement `null` : aucun filtrage cote Airtable pour l'instant. La moderation n'est donc PAS encore appliquee a la source.
- Mapping champs Airtable (FR) -> `Project` dans `airtable-projects-mapping.util.ts` (cf. section 7).

### Geocodage
- `GeocodingService` : API BAN `https://api-adresse.data.gouv.fr/search/`, `limit=1`.
- Batch par 8, delai 100 ms entre lots. Cache memoire permanent (Map) pour la duree du process.
- Resultat : `{ latitude, longitude, region, department, cityCode }`. Region/departement derives du `context` BAN, avec fallback par code postal (table `DEPT_TO_REGION`).
- Les projets dont `latitude === 0` ou `longitude === 0` sont **exclus de la carte** par `projectsToGeoJSON()` cote frontend.

### Cache
- Projets : cache TTL 5 min, separe prod / devMode.
- Geocodage : cache memoire permanent.
- Calques GeoJSON : cache memoire apres premier chargement.

## 6. Forme de donnees attendue

### Contract canonique : `Project` (`shared/types/src/project.ts`)

```ts
interface Project {
  id: string;                 // identifiant Airtable
  title: string;
  description: string;
  address: string;
  city: string;
  region: Region;             // valeur de REGIONS (cf. ci-dessous)
  department: string;
  postalCode: string;
  latitude: number;           // 0 si non geocode -> exclu de la carte
  longitude: number;
  type: ProjectType;
  owner: string;
  ownerProfile?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  habitatType?: string | string[];
  extent?: string;
  reasonedPracticeTypes?: string[];
  renaturationTypes?: string[];
  sensitizationTitle?: string;
  trainingTitle?: string;
  consultationType?: string;
  followUpType?: string;
  followUpFrequency?: string;
  isOngoing?: boolean;
}
```

### `ProjectType` (enum + labels + couleurs)

`'pratiques-raisonnees' | 'renaturation-restauration' | 'sensibilisation' | 'formation' | 'consultation' | 'suivis'`. Labels et couleurs dans `PROJECT_TYPE_LABELS` / `PROJECT_TYPE_COLORS`. Le mapping Airtable -> `ProjectType` est tolérant (recherche de mots-cles) avec valeur par defaut `renaturation-restauration`.

### Forme consommee par la carte : `ProjectsGeoJSON`

```ts
interface ProjectsGeoJSON {
  type: 'FeatureCollection';
  features: GeoJSONProject[];   // { type:'Feature', properties: Project, geometry:{ type:'Point', coordinates:[lng, lat] } }
}
```

Conversion cote frontend par `projectsToGeoJSON(projects)` : filtre `latitude !== 0 && longitude !== 0`, `coordinates = [longitude, latitude]`. Clustering Supercluster (`useClusters`, radius 75, maxZoom 16).

### `REGIONS` (valeurs exactes a preserver)

13 regions metropolitaines + 5 DOM-TOM : `Guadeloupe`, `Martinique`, `Guyane`, `La Reunion`, `Mayotte`. Les noms DOM-TOM sont utilises en cle par `DOMTOMInset` pour filtrer les encarts : **ces chaines exactes sont un contract fonctionnel**.

### Forme attendue par liste, filtres et detail

- Liste (`ProjectsListPage` + `ProjectListView` + `ProjectFiltersBar`) : consomme `projects` filtres + `stats` depuis `useProjects`.
- Filtres (`useProjects`) : etat ephemere en memoire (non reflete dans l'URL).
  - Recherche : `title`, `description`, `city`, `owner`, `region` (insensible a la casse).
  - Regions : correspondance exacte avec `project.region`.
  - Types : correspondance exacte avec `project.type`.
  - Code postal : `project.postalCode.startsWith(filters.postalCode)`.
  - Toggles calques : `showNatura2000`, `showCorridors` (actif par defaut), parcs, reserves, calques administratifs IGN.
- Detail (`ProjectDetailPage`) : utilise `allProjects.find(p => p.id === id)`. **Ne appelle pas `fetchProjectById`** : la page de detail depend du chargement complet de la liste. `:id` = identifiant Airtable.

## 7. Mapping champs Airtable -> `Project` (schema source a reproduire)

| Champ Airtable | Champ `Project` | Remarque |
|---|---|---|
| `Nom du projet` | `title` | Defaut `'Projet sans titre'`. |
| `Description` | `description` | Defaut `''`. |
| `Adresse` | `address` | trim. |
| `Code postal` | `postalCode` | trim. |
| `Ville` | `city` | trim. |
| `Région` | `region` | Fallback geocodage / code postal, defaut `Île-de-France`. |
| `Département` | `department` | trim, ecrase par geocodage si dispo. |
| `Type d'action` | `type` | Mapping tolérant par mots-cles. |
| `Acteur porteur` | `owner` | |
| `Profil du porteur de projet` | `ownerProfile` | Premier element si tableau. |
| `Email de contact` | `contactEmail` | |
| `Téléphone de contact` | `contactPhone` | |
| `Site web` | `website` | |
| `Projet en cours ?` | `isOngoing` | Bool ou chaine commencant par `oui`. |
| `Type de milieu` | `habitatType` | |
| `Emprise` | `extent` | |
| `Type de pratiques raisonnees` | `reasonedPracticeTypes` | |
| `Type de renaturation` | `renaturationTypes` | |
| `Titre de la sensibilisation` | `sensitizationTitle` | |
| `Titre de la formation` | `trainingTitle` | |
| `Type de consultation` | `consultationType` | Premier element si tableau. |
| `Type de suivi` | `followUpType` | Premier element si tableau. |
| `Fréquence de suivi` | `followUpFrequency` | |

## 8. Routage et points d'integration (iframe vs React direct)

### Modele de routage
- `createBrowserRouter` (React Router v6 data router) dans `apps/frontend/src/router.tsx`, branche via `RouterProvider`.
- 4 routes : `/` (accueil), `/carte` (carte), `/projets` (liste), `/projet/:id` (detail).
- Navigation via `useNavigate`, `Link`, `useParams`. Pas de `basename` configure.
- Les filtres et la selection carte sont **ephemeres** (etat React, jamais dans l'URL).

### Points a preserver pour la decision iframe vs integration directe
1. **History API sans `basename`** : in-app navigation OK dans un iframe, mais le parent ne peut pas deep-linker vers une route interne de l'iframe sans controle same-origin. Un `HashRouter` ou un `basename` serait necessaire pour un embedding multi-origine avec deep-linking.
2. **Filtres non URL** : impossible de deep-linker vers un etat filtre depuis le parent. Si l'integration iframe exige un filtrage pilotable, il faut ajouter une sync URL (ou des query params lus au demarrage).
3. **Layout plein ecran** : `MapPage` est `h-screen w-screen`. Fonctionne en iframe dimensionnee ; une integration React directe dans la vitrine necessitera de conteneuriser `MapView` au lieu d'occuper tout le viewport.
4. **Decouplage favorable** : `MapView` recoit `geojson` en props et ne fetch rien ; `useProjects` porte le chargement. `onViewProjectDetails` est un callback, donc la navigation vers le detail est abstraite -> reutilisable dans un hote.
5. **Detail depend de la liste complete** : `ProjectDetailPage` utilise `allProjects.find`, pas `fetchProjectById`. Une integration directe devra soit conserver ce prechargement, soit basculer la page de detail vers `fetchProjectById` (deja implemente cote backend et frontend mais non branche).
6. **Base d'API** : `VITE_API_URL` vide en prod = chemins relatifs proxy par Caddy. En iframe sur une autre origine, il faut une URL absolue ou un proxy. Point de configuration, pas bloquant.
7. **Tuiles de carte** : styles auto-heberges dans `apps/frontend/public/map-style-*-fr.json`. `VITE_MAPTILER_KEY` est declare dans `.env.example` mais non reference dans `src/` (cle probablement vestigielle ou embarquee dans les styles). A verifier avant de redeployer.

## 9. Commandes de validation minimales

| Objectif | Commande | Couvre |
|---|---|---|
| Tests backend | `pnpm --filter @make-map/backend test` | Unitaires (mapping, geocodage, projects, natura2000). |
| Tests e2e backend | `pnpm --filter @make-map/backend test:e2e` | `app.e2e-spec.ts`. |
| Tests frontend | `pnpm --filter @make-map/frontend test` | `useProjects`, `useClusters`, `useMapViewport`, `api`. |
| Lint frontend | `pnpm --filter @make-map/frontend lint` | Qualite de code. |
| Build frontend | `pnpm --filter @make-map/frontend build` | Compilation TS + bundle Vite. |
| Build tout | `pnpm build` | Turbo build (types, backend, frontend). |
| Lint tout | `pnpm lint` | Turbo lint. |
| Runtime carte | `pnpm dev` + navigateur sur `/carte` | Comportement reel (necessite env Airtable + backend). |
| Health backend | `curl http://localhost:3000/api/health` | Demarrage backend. |

Preuve minimale sans Airtable avant modification applicative : `pnpm --filter @make-map/backend test && pnpm --filter @make-map/frontend test && pnpm --filter @make-map/frontend build`. Preuve complete du comportement carte : `pnpm dev` avec env Airtable renseigne + verification navigateur de `/carte`, `/projets`, `/projet/:id`.

## 10. Contrats / baseline a capturer avant migration

A conserver comme base de comparaison en Phase 4 :

1. **Type `Project`** (section 6) - contract canonique, deja dans `shared/types`.
2. **Forme `ProjectsGeoJSON`** (section 6) - ce que la carte consomme reellement.
3. **Mapping champs Airtable** (section 7) - schema source a reproduire dans Strapi.
4. **`ProjectType` + labels + couleurs** - taxonomie metier.
5. **`REGIONS`** (chaines exactes, surtout DOM-TOM) - dependance fonctionnelle des encarts.
6. **Contrats d'endpoints** (section 4) - formes de reponse attendues.
7. **Contract de geocodage** - BAN, exclusion `lat/lng === 0`, derivation region/departement.
8. **Exemple sanitize de `Project`** (ci-dessous) - fixture de comparaison.

### Exemple sanitize de `Project` (donnees fictives)

```json
{
  "id": "recExemple0001",
  "title": "Exemple de renaturation",
  "description": "Restauration d'une zone humide pollinisatrice (donnees fictives).",
  "address": "12 rue exemple",
  "city": "Lyon",
  "region": "Auvergne-Rhône-Alpes",
  "department": "Rhône",
  "postalCode": "69000",
  "latitude": 45.764043,
  "longitude": 4.835659,
  "type": "renaturation-restauration",
  "owner": "Structure exemple",
  "ownerProfile": "Association",
  "contactEmail": "contact@exemple.org",
  "website": "https://exemple.org",
  "habitatType": ["Zone humide", "Prairie"],
  "extent": "2 ha",
  "renaturationTypes": ["Restauration de prairie"],
  "isOngoing": true
}
```

## 11. Ecarts et risques releves

- **`devMode` sans effet reel** : `buildProjectsFilterFormula` retourne `null` ; `devMode` ne change donc pas le jeu de donnees aujourd'hui. Cote UI, `toggleDevMode` est expose par `useProjects` mais non branche a aucun controle. La moderation n'est pas encore appliquee -> a modeliser en Phase 2 (Draft/Publish Strapi).
- **`fetchProjectById` non utilise** : la page de detail lit dans `allProjects`. Disponible cote backend/frontend mais debranche. Point d'architecture a trancher avant integration directe.
- **`reserves-biologiques` absent** : `useProjects` demande le calque `reserves-biologiques` mais aucun fichier `reserves-biologiques-simple.json` n'existe dans `src/data/environmental-layers/`. Le service retourne une `FeatureCollection` vide. Calque silencieusement inactif.
- **`.env.example` backend partiellement desynchronise** : declare `AIRTABLE_TABLE_ID`, le code lit `AIRTABLE_PROJECTS_TABLE_ID` (avec fallback base `AIRTABLE_BASE_ID` / `AIRTABLE_PROJECTS_BASE_ID`). Le README backend est correct, le `.env.example` a aligner.
- **`VITE_MAPTILER_KEY` non reference dans `src/`** : a verifier avant redeploiement (cle vestigielle ou embarquee dans les styles auto-heberges).
- **Filtres ephemeres** : aucun etat partage par URL. Risque pour une integration iframe pilotable depuis le parent.

## 12. Conclusion Phase 0

La carte est un client lecture seule d'un backend NestJS qui securise Airtable et le geocodage. Le contract a preserver pour une migration mecanique est : endpoint `GET /api/projects` -> `Project[]`, converti cote frontend en `ProjectsGeoJSON` (Point `[lng, lat]`, exclusion `lat/lng === 0`), avec `region` reprenant exactement les chaines de `REGIONS`. La moderation et le routage iframe sont les deux sujets ouverts a trancher en Phase 1+.
