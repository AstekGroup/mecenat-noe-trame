# DEVPLAN - MVP Carte Interactive (Renaturons)

## Objectif
Ce projet est une adaptation de la base technologique de la "Semaine de l'IA pour Tous" pour le projet **"Renaturons - Trame pollinisateur"** de Noe.org. L'objectif est d'afficher et de gérer des projets de renaturation sur une carte interactive performante.

## Étapes de développement

### Phase 1 : Fondations Techniques (Héritage)
*Socle architectural et services transverses.*
- [x] 1.1 **Architecture Monorepo** : Mise en place de TurboRepo et pnpm workspaces.
- [x] 1.2 **Shared Types** : Package `@make-map/types` pour la cohérence frontend/backend.
- [x] 1.3 **Backend NestJS** : Proxy Airtable sécurisé (token serveur) et cache TTL (5 min).
- [x] 1.4 **Géocodage** : Service de géocodage serveur avec cache permanent en mémoire.

### Phase 2 : Cartographie et Navigation
*Interface utilisateur et visualisation de données.*
- [x] 2.1 **Moteur de Carte** : Intégration MapLibre GL et clustering haute performance (Supercluster).
- [x] 2.2 **Territoires** : Gestion spécifique des DOM/TOM via des encarts interactifs.
- [x] 2.3 **Interactions** : Sidebar filtrable, popups détail et synchronisation carte/liste.
- [x] 2.4 **Routage** : Navigation via React Router avec pages Accueil, Liste et Détail.

### Phase 3 : Adaptation Métier "Renaturons" (Mars 2026)
*Pivot du modèle de données et personnalisation Noe.org.*
- [x] 3.1 **Migration du Modèle** : Passage de la nomenclature "Événement" vers "Projet".
- [x] 3.2 **Types Métier** : Implémentation des nouveaux `ProjectType` (Renaturation, Restauration, etc.).
- [x] 3.3 **API Projets** : Déploiement du module `projects` et des endpoints `/api/projects`.
- [x] 3.4 **Refonte Frontend** : Adaptation des hooks (`useProjects`) et des composants UI au nouveau modèle.
- [x] 3.5 **Qualité** : Correction complète de la stack TypeScript et validation des builds.
- [x] 3.6 **Natura 2000** : Intégration des réserves (GeoJSON) avec filtre toggle sur la carte.
- [x] 3.7 **Limites Administratives** : Ajout de 4 calques (Régions, Départements, EPCI, Communes) via les Vector Tiles de l'IGN.
- [x] 3.8 **Branding et Identité visuelle** : Mise à jour du titre "Trame pollinisateur", du favicon et intégration de la charte graphique Noe.org.

### Phase 4 : Déploiement et Infrastructure
*Mise en production et automatisation.*
- [x] 4.1 **Dockerisation** : Multi-stage builds pour le backend (NestJS) et le frontend (Nginx).
- [x] 4.2 **Orchestration** : Docker Compose avec Caddy pour le reverse proxy et HTTPS automatique.
- [x] 4.3 **CI/CD** : Script de déploiement automatisé via rsync et docker compose.
- [ ] 4.4 **Production** : Mise en ligne finale sur l'infrastructure Scaleway.

## État du Projet
- **Statut** : Adaptation terminée, zones Natura 2000 intégrées ✅
- **Base technique** : Adaptée de "Semaine de l'IA"
- **Dernière mise à jour** : 10 mars 2026
