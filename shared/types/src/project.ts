import type { Region } from './event';
import { REGIONS } from './event';

export type ProjectType =
  | 'pratiques-raisonnees'
  | 'renaturation'
  | 'restauration'
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
   * Informations de contact et de ressources.
   */
  contactEmail?: string;
  contactPhone?: string;
  website?: string;

  /**
   * Période du projet (facultative).
   * - startDate: date de démarrage (AAAA-MM-JJ)
   * - endDate: date de fin si le projet est borné
   * - isOngoing: vrai si le projet est en cours de manière continue
   */
  startDate?: string;
  endDate?: string;
  isOngoing?: boolean;

  /**
   * Mots-clés libres ou thématiques complémentaires (ex: type de milieu, espèces ciblées...).
   */
  tags?: string[];
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

export interface ClusterProperties {
  cluster: boolean;
  cluster_id: number;
  point_count: number;
  point_count_abbreviated: string | number;
}

export type ClusterFeature = {
  type: 'Feature';
  properties: ClusterProperties;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  id: number;
};

export type ProjectFeature = GeoJSONProject;

export type MapFeature = ClusterFeature | ProjectFeature;

export function isCluster(feature: MapFeature): feature is ClusterFeature {
  return 'cluster' in feature.properties && feature.properties.cluster === true;
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  'pratiques-raisonnees': 'Pratiques raisonnées',
  renaturation: 'Renaturation',
  restauration: 'Restauration',
  sensibilisation: 'Sensibilisation',
  formation: 'Formation',
  consultation: 'Consultation',
  suivis: 'Suivis',
};

export const PROJECT_TYPE_COLORS: Record<ProjectType, string> = {
  'pratiques-raisonnees': '#2E7D32', // vert agriculture raisonnée
  renaturation: '#00897B', // vert-bleu renaturation des milieux
  restauration: '#5D4037', // brun restauration d’habitats
  sensibilisation: '#F57C00', // orange sensibilisation
  formation: '#1976D2', // bleu formation
  consultation: '#6A1B9A', // violet concertation/consultation
  suivis: '#C2185B', // rose suivis/monitoring
};

export { REGIONS };

