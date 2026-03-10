# Carte Interactive - Trame pollinisateur (Noé)

Application React standalone pour afficher les initiatives de préservation des pollinisateurs de la Trame pollinisateur (Noé) sur une carte interactive de France.

## Aperçu

Cette application permet de visualiser et filtrer les projets de renaturation, restauration et sensibilisation aux pollinisateurs sur tout le territoire français.

### Fonctionnalités

- 🗺️ **Carte interactive** avec MapLibre GL JS (WebGL)
- 📍 **Clustering intelligent** avec Supercluster
- 🔍 **Recherche** par ville, porteur de projet, région
- 📅 **Filtres** par type de projet, région, Natura 2000
- 📱 **Responsive** (desktop + mobile)
- 🎨 **Design** respectant la charte graphique noe.org

## Stack technique

- **Framework** : React + Vite
- **Langage** : TypeScript
- **Style** : Tailwind CSS
- **Carte** : MapLibre GL JS + Supercluster
- **Icons** : Lucide React
- **Routage** : React Router v6

## Installation et Développement

L'application est incluse dans un monorepo TurboRepo.

### Commandes (depuis la racine)

```bash
pnpm install       # Installer les dépendances
pnpm dev           # Lancer frontend + backend
pnpm front:dev     # Lancer uniquement le frontend
```

### Commandes (depuis apps/frontend)

```bash
pnpm dev           # Lancer en local (localhost:5173)
pnpm build         # Build pour la production
pnpm lint          # Linter le code
```

## Structure du Code

- `/src/components` : Composants UI réutilisables (Map, Sidebar, Filters)
- `/src/hooks` : Hooks personnalisés (useProjects, useClusters, useMapViewport)
- `/src/pages` : Pages principales (HomePage, MapPage, ProjectDetail)
- `/src/services` : Client API pour communiquer avec le backend NestJS
- `/src/types` : Types TypeScript partagés (re-export depuis @make-map/types)

## Performances

L'application est optimisée pour gérer un grand nombre de points :

- **Clustering WebGL** : Les projets sont groupés automatiquement selon le niveau de zoom
- **Virtualisation** : Seuls les éléments visibles sont rendus
- **Memoization** : Cache des calculs de clusters

## Liens

- Site principal : https://noe.org
- Documentation API : À compléter
- LinkedIn Noé : https://www.linkedin.com/company/ong-no%C3%A9/

---

**Trame pollinisateur** - Initiative de préservation de la biodiversité
Porté par [Noé](https://noe.org)
