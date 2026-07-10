# ROADMAP.md

Feuille de route active pour la migration Strapi et la consolidation du site Trame pollinisateur.

> **Historique complet :** [`ROADMAP_HISTORY.md`](ROADMAP_HISTORY.md) — lecture non requise a chaque session. Consulter uniquement pour investiguer une phase terminee, une regression, une ancienne verification ou decision, ou lors de l'archivage d'une phase entierement terminee.

## Objectif courant

Achever le remplacement d'Airtable par Strapi sur le chemin actif de la carte sans regression visible, puis rendre la carte integrable dans une page avant de construire le site vitrine React.

## Regles de statuts

Statuts autorises :

- `A faire` : travail identifie, pas encore commence.
- `En cours` : travail commence, non finalise.
- `Bloque` : decision, acces ou validation manquante.
- `Termine` : phase validee avec verification reproductible.

Regles de mise a jour :

- Cocher une tache seulement apres verification ou justification documentee.
- Laisser une tache non cochee en cas de doute.
- Ajouter une note courte plutot que supposer qu'une tache est terminee.
- Mettre le statut d'une phase a `Termine` seulement quand toutes ses taches sont cochees et que la verification de phase est documentee.
- Si une phase impose une nouvelle decision d'architecture, mettre a jour `DECISION.md` avant implementation.
- Tout agent qui execute une tache doit mettre a jour cette feuille avant de terminer son intervention.

## Phases terminees (resume)

| Phase | Statut | Detail |
|-------|--------|--------|
| Socle existant | Historique | [Detail](ROADMAP_HISTORY.md#socle-existant-herite-du-poc-initial) |
| Phase 0 — Audit | Termine | [Detail](ROADMAP_HISTORY.md#phase-0---audit-du-repo-et-de-la-carte-existante) |
| Phase 1 — Installation Strapi | Termine | [Detail](ROADMAP_HISTORY.md#phase-1---installation-strapi-native) |
| Phase 2 — Structures Airtable | Termine | [Detail](ROADMAP_HISTORY.md#phase-2---reproduction-des-structures-airtable-necessaires) |
| Phase 3 — Endpoints et adaptation | Termine | [Detail](ROADMAP_HISTORY.md#phase-3---endpoints-et-adaptation-de-forme) |
| Phase 4 — Strapi source unique | Termine | [Detail](ROADMAP_HISTORY.md#phase-4---strapi-source-unique-pour-la-carte) |

## Phase 4.5 - Carte integrable dans une page

**Statut :** Bloque

Objectif : transformer la carte d'une experience essentiellement plein ecran en composant integrable dans une page de site, sans regression fonctionnelle.

- [x] Identifier les contraintes actuelles de layout plein ecran dans `apps/frontend`. -> La route `/carte` imposait `h-screen w-screen overflow-hidden`; `MapView` savait deja remplir un conteneur parent avec `w-full h-full`.
- [x] Adapter la carte pour qu'elle puisse vivre dans une page avec navigation, contenu editorial autour et footer. -> La carte vit dans un conteneur borne et responsive au sein du flux normal de la page.
- [x] Creer une page de validation simple avec une fausse navigation, un court contenu, la carte integree et un footer. -> Header et Footer existants reutilises; navigation interne Accueil/Carte/Liste et introduction courte ajoutees.
- [x] Conserver les interactions essentielles : zoom, selection, filtres, liste, recherche, detail et corridors. -> Interactions revalidees dans le navigateur avec les projets synthetiques et les corridors.
- [x] Ajouter un mode plein ecran seulement si l'integration reste simple et utile pour l'utilisateur. -> Mode non ajoute : la carte integree conserve assez d'espace et toutes ses interactions; un second mode augmenterait inutilement le perimetre.
- [x] Verifier le rendu desktop et mobile de la page avec carte integree. -> Rendu et navigation valides en desktop et mobile, y compris le panneau mobile.
- [x] Documenter les limites restantes avant la vitrine. -> Le contenu et la navigation restent volontairement courts et statiques; leur enrichissement appartient a la Phase 5.
- [x] Recontroler le formulaire Airtable de reference avant la revue humaine. -> Les 19 champs visibles, leurs types et les listes controlees ont ete compares au modele Strapi.
- [x] Corriger les divergences de saisie Strapi et franciser les libelles du Content Manager. -> Consultation, suivi, pratiques raisonnees, renaturation et profil du porteur sont controles; les libelles editoriaux et l'interface utilisateur sont en francais.
- [x] Documenter et verifier la correspondance complete Airtable vers Strapi. -> Tableau, choix controles, relations et regles d'exposition documentes dans `DATA_MODEL_AIRTABLE_STRAPI.md`; types generes, builds, tests et verification navigateur valides.
- [ ] Revue humaine finale avant Phase 5.

**Verification de phase :**
- Tests frontend : 31 passes, 3 fichiers.
- Build frontend : OK.
- Tests backend apres correction du modele : 43 passes, 7 suites.
- Build backend et build admin Strapi : OK.
- Generation des types Strapi : OK, 0 erreur.
- Verification runtime : libelles francais, listes deroulantes conformes, 9 types de milieu controles et donnees synthetiques normalisees via Strapi.
- Validation desktop et mobile : navigation, contenu, carte integree et footer visibles; cluster, zoom, liste, filtres, corridors, DOM-TOM, selection, popup et detail fonctionnels.

**Blocage restant :** revue humaine finale avant Phase 5. Ne pas demarrer la Phase 5 avant cet accord.

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
