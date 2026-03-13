# Carte Interactive - Trame pollinisateur (Noé)

Application React standalone pour visualiser les initiatives de préservation des pollinisateurs de la [Trame pollinisateur (Noé)](https://noe.org) sur une carte interactive.

## Aperçu

Cette application permet de visualiser et filtrer les projets de renaturation, restauration et sensibilisation aux pollinisateurs sur tout le territoire français.

### Fonctionnalités

- 🗺️ **Carte interactive** avec MapLibre GL JS (WebGL).
- 📍 **Clustering intelligent** avec Supercluster pour gérer de nombreux points.
- 🔍 **Recherche** par ville, porteur de projet, titre.
- 🌳 **Filtres** par type de projet, région, zones Natura 2000.
- 🏛️ **Données Administratives** : Affichage des limites Régions / Départements / EPCI / Communes.
- 📱 **Responsive** : Optimisé pour desktop et mobile.
- 🎨 **Design** respectant la charte graphique Noé.

## Stack technique

- **Framework** : React 18 + Vite
- **Langage** : TypeScript
- **Style** : Tailwind CSS
- **Carte** : MapLibre GL JS + Supercluster
- **Icônes** : Lucide React
- **Routage** : React Router v7

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
pnpm test          # Exécuter les tests unitaires (Vitest)
```

## Structure du Code

- `/src/components` : Composants UI réutilisables (Map, Sidebar, Filters).
- `/src/hooks` : Hooks personnalisés (`useProjects`, `useClusters`, `useMapViewport`).
- `/src/pages` : Pages principales (`HomePage`, `MapPage`, `ProjectListPage`, `ProjectDetailPage`).
- `/src/services` : Client API pour communiquer avec le backend NestJS.
- `/src/types` : Types TypeScript (re-export depuis @make-map/types).

## Performances

L'application est optimisée pour la fluidité :

- **Clustering WebGL** : Les projets sont groupés selon le niveau de zoom pour éviter la surcharge.
- **Calculs asynchrones** : Utilisation de Web Workers via Supercluster pour le clustering.
- **Memoization** : Utilisation intensive de `useMemo` et `useCallback` pour stabiliser les rendus.

## Liens

- Site principal : https://noe.org
- LinkedIn Noé : https://www.linkedin.com/company/noe-biodiversite/

---

**Trame pollinisateur** - Initiative de préservation de la biodiversité
Porté par [Noé](https://noe.org)
