# CONSTITUTION.md

Ce document fixe les regles durables du projet. Il prime sur les notes historiques et les hypotheses non validees.

## Direction technique

- Le depot Trame est la base de travail pour la carte et le site vitrine.
- Le projet utilise React TypeScript, NestJS et Strapi.
- React TypeScript gere l'affichage public : vitrine, carte, listes et pages de detail.
- NestJS gere la couche backend existante et les calculs metier, notamment le geocodage.
- Strapi gere le CMS, le workflow editorial et l'API headless.

## Architecture exclue

- Ne pas reintroduire Notum.
- Ne pas construire une architecture page-builder Next.js.
- Ne pas ajouter un framework majeur sans decision documentee dans `DECISION.md`.

## Donnees et securite

- Les donnees metier vivent dans la base applicative, pas dans Git.
- Les secrets, tokens, exports de base et fichiers d'environnement restent hors Git.
- Le frontend ne doit jamais contenir de token avec droits d'ecriture.
- Les endpoints publics consommes par le frontend sont en lecture seule.
- La configuration Strapi native de roles et permissions est privilegiee avant tout controleur specifique.

## Migration Airtable vers Strapi

- La premiere migration doit etre mecanique : changer la source de donnees sans changer le comportement utilisateur.
- Strapi doit fournir une sortie compatible avec ce que la carte consomme deja, ou une couche d'adaptation doit conserver cette forme.
- Les structures prioritaires a reproduire sont les projets, les departements et les partenaires.
- Les taxonomies metier doivent etre modelisees en relations Strapi lorsque cela correspond au besoin fonctionnel.

## Workflow editorial

- La moderation des contributions publiques utilise Draft/Publish Strapi par defaut.
- Les contenus non publies ne doivent pas apparaitre sur les endpoints publics.
- Les medias publics doivent etre geres par Strapi lorsque le droit d'utilisation est confirme.

## Interface et marque

- La charte Noe officielle est la source prioritaire pour couleurs, typographies et logos.
- Les exports de maquette ou de generation React servent de reference d'interface, pas de source de verite de marque.
- Le site vitrine doit rester simple : pages React structurees, puis champs dynamises par Strapi quand c'est utile.

## Documentation

- Les documents suivis par Git sont rediges en francais, impersonnels et productisables.
- Les notes privees, chemins locaux, modeles IA, identifiants d'outils et details de reunion ne doivent pas apparaitre dans les fichiers suivis.
