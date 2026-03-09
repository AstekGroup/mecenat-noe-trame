/**
 * Service API - Appels HTTP vers le backend NestJS.
 * 
 * Le frontend ne connaît plus Airtable ni le géocodage.
 * Tout passe par le backend qui sécurise le token et le cache.
 */

import { Event, EventsGeoJSON, GeoJSONEvent } from '@/types/event';

// En prod : VITE_API_URL vide = chemins relatifs (/api/events), proxiés par Caddy
// En dev  : VITE_API_URL = http://localhost:3000
const API_BASE = import.meta.env.VITE_API_URL ?? '';

/**
 * Récupère tous les projets depuis le backend.
 */
export async function fetchEvents(devMode = false): Promise<Event[]> {
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
export async function fetchEventById(id: string): Promise<Event> {
  const response = await fetch(`${API_BASE}/api/projects/${id}`);
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Convertit un tableau de projets en GeoJSON FeatureCollection.
 * Exclut les projets sans coordonnées valides.
 */
export function eventsToGeoJSON(events: Event[]): EventsGeoJSON {
  return {
    type: 'FeatureCollection',
    features: events
      .filter(event => event.latitude !== 0 && event.longitude !== 0)
      .map((event): GeoJSONEvent => ({
        type: 'Feature',
        properties: event,
        geometry: {
          type: 'Point',
          coordinates: [event.longitude, event.latitude],
        },
      })),
  };
}
