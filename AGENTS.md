# AGENTS.md

Ce fichier est le point d'entree canonique pour tout agent IA travaillant dans ce depot.

## Ordre de lecture obligatoire

Avant toute modification, lire dans cet ordre :

1. [`CONSTITUTION.md`](CONSTITUTION.md)
2. [`DECISION.md`](DECISION.md)
3. [`ROADMAP.md`](ROADMAP.md)
4. [`README.md`](README.md)
5. Le code concerne par la tache

Si la demande contredit une decision acceptee, arreter et demander une validation humaine avant de coder.

## Contexte projet

Le depot porte la carte Trame pollinisateur et devient aussi le socle du site vitrine. La priorite actuelle est de conserver le comportement existant de la carte tout en remplacant progressivement la source Airtable par Strapi.

Stack cible :

- React TypeScript pour l'affichage du site vitrine et de la carte.
- NestJS pour la couche backend et les calculs metier, notamment le geocodage.
- Strapi pour le CMS, les workflows editoriaux et l'API headless.

## Regles non negociables

- Ne pas reintroduire Notum ni une architecture page-builder Next.js.
- Ne pas inventer de logique i18n ou de traduction.
- Ne pas commiter de donnees metier, exports de bases, secrets, tokens ou cles API.
- Ne jamais exposer dans le frontend un token ayant des droits d'ecriture.
- Les endpoints publics consommes par le frontend doivent rester en lecture seule.
- La moderation editoriale doit s'appuyer sur Draft/Publish Strapi, sauf decision explicite contraire.
- Le comportement actuel de la carte est la reference fonctionnelle tant que la migration Airtable vers Strapi n'est pas validee.

## Methode de travail

- Verifier `git status --short --branch` et `git remote -v` avant toute modification.
- Garder les changements petits, atomiques et faciles a relire.
- Rediger les documents, PR et commentaires techniques en francais.
- Preferer les patterns deja presents dans le monorepo.
- Ne pas reintroduire `apps/map-interactive` : l'ancien POC standalone a ete supprime pour eviter la confusion avec `apps/frontend`.
- Apres toute modification de schema Strapi future, inclure la regeneration des types dans le meme changement si le depot contient des types generes.

## Continuite entre agents

Chaque agent doit laisser le depot comprehensible pour le prochain agent ou la prochaine session.

Avant de commencer :

- Identifier la phase et les taches `ROADMAP.md` concernees.
- Si la tache n'existe pas dans `ROADMAP.md`, ajouter une entree courte avant ou pendant le travail.
- Ne pas ouvrir une nouvelle direction technique sans decision acceptee dans `DECISION.md`.

Avant de terminer :

- Mettre a jour `ROADMAP.md` si une tache est terminee, commencee, bloquee ou decomposee.
- Cocher une tache uniquement si la verification associee est passee ou si la justification est documentee.
- Passer le statut d'une phase a `En cours`, `Bloque` ou `Termine` lorsque l'etat reel change.
- Ajouter une note courte dans `ROADMAP.md` lorsqu'une tache reste incomplete, partielle ou dependante d'un acces externe.
- Mettre a jour `DECISION.md` seulement pour une decision d'architecture durable.
- Mettre a jour `CONSTITUTION.md` seulement si une regle non negociable change avec validation humaine.
- Mettre a jour `AGENTS.md` seulement si la methode de travail des agents change.

## Verification minimale

Choisir la verification la plus petite qui prouve le changement :

- Documentation seule : verifier les liens Markdown, l'absence de secrets et l'absence de contexte prive.
- Backend : lancer les tests ou checks cibles du package concerne.
- Frontend : lancer lint/build cible et verifier l'interface en navigateur si le rendu change.
- Migration de donnees : valider avec des donnees de test via chemins applicatifs approuves, jamais par insertion SQL manuelle.

## Confidentialite documentaire

Les fichiers suivis par Git doivent rester impersonnels et productisables. Les chemins locaux, notes de reunion, preferences d'outils, identifiants externes et contexte prive doivent rester dans des fichiers ignores par Git.
