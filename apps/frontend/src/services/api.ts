/**
 * Service API - Appels HTTP vers le backend NestJS.
 * 
 * Le frontend ne connaît plus Airtable ni le géocodage.
 * Tout passe par le backend qui sécurise le token et le cache.
 */

import { Project, ProjectsGeoJSON, GeoJSONProject } from '@/types/project';

// En prod : VITE_API_URL vide = chemins relatifs (/api/events), proxiés par Caddy
// En dev  : VITE_API_URL = http://localhost:3000
const API_BASE = import.meta.env.VITE_API_URL ?? '';

/**
 * Récupère tous les projets depuis le backend.
 */
export async function fetchProjects(devMode = false): Promise<Project[]> {
  const params = devMode ? '?devMode=true' : '';
  const response = await fetch(`${API_BASE}/api/projects${params}`);
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Récupère un projet par son ID depuis le backend.
 */
export async function fetchProjectById(id: string): Promise<Project> {
  const response = await fetch(`${API_BASE}/api/projects/${id}`);
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Récupère les données Natura 2000 (GeoJSON simplifié) depuis le backend.
 */
export async function fetchNatura2000(): Promise<any> {
  const response = await fetch(`${API_BASE}/api/natura2000`);
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Convertit un tableau de projets en GeoJSON FeatureCollection.
 * Exclut les projets sans coordonnées valides.
 */
export function projectsToGeoJSON(projects: Project[]): ProjectsGeoJSON {
  return {
    type: 'FeatureCollection',
    features: projects
      .filter(project => project.latitude !== 0 && project.longitude !== 0)
      .map((project): GeoJSONProject => ({
        type: 'Feature',
        properties: project,
        geometry: {
          type: 'Point',
          coordinates: [project.longitude, project.latitude],
        },
      })),
  };
}
