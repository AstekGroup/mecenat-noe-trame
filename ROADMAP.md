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

Ce socle decrit ce qui existe deja dans le depot avant la migration Strapi. `DEVPLAN.md` conserve le detail historique du POC au 13 mars 2026.

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

**Statut :** A faire

- [ ] Identifier les flux de donnees actuels entre frontend, NestJS, Airtable et geocodage.
- [ ] Documenter la forme exacte attendue par la carte, les filtres, la liste et les pages de detail.
- [ ] Verifier le role de `apps/map-interactive` comme reference fonctionnelle.
- [ ] Definir les commandes de validation minimales avant migration.
- [ ] Relever les points de routage qui pourraient bloquer une integration directe dans la vitrine.

## Phase 1 - Installation Strapi native

**Statut :** A faire

- [ ] Ajouter Strapi au monorepo de facon minimale et explicite.
- [ ] Configurer les environnements locaux sans secrets suivis par Git.
- [ ] Verifier que Strapi demarre localement sans perturber frontend et backend existants.
- [ ] Documenter les commandes de demarrage et les limites connues.
- [ ] Confirmer que les fichiers generes ou locaux sensibles restent ignores par Git.

## Phase 2 - Reproduction des structures Airtable necessaires

**Statut :** A faire

- [ ] Modeliser dans Strapi les projets.
- [ ] Modeliser dans Strapi les departements.
- [ ] Modeliser dans Strapi les partenaires.
- [ ] Modeliser les taxonomies utiles en relations lorsque le besoin l'exige.
- [ ] Utiliser Draft/Publish pour la moderation editoriale.
- [ ] Eviter toute logique i18n tant qu'elle n'est pas explicitement decidee.

## Phase 3 - Endpoints et adaptation de forme

**Statut :** A faire

- [ ] Exposer ou adapter les donnees Strapi pour conserver la forme attendue par la carte.
- [ ] Garder les endpoints publics en lecture seule.
- [ ] Conserver le geocodage et les calculs metier cote serveur.
- [ ] Ajouter une couche d'adaptation si la forme native Strapi ne correspond pas a la forme consommee par la carte.
- [ ] Documenter les exemples de reponse attendus pour les endpoints critiques.

## Phase 4 - Connexion carte vers Strapi

**Statut :** A faire

- [ ] Basculer la source de donnees de la carte vers Strapi ou vers l'adaptateur Strapi.
- [ ] Valider que la carte reste fonctionnelle.
- [ ] Valider que la liste reste fonctionnelle.
- [ ] Valider que les filtres restent fonctionnels.
- [ ] Valider que les pages de detail restent fonctionnelles.
- [ ] Valider que les territoires et encarts restent fonctionnels.
- [ ] Comparer les resultats avec la source Airtable pendant la transition.
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
