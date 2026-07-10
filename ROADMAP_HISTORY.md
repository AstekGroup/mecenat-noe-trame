# ROADMAP_HISTORY.md

Archive historique du projet Trame pollinisateur. Ce fichier conserve le detail complet des phases terminees.

> **Retour vers la feuille de route active :** [`ROADMAP.md`](ROADMAP.md)

## Regle d'archive

Ce fichier est en **lecture seule** sauf lorsqu'une phase entiere vient d'etre terminee et validee. Dans ce cas, le detail complet de la phase est deplace depuis `ROADMAP.md` vers ce fichier, et `ROADMAP.md` ne conserve qu'un resume avec lien.

Ne pas modifier ce fichier pour :
- Une session partielle ou une tache en cours.
- Une correction mineure sur une phase deja archivee (ajouter une note dans `ROADMAP.md` a la place).
- Un ajustement de formatage sans changement de contenu.

---

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

---

## Phase 0 - Audit du repo et de la carte existante

**Statut :** Termine

Audit en lecture seule realise sans modifier le comportement applicatif et sans toucher `apps/map-interactive`. Detail dans [`AUDIT_PHASE0.md`](AUDIT_PHASE0.md).

- [x] Identifier les flux de donnees actuels entre frontend, NestJS, Airtable et geocodage. -> AUDIT_PHASE0.md sections 3-5.
- [x] Documenter la forme exacte attendue par la carte, les filtres, la liste et les pages de detail. -> AUDIT_PHASE0.md section 6.
- [x] Capturer des contrats de reponse ou exemples sanitises des endpoints actuels pour servir de base de comparaison en Phase 4. -> AUDIT_PHASE0.md sections 4, 6, 7 et exemple sanitize section 10.
- [x] Verifier le role historique de `apps/map-interactive`. -> AUDIT_PHASE0.md section 2. Cette ancienne reference standalone a ensuite ete supprimee par D008 pour eviter la confusion avec `apps/frontend`.
- [x] Definir les commandes de validation minimales avant migration. -> AUDIT_PHASE0.md section 9.
- [x] Relever les points de routage qui pourraient bloquer une integration directe dans la vitrine. -> AUDIT_PHASE0.md section 8 (History API sans `basename`, filtres ephemeres, layout plein ecran, detail dependant de la liste).

**Verification de phase :** audit documentaire en lecture seule. Aucun code modifie et aucune validation runtime lancee pour cette phase. La verification repose sur l'exactitude de `AUDIT_PHASE0.md` et la coherence avec le code inspecte. Commandes de validation de la carte existante listees en section 9 (a lancer avant toute modification applicative puis en Phase 4 pour la comparaison avant/apres).

**Sujets ouverts a trancher en Phase 1+ :**
- `devMode` actuellement sans effet reel (`buildProjectsFilterFormula` retourne `null`) ; moderation a modeliser via Draft/Publish Strapi.
- `fetchProjectById` debranche (la page de detail lit dans `allProjects`).
- Calque `reserves-biologiques` absent des donnees locales (retourne une collection vide).
- `.env.example` backend a aligner avec `AIRTABLE_PROJECTS_TABLE_ID`.
- Decision iframe vs integration React directe a documenter dans `DECISION.md` avant Phase 5.

---

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

---

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

---

## Phase 3 - Endpoints et adaptation de forme

**Statut :** Termine

Module `StrapiService` ajoute dans `apps/backend/src/strapi/`. Il prepare l'adaptation de la forme native Strapi v5 (REST aplatie, relations peuplees) vers le contrat `Project[]` attendu par la carte. Aucun comportement frontend modifie : le chemin Airtable reste le defaut via `CMS_SOURCE=airtable`.

- [x] Exposer ou adapter les donnees Strapi pour conserver la forme attendue par la carte. -> `StrapiService.fetchProjects()` appelle l'API REST Strapi avec pagination (`pageSize=100`), `populate=*`, puis transforme via `strapiProjectToDomain()` qui mappe `documentId` vers `id`, `department.region` vers `region`, `partner.name` vers `owner`, `projectType.slug` vers `type`, `habitatTypes[].label` vers `habitatType[]`, composants `.label` vers `[]string`, etc.
- [x] Garder les endpoints publics en lecture seule. -> `GET /api/projects` et `GET /api/projects/:id` inchanges. Le `StrapiService` utilise un token en lecture seule via `STRAPI_API_TOKEN` (env var). Les endpoints Strapi restent proteges par les permissions natives.
- [x] Ne pas reporter `devMode=true` comme bypass public sur les endpoints Strapi, sauf protection explicite documentee. -> `devMode=true` est volontairement ignore par `StrapiService` : le endpoint public ne demande pas `status=draft` et ne sert que les contenus publies. Une vraie preview brouillon demandera une route protegee separee si elle est decidee plus tard.
- [x] Conserver le geocodage et les calculs metier cote serveur. -> `StrapiService` reutilise `GeocodingService` avec le meme pipeline : batch geocoding BAN, ecrasement latitude/longitude/region/department. Meme cache memoire permanent.
- [x] Ajouter une couche d'adaptation si la forme native Strapi ne correspond pas a la forme consommee par la carte. -> `strapi-projects-mapping.util.ts` gere la transformation complete. Meme pattern que `airtable-projects-mapping.util.ts`.
- [x] Documenter les exemples de reponse attendus pour les endpoints critiques. -> Contrat `Project[]` adapte depuis Strapi valide avec des donnees de test. Le contrat est conforme a `AUDIT_PHASE0.md` section 10.

**Verification de phase :**
- Tests backend : 51 passes (9 suites) — adapteur Strapi couvert (`strapi.service.spec.ts`, `strapi-projects-mapping.util.spec.ts`) + 7 suites existantes.
- Tests frontend : 31 passes (3 fichiers) — identique au baseline.
- Build backend : `nest build` OK.
- Pipeline runtime valide : `Strapi REST` vers `StrapiService` vers `Project[]` fonctionnel avec donnees de test.
- Backend `/api/projects` retourne un `Project[]` conforme au contrat partage `@make-map/types`.
- Geocodage BAN fonctionnel via le meme pipeline que Airtable.
- Cache TTL 5 min operationnel.
- `devMode=true` ignore cote Strapi (seuls les projets publies sont exposes).
- `CMS_SOURCE=airtable` toujours fonctionnel (defaut).

**Correction runtime :** le mapper Strapi n'importe que des types depuis `@make-map/types` et garde ses listes de validation locales, pour eviter de charger les sources TypeScript du package partage au runtime Node.

**Fichiers crees :**
- `apps/backend/src/strapi/strapi.module.ts` — declaration du module, importe GeocodingModule.
- `apps/backend/src/strapi/strapi.service.ts` — fetch pagine depuis l'API REST Strapi, transformation, geocodage.
- `apps/backend/src/strapi/strapi-projects-mapping.util.ts` — mapping `StrapiProjectItem` (REST shape) vers `Project`.
- `apps/backend/src/strapi/strapi.service.spec.ts` — test du fetch Strapi, geocodage serveur et absence de `status=draft` via `devMode`.
- `apps/backend/src/strapi/strapi-projects-mapping.util.spec.ts` — test du mapping Strapi vers `Project` et des replis metier.

**Fichiers modifies :**
- `apps/backend/src/projects/projects.module.ts` — importe `StrapiModule`.
- `apps/backend/src/projects/projects.service.ts` — injecte `StrapiService`, choisit la source via `CMS_SOURCE` (defaut `airtable`).
- `apps/backend/src/projects/projects.service.spec.ts` — ajoute les mocks `ConfigService` et `StrapiService`.
- `apps/backend/.env.example` — ajoute `CMS_SOURCE`, `STRAPI_API_URL`, `STRAPI_API_TOKEN`.

**Limites connues :**
- Le `StrapiService` suppose que `department`, `partner`, et `projectType` sont toujours peuples (sinon valeurs par defaut). Les projets orphelins (sans relation) auront `region='Ile-de-France'`, `owner=''`, `type='renaturation-restauration'`.
- La pagination Strapi est sequentielle (pas de parallelisme). Meme comportement que `AirtableService`.
- Le token API Strapi en `.env` backend est un token custom avec permissions explicites `find`+`findOne`. Un token `read-only` natif Strapi ne permet pas de specifier les permissions manuellement (Strapi les gere automatiquement).
- Le switch `CMS_SOURCE` et le chemin Airtable sont des restes transitoires de validation. D009 demande leur retrait du chemin runtime actif en Phase 4.

---

## Phase 4 - Strapi source unique pour la carte

**Statut :** Termine

Objectif : retirer Airtable du chemin runtime actif des projets et faire de Strapi la source unique servie par le backend a la carte.

- [x] Auditer tous les chemins Airtable encore actifs dans le backend, le frontend, les fichiers d'environnement, les tests et la documentation. -> Switch runtime identifie dans `ProjectsService`, import dans `ProjectsModule`, anciens secrets dans les exemples/deploiement et documentation active. Aucun appel direct Airtable dans le frontend.
- [x] Retirer Airtable du chemin runtime actif de `GET /api/projects` et `GET /api/projects/:id`. -> `ProjectsService` depend uniquement de `StrapiService`; l'ancien module backend Airtable a ete supprime.
- [x] Faire de Strapi la source par defaut et unique pour les projets. -> Aucun fallback ni seconde source dans le module projets.
- [x] Supprimer ou neutraliser le mode `CMS_SOURCE=airtable` afin d'eviter un switch durable Airtable/Strapi. -> `CMS_SOURCE` retire du code et de `.env.example`.
- [x] Conserver le backend comme passage obligatoire entre le frontend et Strapi : pas de token Strapi expose cote frontend. -> Le frontend appelle `/api/projects`; seul le backend lit `STRAPI_API_TOKEN`.
- [x] Garder le geocodage et les transformations metier cote backend. -> Pipeline `StrapiService` et `GeocodingService` conserve sans changement fonctionnel.
- [x] Creer environ 10 projets de test locaux dans Strapi via l'API admin approuvee, jamais par SQL direct et sans importer de donnees reelles Airtable. -> 10 projets synthetiques publies crees via l'API admin Strapi. Base locale ignoree par Git.
- [x] Lancer la stack locale complete : Strapi, backend et frontend. -> Stack locale complete lancee avec les trois services.
- [x] Valider humainement la carte avec les donnees Strapi : points visibles, zoom, clustering et selection. -> Marqueurs visibles, cluster parisien, clic cluster avec changement d'echelle, selection carte/liste avec zoom et popup fonctionnels.
- [x] Valider humainement la liste, les filtres, la recherche et les pages de detail. -> Recherche texte, filtre type, filtre code postal, liste, popup et navigation vers `/projet/:documentId` verifies.
- [x] Valider humainement les territoires, les encarts DOM-TOM et les comportements de navigation. -> Guadeloupe, Guyane, La Reunion et Mayotte affichent chacun un projet dans les encarts desktop; navigation accueil/carte/liste/detail verifiee. Le bouton mobile de fermeture du panneau a ete remis au premier plan et revalide.
- [x] Reverse-engineer les corridors/trames : identifier leur source, leur chargement et leur dependance eventuelle aux donnees projet. -> GeoJSON local servi independamment par `GET /api/corridors`, charge a la demande par `useProjects` puis affiche dans la couche MapLibre `corridors-line`.
- [x] Valider que les corridors/trames restent visibles et fonctionnels apres retrait Airtable. -> `/api/corridors` retourne 8 `MultiLineString`; les lignes sont visibles et le calque peut etre desactive/reactive dans les filtres.
- [x] Nettoyer les references Airtable obsoletes dans README, `.env.example`, scripts et docs non historiques lorsque le runtime Strapi est valide. -> Configuration backend/deploiement et README actifs alignes sur Strapi; les references de migration restent dans les documents historiques et de decision.
- [x] Mettre a jour les tests backend/frontend pour refleter Strapi comme source active unique. -> Tests `ProjectsService` recadres sur Strapi; le frontend conserve son contrat backend inchange.
- [x] Documenter la verification de phase avec commandes, donnees de test et resultat des tests humains.
- [x] Faire un stop humain avant de demarrer Phase 4.5 ou Phase 5. -> Phase 4.5 autorisee. La revue humaine finale reste obligatoire avant Phase 5.

**Verification de phase :**
- `pnpm install --frozen-lockfile` -> OK.
- Tests backend : 41 passes, 7 suites. Les anciennes suites Airtable ont ete supprimees avec le code runtime obsolete; les tests de fallback region DOM et d'absence de token Strapi ont ete ajoutes.
- Tests frontend : 31 passes, 3 fichiers.
- Build backend : OK. Build frontend : OK, avec les avertissements historiques de taille de chunk et d'import mixte de `api.ts`.
- API locale : `/api/health` 200, `/api/projects` 200 avec 10 projets geocodes et 6 types, `/api/projects/:id` 200, `/api/corridors` 200 avec 8 features.
- Validation desktop et mobile : carte, cluster, zoom, selection, popup, recherche, filtres, liste, detail, encarts DOM-TOM, navigation et corridors valides.
- Les erreurs console observees pendant les zooms correspondent a des requetes de tuiles OpenFreeMap annulees ou fermees; les requetes applicatives `/api/projects` et `/api/corridors` restent en 200.

**Cloture :** Phase 4.5 autorisee. La revue humaine finale est regroupee apres la Phase 4.5 et reste obligatoire avant Phase 5.
