# ROADMAP.md

Feuille de route active pour la migration Strapi et la consolidation du site Trame pollinisateur.

## Objectif courant

Achever le remplacement d'Airtable par Strapi sur le chemin actif de la carte sans regression visible, puis rendre la carte integrable dans une page avant de construire le site vitrine React.

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

**Statut :** Termine

Module `StrapiService` ajoute dans `apps/backend/src/strapi/`. Il prepare l'adaptation de la forme native Strapi v5 (REST aplatie, relations peuplees) vers le contrat `Project[]` attendu par la carte. Aucun comportement frontend modifie : le chemin Airtable reste le defaut via `CMS_SOURCE=airtable`.

- [x] Exposer ou adapter les donnees Strapi pour conserver la forme attendue par la carte. -> `StrapiService.fetchProjects()` appelle l'API REST Strapi avec pagination (`pageSize=100`), `populate=*`, puis transforme via `strapiProjectToDomain()` qui mappe `documentId` → `id`, `department.region` → `region`, `partner.name` → `owner`, `projectType.slug` → `type`, `habitatTypes[].label` → `habitatType[]`, composants `.label` → `[]string`, etc.
- [x] Garder les endpoints publics en lecture seule. -> `GET /api/projects` et `GET /api/projects/:id` inchanges. Le `StrapiService` utilise un token en lecture seule via `STRAPI_API_TOKEN` (env var). Les endpoints Strapi restent proteges par les permissions natives.
- [x] Ne pas reporter `devMode=true` comme bypass public sur les endpoints Strapi, sauf protection explicite documentee. -> `devMode=true` est volontairement ignore par `StrapiService` : le endpoint public ne demande pas `status=draft` et ne sert que les contenus publies. Une vraie preview brouillon demandera une route protegee separee si elle est decidee plus tard.
- [x] Conserver le geocodage et les calculs metier cote serveur. -> `StrapiService` reutilise `GeocodingService` avec le meme pipeline : batch geocoding BAN, ecrasement latitude/longitude/region/department. Meme cache memoire permanent.
- [x] Ajouter une couche d'adaptation si la forme native Strapi ne correspond pas a la forme consommee par la carte. -> `strapi-projects-mapping.util.ts` gere la transformation complete. Meme pattern que `airtable-projects-mapping.util.ts`.
- [x] Documenter les exemples de reponse attendus pour les endpoints critiques. -> Exemple reel `Project[]` adapte depuis Strapi documente ci-dessous dans la verification runtime Strapi reelle (09/07/2026). Le contrat est conforme a `AUDIT_PHASE0.md` section 10.

**Verification complete :**
- Tests backend : 51 passes (9 suites) — adapteur Strapi couvert (`strapi.service.spec.ts`, `strapi-projects-mapping.util.spec.ts`) + 7 suites existantes.
- Tests frontend : 31 passes (3 fichiers) — identique au baseline.
- Build backend : `nest build` OK.
- **Verification runtime Airtable (09/07/2026) :** `node dist/main.js` → health OK, `/api/projects` → 202 projets Airtable, tous geocodes. `CMS_SOURCE=airtable` par defaut, `StrapiModule` charge sans erreur mais n'est pas appele. Le chemin Airtable est intact.
- **Correction runtime :** le mapper Strapi n'importe que des types depuis `@make-map/types` et garde ses listes de validation locales, pour eviter de charger les sources TypeScript du package partage au runtime Node.

**Resolue — validation Strapi reelle (09/07/2026) :**
Le pipeline complet `Strapi REST → StrapiService → Project[]` a ete valide avec succes contre une instance Strapi locale contenant un projet de test publie.

Sequence executee :
1. Demarrage Strapi (`pnpm --filter @make-map/strapi dev`) → health 204, admin 200.
2. Token API custom cree via l'admin API Strapi (type `custom`, permissions `find`+`findOne` sur `project`, `department`, `partner`, `projecttype`, `habitattype`).
3. Donnees de reference creees via l'admin API : 1 departement (Paris, 75, Ile-de-France), 1 partenaire (Noe), 1 type de projet (renaturation-restauration), 1 type d'habitat (Prairie).
4. 1 projet de test cree et publie via le Content Manager Strapi (API admin) : titre "Jardin test de validation", relations vers departement/partenaire/projectType/habitatTypes, composants repeatable `reasonedPracticeTypes` et `renaturationTypes`.
5. Backend `.env` configure : `CMS_SOURCE=strapi`, `STRAPI_API_URL=http://localhost:1337`, `STRAPI_API_TOKEN=<token custom>`.
6. Backend demarre : `GET /api/health` → 200.
7. `GET /api/projects` → 1 projet, tous les champs conformes au contrat `Project[]` : `id` (documentId), `title`, `description`, `address`, `city`, `postalCode`, `latitude` (geocode), `longitude` (geocode), `region` (normalisee depuis department.region), `department` (depuis department.name), `type` (depuis projectType.slug), `owner` (depuis partner.name), `ownerProfile`, `contactEmail`, `contactPhone`, `website`, `habitatType[]` (depuis habitatTypes[].label), `extent`, `reasonedPracticeTypes[]`, `renaturationTypes[]`, `sensitizationTitle`, `trainingTitle`, `consultationType`, `followUpType`, `followUpFrequency`, `isOngoing`.
8. `GET /api/projects/:id` → reponse identique, filtree par documentId.
9. Geocodage fonctionnel : l'adresse "15 rue des Lilas, 75011 Paris" a ete geocodee avec succes (lat/lng corrige, region/departement resolus).
10. Aucune erreur dans les logs backend.

Le blocage est leve. Les deux taches precedemment bloquees sont confirmees :
- [x] Documenter les exemples de reponse attendus (contrat `Project[]` depuis Strapi).
- [x] Valider le pipeline complet `Strapi REST → StrapiService → Project[]` avec des donnees de test.

**Resolue — module natif better-sqlite3 (09/07/2026) :**
Le blocage de demarrage Strapi cause par un binaire `better-sqlite3` compile pour Node 24 est leve. La commande globale `pnpm rebuild better-sqlite3` n'a pas suffi ; le rebuild filtre `pnpm --filter @make-map/strapi rebuild better-sqlite3` a bien relance le script natif (`prebuild-install || node-gyp rebuild --release`) et Strapi demarre ensuite sous Node `v26.4.0`.

**Note technique — config Strapi CLI :**
Les commandes Strapi CLI (`admin:reset-user-password`, `console`) echouent avec `Cannot destructure property 'client' of 'db.config.connection' as it is undefined` quand `dist/config/` ne contient pas les fichiers JS compiles (le `tsconfig.json` a `noEmit: true`). Solution ponctuelle : ecrire manuellement `dist/config/database.js` et `dist/config/server.js` avant de lancer les commandes CLI. Ce contournement n'est pas necessaire pour `strapi develop` ni `strapi build`.

**Verification de phase (09/07/2026) :**
- Pipeline runtime valide : `Strapi REST → StrapiService → Project[]` fonctionnel avec donnees de test reelles.
- Backend `/api/projects` retourne un `Project[]` conforme au contrat partage `@make-map/types`.
- Geocodage BAN fonctionnel via le meme pipeline que Airtable.
- Cache TTL 5 min operationnel.
- `devMode=true` ignore cote Strapi (seuls les projets publies sont exposes).
- Token API Strapi custom avec permissions `find`+`findOne` explicites sur les 5 content-types.
- Tests backend : 51 passes (9 suites) — Strapi, Airtable, mapping, geocodage, projects, natura2000.
- Tests frontend : 31 passes (3 fichiers) — identique au baseline (aucun changement Phase 3 cote frontend).
- `CMS_SOURCE=airtable` toujours fonctionnel (defaut).

**Revalidation runtime (09/07/2026) :**
- Preflight depot confirme : racine Git attendue, branche `feat/phase-3-strapi-adapter`, remote `sandbox` en ecriture et `upstream` en lecture.
- Strapi local demarre avec `pnpm --filter @make-map/strapi dev` : `GET /_health` -> 204, `GET /admin` -> 200, `GET /admin/init` -> `hasAdmin: true`.
- Token API utilise : `Backend Custom RO`, type `custom`, limite a `find` et `findOne` sur `project`, `department`, `partner`, `projecttype`, `habitattype`.
- Contenu Strapi local : exactement 1 projet publie, `Jardin test de validation`, avec relations department/partner/projectType/habitatTypes et composants repeatable.
- Backend local configure via `apps/backend/.env` ignore : `CMS_SOURCE=strapi`, `STRAPI_API_URL=http://localhost:1337`, `STRAPI_API_TOKEN=<token custom>`.
- Backend construit avec `pnpm --filter @make-map/backend build`, puis demarre sur le port 3001 car un autre backend local occupait deja 3000.
- `GET /api/projects` -> 200, tableau de 1 `Project` conforme au contrat partage ; `GET /api/projects/:id` -> 200 sur le meme `documentId`.
- Tests backend cibles : `pnpm --filter @make-map/backend test -- strapi projects.service` -> 12 tests passes, 3 suites.

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

**Limites connues :**
- Le `StrapiService` suppose que `department`, `partner`, et `projectType` sont toujours peuples (sinon valeurs par defaut). Les projets orphelins (sans relation) auront `region='Île-de-France'`, `owner=''`, `type='renaturation-restauration'`.
- La pagination Strapi est sequentielle (pas de parallelisme). Meme comportement que `AirtableService`.
- Le token API Strapi en `.env` backend est un token custom avec permissions explicites `find`+`findOne`. Un token `read-only` natif Strapi ne permet pas de specifier les permissions manuellement (Strapi les gere automatiquement).
- Le switch `CMS_SOURCE` et le chemin Airtable sont des restes transitoires de validation. D009 demande leur retrait du chemin runtime actif en Phase 4.

## Phase 4 - Strapi source unique pour la carte

**Statut :** A faire

Objectif : retirer Airtable du chemin runtime actif des projets et faire de Strapi la source unique servie par le backend a la carte.

- [ ] Auditer tous les chemins Airtable encore actifs dans le backend, le frontend, les fichiers d'environnement, les tests et la documentation.
- [ ] Retirer Airtable du chemin runtime actif de `GET /api/projects` et `GET /api/projects/:id`.
- [ ] Faire de Strapi la source par defaut et unique pour les projets.
- [ ] Supprimer ou neutraliser le mode `CMS_SOURCE=airtable` afin d'eviter un switch durable Airtable/Strapi.
- [ ] Conserver le backend comme passage obligatoire entre le frontend et Strapi : pas de token Strapi expose cote frontend.
- [ ] Garder le geocodage et les transformations metier cote backend.
- [ ] Creer environ 10 projets de test locaux dans Strapi via Strapi Admin ou API admin approuvee, jamais par SQL direct et sans importer de donnees reelles Airtable.
- [ ] Lancer la stack locale complete : Strapi, backend et frontend.
- [ ] Valider humainement la carte avec les donnees Strapi : points visibles, zoom, clustering et selection.
- [ ] Valider humainement la liste, les filtres, la recherche et les pages de detail.
- [ ] Valider humainement les territoires, les encarts DOM-TOM et les comportements de navigation.
- [ ] Reverse-engineer les corridors/trames : identifier leur source, leur chargement et leur dependance eventuelle aux donnees projet.
- [ ] Valider que les corridors/trames restent visibles et fonctionnels apres retrait Airtable.
- [ ] Nettoyer les references Airtable obsoletes dans README, `.env.example`, scripts et docs non historiques lorsque le runtime Strapi est valide.
- [ ] Mettre a jour les tests backend/frontend pour refleter Strapi comme source active unique.
- [ ] Documenter la verification de phase avec commandes, URLs locales, donnees de test et resultat des tests humains.
- [ ] Faire un stop humain avec validation Navid + Clement avant de demarrer Phase 4.5 ou Phase 5.

**Verification de phase attendue :**
- `pnpm install --frozen-lockfile`
- Tests backend et frontend cibles ou complets selon le diff.
- Build backend et frontend.
- Validation locale sur navigateur de `apps/frontend` avec Strapi + backend + frontend lances ensemble.
- Note de validation humaine : carte, liste, filtres, recherche, details, territoires et corridors.

## Phase 4.5 - Carte integrable dans une page

**Statut :** A faire

Objectif : transformer la carte d'une experience essentiellement plein ecran en composant integrable dans une page de site, sans regression fonctionnelle.

- [ ] Identifier les contraintes actuelles de layout plein ecran dans `apps/frontend`.
- [ ] Adapter la carte pour qu'elle puisse vivre dans une page avec navigation, contenu editorial autour et footer.
- [ ] Creer une page de validation simple avec une fausse navigation, un court contenu, la carte integree et un footer.
- [ ] Conserver les interactions essentielles : zoom, selection, filtres, liste, recherche, detail et corridors.
- [ ] Ajouter un mode plein ecran seulement si l'integration reste simple et utile pour l'utilisateur.
- [ ] Verifier le rendu desktop et mobile de la page avec carte integree.
- [ ] Documenter les limites restantes avant la vitrine.
- [ ] Faire un stop humain avec validation Navid + Clement avant Phase 5.

## Phase 5 - Vitrine React et references visuelles

**Statut :** A faire

Ne pas demarrer avant validation humaine de Phase 4 et Phase 4.5.

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
