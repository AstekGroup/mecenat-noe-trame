# DECISION.md

Historique court des decisions d'architecture. Les nouvelles decisions doivent etre ajoutees ici avant d'etre appliquees si elles changent la direction technique du projet.

## D001 - Utiliser le depot Trame comme base

**Statut :** Acceptee
**Date :** 2026-07-06

Le depot Trame est la base active pour la carte et le futur site vitrine. Les anciens prototypes externes ne sont pas des bases d'implementation.

**Consequence :** les agents doivent inspecter et modifier ce monorepo, puis verifier que le comportement existant de la carte reste stable.

## D002 - Abandonner Notum et le page-builder Next.js

**Statut :** Acceptee
**Date :** 2026-07-06

Le projet n'a pas besoin d'un systeme de construction de pages par blocs. Ajouter Notum ou une architecture page-builder Next.js augmenterait la complexite et le cout de maintenance.

**Consequence :** ne pas proposer Notum, Contentful, Sanity ou une alternative de page-builder sans nouvelle decision explicite.

## D003 - Standardiser la stack React TypeScript, NestJS et Strapi

**Statut :** Acceptee
**Date :** 2026-07-06

React TypeScript gere l'affichage public, NestJS conserve la logique backend et le geocodage, Strapi devient le CMS headless et l'API editoriale.

**Consequence :** les nouveaux developpements doivent s'inscrire dans cette repartition des responsabilites.

## D004 - Installer Strapi de facon native

**Statut :** Acceptee
**Date :** 2026-07-06

Strapi doit etre integre comme CMS natif du projet, sans importer un starter ou une architecture externe non maitrisee.

**Consequence :** l'installation Strapi future doit rester explicite, minimale et compatible avec le monorepo.

## D005 - Migrer Airtable vers Strapi sans regression carte

**Statut :** Acceptee
**Date :** 2026-07-06

La premiere migration est un remplacement de moteur : la carte doit recevoir une forme de donnees compatible avec la forme Airtable actuelle.

**Consequence :** avant toute refonte UX, reproduire les donnees et endpoints necessaires, puis valider filtres, liste, detail, geocodage et affichage cartographique.

## D006 - Garder l'API publique en lecture seule

**Statut :** Acceptee
**Date :** 2026-07-06

Le frontend public ne doit consommer que des endpoints en lecture. Aucun token avec droit d'ecriture ne doit etre expose cote client.

**Consequence :** les operations d'ecriture passent par Strapi Admin, des formulaires controles ou des routes serveur protegees.

## D007 - Prioriser la charte Noe officielle pour l'identite visuelle

**Statut :** Acceptee
**Date :** 2026-07-06

La charte officielle est la source de verite pour couleurs, typographies et logos. Les exports de maquette aident a implementer les ecrans mais ne remplacent pas la charte.

**Consequence :** en cas d'ecart entre un export visuel et la charte officielle, appliquer la charte ou documenter une exception.

## D008 - Supprimer l'ancienne application standalone map-interactive

**Statut :** Acceptee
**Date :** 2026-07-09

L'application `apps/map-interactive` correspondait au POC standalone initial et a cree de la confusion avec l'application frontend active. La reference fonctionnelle de travail devient l'application `apps/frontend`, qui consomme le backend NestJS.

**Consequence :** ne pas relancer ni reintroduire `apps/map-interactive`. Les validations carte doivent passer par `apps/frontend`, le backend et Strapi.
