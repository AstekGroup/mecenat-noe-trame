import type { Region, ClusterFeature } from './event';
import { REGIONS } from './event';

export type ProjectType =
  | 'pratiques-raisonnees'
  | 'renaturation-restauration'
  | 'sensibilisation'
  | 'formation'
  | 'consultation'
  | 'suivis';

export interface Project {
  id: string;
  title: string;
  description: string;
  /**
   * Localisation principale du projet (point central ou site principal).
   */
  address: string;
  city: string;
  region: Region;
  department: string;
  postalCode: string;
  latitude: number;
  longitude: number;

  /**
   * Type principal de projet (typologie métier).
   */
  type: ProjectType;

  /**
   * Acteur ou structure porteuse du projet.
   */
  owner: string;

  /**
   * Profil du porteur de projet.
   */
  ownerProfile?: string;

  /**
   * Informations de contact et de ressources.
   */
  contactEmail?: string;
  contactPhone?: string;
  website?: string;

  /**
   * Type de milieu.
   */
  habitatType?: string | string[];

  /**
   * Emprise du projet.
   */
  extent?: string;

  /**
   * État du projet.
   * - isOngoing: vrai si le projet est en cours de manière continue
   */
  isOngoing?: boolean;
}

export interface GeoJSONProject {
  type: 'Feature';
  properties: Project;
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface ProjectsGeoJSON {
  type: 'FeatureCollection';
  features: GeoJSONProject[];
}

export type ProjectFeature = GeoJSONProject;

export type ProjectMapFeature = ClusterFeature | ProjectFeature;

export function isProjectCluster(feature: ProjectMapFeature): feature is ClusterFeature {
  return feature.properties && 'cluster' in feature.properties && feature.properties.cluster === true;
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  'pratiques-raisonnees': 'Pratiques raisonnées',
  'renaturation-restauration': 'Renaturation / Restauration',
  sensibilisation: 'Sensibilisation',
  formation: 'Formation',
  consultation: 'Consultation',
  suivis: 'Suivis',
};

export const PROJECT_TYPE_COLORS: Record<ProjectType, string> = {
  'pratiques-raisonnees': '#2E7D32', // vert agriculture raisonnée
  'renaturation-restauration': '#00897B', // vert-bleu renaturation des milieux
  sensibilisation: '#F57C00', // orange sensibilisation
  formation: '#1976D2', // bleu formation
  consultation: '#6A1B9A', // violet concertation/consultation
  suivis: '#C2185B', // rose suivis/monitoring
};

export { REGIONS };


