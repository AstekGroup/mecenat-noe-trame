# ROADMAP.md

Feuille de route active pour la migration Strapi et la consolidation du site Trame pollinisateur.

## Objectif courant

Remplacer progressivement Airtable par Strapi sans regression visible sur la carte, puis construire le site vitrine React en s'appuyant sur la charte officielle et les references de maquette.

## Mode de suivi

Chaque phase porte un statut explicite pour faciliter la lecture humaine et agent IA.

Statuts autorises :

- `Historique` : acquis herite du POC initial, a ne pas refaire sans besoin explicite.
- `A faire` : travail identifie, pas encore commence.
- `En cours` : travail commence, non finalise.
- `Bloque` : decision, acces ou validation manquante.
- `Termine` : phase validee avec verification reproductible.

Regle de mise a jour :

- Cocher une tache seulement apres verification ou justification documentee.
- Laisser une tache non cochee en cas de doute.
- Ajouter une note courte plutot que supposer qu'une tache est terminee.
- Mettre le statut d'une phase a `En cours` des qu'un travail y est engage.
- Mettre le statut d'une phase a `Bloque` si la suite depend d'une decision, d'un acces ou d'une information manquante.
- Mettre le statut d'une phase a `Termine` seulement quand toutes ses taches sont cochees et que la verification de phase est documentee.
- Si une phase impose une nouvelle decision d'architecture, mettre a jour `DECISION.md` avant implementation.

Responsabilite de chaque agent :

- Tout agent qui execute une tache de cette feuille de route doit mettre a jour cette feuille avant de terminer son intervention.
- Si le travail est partiel, conserver la case non cochee et ajouter une note courte sous la tache concernee.
- Si une tache est decoupee, ajouter les sous-taches utiles au meme endroit pour que la session suivante reprenne sans rediscovery.
- Les documents `DECISION.md`, `CONSTITUTION.md` et `AGENTS.md` ne doivent etre modifies que lorsque leur role specifique l'exige.

## Socle existant herite du POC initial

**Statut :** Historique

Ce socle decrit ce qui existe deja dans le depot avant la migration Strapi. `DEVPLAN_HISTORY.md` conserve le detail historique du POC au 13 mars 2026.

- [x] Monorepo pnpm et TurboRepo en place.
- [x] Package de types partages `@make-map/types` en place.
- [x] Frontend React + Vite en place.
- [x] Backend NestJS en place.
- [x] Proxy Airtable cote serveur en place.
- [x] Geocodage serveur via `api-adresse.data.gouv.fr` en place.
- [x] Carte MapLibre avec clustering Supercluster en place.
- [x] Navigation React Router avec accueil, carte, liste et detail en place.
- [x] Gestion des DOM/TOM via encarts interactifs en place.
- [x] Filtres et synchronisation carte/liste en place.
- [x] Calques administratifs et Natura 2000 en place.
- [x] Scripts Docker, Docker Compose, Caddy et deploiement en place.

## Phase 0 - Audit du repo et de la carte existante

**Statut :** Termine

Audit en lecture seule realise sans modifier le comportement applicatif et sans toucher `apps/map-interactive`. Detail dans [`AUDIT_PHASE0.md`](AUDIT_PHASE0.md).

- [x] Identifier les flux de donnees actuels entre frontend, NestJS, Airtable et geocodage. -> AUDIT_PHASE0.md sections 3-5.
- [x] Documenter la forme exacte attendue par la carte, les filtres, la liste et les pages de detail. -> AUDIT_PHASE0.md section 6.
- [x] Capturer des contrats de reponse ou exemples sanitises des endpoints actuels pour servir de base de comparaison en Phase 4. -> AUDIT_PHASE0.md sections 4, 6, 7 et exemple sanitize section 10.
- [x] Verifier le role de `apps/map-interactive` comme reference fonctionnelle. -> AUDIT_PHASE0.md section 2 (reference standalone heritee, non modifiee).
- [x] Definir les commandes de validation minimales avant migration. -> AUDIT_PHASE0.md section 9.
- [x] Relever les points de routage qui pourraient bloquer une integration directe dans la vitrine. -> AUDIT_PHASE0.md section 8 (History API sans `basename`, filtres ephemeres, layout plein ecran, detail dependant de la liste).

**Verification de phase :** audit documentaire en lecture seule. Aucun code modifie et aucune validation runtime lancee pour cette phase. La verification repose sur l'exactitude de `AUDIT_PHASE0.md` et la coherence avec le code inspecte. Commandes de validation de la carte existante listees en section 9 (a lancer avant toute modification applicative puis en Phase 4 pour la comparaison avant/apres).

**Sujets ouverts a trancher en Phase 1+ :**
- `devMode` actuellement sans effet reel (`buildProjectsFilterFormula` retourne `null`) ; moderation a modeliser via Draft/Publish Strapi.
- `fetchProjectById` debranche (la page de detail lit dans `allProjects`).
- Calque `reserves-biologiques` absent des donnees locales (retourne une collection vide).
- `.env.example` backend a aligner avec `AIRTABLE_PROJECTS_TABLE_ID`.
- Decision iframe vs integration React directe a documenter dans `DECISION.md` avant Phase 5.

## Phase 1 - Installation Strapi native

**Statut :** Termine

Strapi v5.50.0 (TypeScript, SQLite) ajoute nativement dans `apps/strapi`. Aucun content-type cree (Phase 2). Aucun comportement frontend/backend modifie.

- [x] Ajouter Strapi au monorepo de facon minimale et explicite. -> `apps/strapi/` avec package.json, tsconfig, config (database, server, admin, middlewares, plugins), src/index.ts, src/admin/app.example.ts.
- [x] Configurer les environnements locaux sans secrets suivis par Git. -> `apps/strapi/.env.example` avec cles a generer, `.env` ignore, `data/` (SQLite) ignore.
- [x] Verifier que Strapi demarre localement sans perturber frontend et backend existants. -> `strapi develop` demarre sur port 1337, health check 204, admin panel accessible. Tests frontend (31) et backend (46) restent verts.
- [x] Documenter les commandes de demarrage et les limites connues. -> README.md section Strapi, script `pnpm strapi:dev`.
- [x] Confirmer que les fichiers generes ou locaux sensibles restent ignores par Git. -> `apps/strapi/.gitignore` ignore `.env`, `data/`, `dist/`, `.cache/`, `.strapi/`, `.strapi-updater.json`, `public/uploads/`.

**Verification de phase :**
- Strapi demarre : `GET /_health` -> 204, `POST /admin/register-admin` -> 200.
- Tests frontend : 31 passes (3 fichiers) — identique au baseline.
- Tests backend : 46 passes (7 suites) — identique au baseline.
- `git add --dry-run apps/strapi/` ne montre aucun secret, base de donnees ou fichier de build.

**Changements de configuration pnpm :**
- `packageManager` aligne sur `pnpm@11.7.0` (version reelle de l'install existant).
- `allowBuilds` ajoute dans `pnpm-workspace.yaml` pour 6 packages precis : `esbuild`, `@swc/core`, `better-sqlite3`, `@nestjs/core`, `core-js-pure`, `sharp`. Chaque entree est justifiee dans le fichier.

**Limites connues :**
- Avertissements non fatals "Config file not loaded, extension must be one of .js,.json): *.js.map" au demarrage Strapi. Cause : Strapi compile le TS en JS avec source maps dans `dist/`, puis scanne `dist/config/` et trouve les `.js.map`. Issue connue Strapi v5 avec TypeScript, sans impact fonctionnel.
- `favicon.png` placeholder minimal (1x1 transparent) dans `apps/strapi/` et `apps/strapi/public/`. A remplacer par le favicon Noe officiel en Phase 5.
- Aucun content-type defini (reserve Phase 2).
- Base SQLite locale dans `apps/strapi/data/strapi.db` (ignoree par Git).

## Phase 2 - Reproduction des structures Airtable necessaires

**Statut :** Termine

Cinq content-types modelises dans `apps/strapi` pour reproduire les structures Airtable necessaires. Aucun comportement frontend/backend modifie. Aucune donnee migree. Aucun endpoint public expose (Phase 3).

- [x] Modeliser dans Strapi les projets. -> `src/api/project/` : collection type avec `draftAndPublish: true`, 22 champs mappes depuis la table Airtable PROJETS (title, description, address, city, postalCode, latitude, longitude, extent, isOngoing, contactEmail, contactPhone, website, sensitizationTitle, trainingTitle, consultationType, followUpType, followUpFrequency) + relations vers Department, Partner, ProjectType, HabitatType + composants repeatable pour reasonedPracticeTypes et renaturationTypes.
- [x] Modeliser dans Strapi les departements. -> `src/api/department/` : collection type avec code (unique), name, region (string). Relation oneToMany vers Project. `draftAndPublish: false` (reference administrative).
- [x] Modeliser dans Strapi les partenaires. -> `src/api/partner/` : collection type avec name, profile. Relation oneToMany vers Project. `draftAndPublish: false` (reference).
- [x] Modeliser les taxonomies utiles en relations lorsque le besoin l'exige. -> `src/api/projecttype/` : 6 valeurs metier (slug, label, color). Relation oneToMany vers Project. `src/api/habitattype/` : types de milieu. Relation manyToMany vers Project. Composants `project.practice-type` et `project.renaturation-type` pour les tableaux repeatables.
- [x] Utiliser Draft/Publish pour la moderation editoriale. -> Project : `draftAndPublish: true`. Les autres content-types (Department, Partner, ProjectType, HabitatType) : `draftAndPublish: false` (references, pas de moderation necessaire).
- [x] Eviter toute logique i18n tant qu'elle n'est pas explicitement decidee. -> Aucun plugin i18n active. Aucun champ locale.

**Verification de phase :**
- `pnpm install --frozen-lockfile` -> OK (lockfile a jour).
- `pnpm --filter @make-map/strapi build` -> OK (compilation TS + build admin panel).
- `pnpm --filter @make-map/strapi dev` -> Strapi demarre sans ouverture automatique du navigateur, health 204, admin 200, 5 routes content-types chargees (projects, departments, partners, projecttypes, habitattypes, 401 par defaut).
- Tests frontend : 31 passes — identique au baseline.
- Tests backend : 46 passes — identique au baseline.
- Types generes : `types/generated/contentTypes.d.ts` contient les 5 content-types avec toutes les relations.

**Decisions de modelisation :**
- Les noms d'API sans tirets (`projecttype`, `habitattype`) pour compatibilite Strapi v5 (la cle du content-type doit egaler son `singularName`).
- `region` stocke comme string dans Department (pas de content-type Region separe) : la region est derivee du code departement (table DEPT_TO_REGION du backend), conformement au comportement Airtable actuel.
- `owner` et `ownerProfile` Airtable remplaces par une relation vers Partner (name + profile).
- `habitatType` Airtable (string ou string[]) remplace par une relation manyToMany vers HabitatType.
- `reasonedPracticeTypes` et `renaturationTypes` Airtable (string[]) modelises comme composants Strapi repeatables.
- `consultationType`, `followUpType`, `followUpFrequency` gardes comme strings simples (pas de vocabulaire controle identifie dans Airtable).

**Limites connues :**
- Les endpoints API Strapi necessitent un token pour l'acces lecture. Voir Phase 3 pour la configuration du token `STRAPI_API_TOKEN`.
- Les schemas Strapi sont en TypeScript (`schema.ts` et composants `.ts`) pour etre compiles dans `dist/` sans watcher ni copie JSON en arriere-plan.
- Aucune donnee migree depuis Airtable (Phase 3/4).
- Les noms d'API `projecttype` et `habitattype` (sans tiret) sont une contrainte technique Strapi v5, pas un choix esthetique.

## Phase 3 - Endpoints et adaptation de forme

**Statut :** En cours

Module `StrapiService` ajoute dans `apps/backend/src/strapi/`. Il prepare l'adaptation de la forme native Strapi v5 (REST aplatie, relations peuplees) vers le contrat `Project[]` attendu par la carte. Aucun comportement frontend modifie : le chemin Airtable reste le defaut via `CMS_SOURCE=airtable`.

- [x] Exposer ou adapter les donnees Strapi pour conserver la forme attendue par la carte. -> `StrapiService.fetchProjects()` appelle l'API REST Strapi avec pagination (`pageSize=100`), `populate=*`, puis transforme via `strapiProjectToDomain()` qui mappe `documentId` → `id`, `department.region` → `region`, `partner.name` → `owner`, `projectType.slug` → `type`, `habitatTypes[].label` → `habitatType[]`, composants `.label` → `[]string`, etc.
- [x] Garder les endpoints publics en lecture seule. -> `GET /api/projects` et `GET /api/projects/:id` inchanges. Le `StrapiService` utilise un token en lecture seule via `STRAPI_API_TOKEN` (env var). Les endpoints Strapi restent proteges par les permissions natives.
- [x] Ne pas reporter `devMode=true` comme bypass public sur les endpoints Strapi, sauf protection explicite documentee. -> `devMode=true` est volontairement ignore par `StrapiService` : le endpoint public ne demande pas `status=draft` et ne sert que les contenus publies. Une vraie preview brouillon demandera une route protegee separee si elle est decidee plus tard.
- [x] Conserver le geocodage et les calculs metier cote serveur. -> `StrapiService` reutilise `GeocodingService` avec le meme pipeline : batch geocoding BAN, ecrasement latitude/longitude/region/department. Meme cache memoire permanent.
- [x] Ajouter une couche d'adaptation si la forme native Strapi ne correspond pas a la forme consommee par la carte. -> `strapi-projects-mapping.util.ts` gere la transformation complete. Meme pattern que `airtable-projects-mapping.util.ts`.
- [ ] Documenter les exemples de reponse attendus pour les endpoints critiques. -> A completer avec un exemple Strapi reel et un exemple `Project[]` adapte apres configuration des permissions Strapi.

**Verification partielle :**
- Tests backend : adapteur Strapi couvert par tests unitaires (`strapi.service.spec.ts`, `strapi-projects-mapping.util.spec.ts`) + tests existants.
- Aucun changement de comportement utilisateur — `CMS_SOURCE=airtable` par defaut, le chemin Airtable reste le chemin actif.
- Verification runtime Strapi reelle encore a faire : demarrer Strapi avec contenu de test approuve, configurer `STRAPI_API_TOKEN`, lancer le backend avec `CMS_SOURCE=strapi`, comparer `/api/projects` avec le contrat Airtable attendu.

**Fichiers crees :**
- `apps/backend/src/strapi/strapi.module.ts` — declaration du module, importe GeocodingModule.
- `apps/backend/src/strapi/strapi.service.ts` — fetch pagine depuis l'API REST Strapi, transformation, geocodage.
- `apps/backend/src/strapi/strapi-projects-mapping.util.ts` — mapping `StrapiProjectItem` (REST shape) → `Project`.
- `apps/backend/src/strapi/strapi.service.spec.ts` — test du fetch Strapi, geocodage serveur et absence de `status=draft` via `devMode`.
- `apps/backend/src/strapi/strapi-projects-mapping.util.spec.ts` — test du mapping Strapi vers `Project` et des replis metier.

**Fichiers modifies :**
- `apps/backend/src/projects/projects.module.ts` — importe `StrapiModule`.
- `apps/backend/src/projects/projects.service.ts` — injecte `StrapiService`, choisit la source via `CMS_SOURCE` (defaut `airtable`).
- `apps/backend/src/projects/projects.service.spec.ts` — ajoute les mocks `ConfigService` et `StrapiService`.
- `apps/backend/.env.example` — ajoute `CMS_SOURCE`, `STRAPI_API_URL`, `STRAPI_API_TOKEN`.

**Prochaine etape manuelle (non scriptee) :**
Avant de basculer vers Strapi en Phase 4, configurer les permissions dans l'admin Strapi :
1. Creer un token API (Settings → API Tokens) avec les droits `find` et `findOne` sur `project`, `department`, `partner`, `projecttype`, `habitattype`.
2. Copier le token dans `apps/backend/.env` : `STRAPI_API_TOKEN=...`.

**Limites connues :**
- Le `StrapiService` suppose que `department`, `partner`, et `projectType` sont toujours peuples (sinon valeurs par defaut). Les projets orphelins (sans relation) auront `region='Île-de-France'`, `owner=''`, `type='renaturation-restauration'`.
- La pagination Strapi est sequentielle (pas de parallelisme). Meme comportement que `AirtableService`.
- Aucun contenu Strapi de test n'a encore ete cree via un chemin approuve ; la validation de donnees reelles reste ouverte.

## Phase 4 - Connexion carte vers Strapi

**Statut :** A faire

- [ ] Basculer la source de donnees de la carte vers Strapi ou vers l'adaptateur Strapi.
- [ ] Valider que la carte reste fonctionnelle.
- [ ] Valider que la liste reste fonctionnelle.
- [ ] Valider que les filtres restent fonctionnels.
- [ ] Valider que les pages de detail restent fonctionnelles.
- [ ] Valider que les territoires et encarts restent fonctionnels.
- [ ] Comparer les resultats avec la source Airtable pendant la transition.
- [ ] Conserver le chemin Airtable fonctionnel jusqu'a validation complete du chemin Strapi.
- [ ] Ne pas refondre le routage ou l'integration carte tant que la migration mecanique n'est pas stable.

## Phase 5 - Vitrine React et references visuelles

**Statut :** A faire

- [ ] Construire les sections statiques du site vitrine en React.
- [ ] Utiliser la charte officielle comme source de verite visuelle.
- [ ] Utiliser les exports de maquette comme support d'implementation, sans importer aveuglement leurs choix techniques.
- [ ] Garder les composants simples et maintenables.
- [ ] Verifier le rendu desktop et mobile des sections ajoutees.

## Phase 6 - Dynamisation par Strapi

**Statut :** A faire

- [ ] Brancher dans Strapi uniquement les contenus qui doivent etre edites : titres, textes, images, liens et contenus editoriaux utiles.
- [ ] Eviter un systeme de page-builder generique.
- [ ] Valider les permissions avant exposition publique.
- [ ] Valider la moderation avant exposition publique.
- [ ] Valider la publication avant exposition publique.
- [ ] Mettre a jour `DECISION.md` si une nouvelle responsabilite structurelle apparait.
