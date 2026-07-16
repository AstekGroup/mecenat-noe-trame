/**
 * Mapping Strapi REST shape → Project.
 *
 * La forme native Strapi (REST API v5) est aplatie :
 *   { data: [{ id, documentId, ...fields, department, partner, projectType }] }
 *
 * Ce fichier transforme cette forme en `Project` du contrat partagé @make-map/types.
 *
 * Le géocodage (latitude/longitude/région/département) n'est PAS fait ici :
 * il est appliqué ensuite dans `StrapiService` via `GeocodingService`.
 */

import type { Project, ProjectType, Region } from '@make-map/types';

const DEFAULT_REGION: Region = 'Île-de-France';
const DEFAULT_PROJECT_TYPE: ProjectType = 'renaturation-restauration';
const VALID_REGIONS = [
  'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté',
  'Bretagne',
  'Centre-Val de Loire',
  'Corse',
  'Grand Est',
  'Hauts-de-France',
  'Île-de-France',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Pays de la Loire',
  "Provence-Alpes-Côte d'Azur",
  'Guadeloupe',
  'Martinique',
  'Guyane',
  'La Réunion',
  'Mayotte',
] as const satisfies readonly Region[];
const VALID_PROJECT_TYPES = [
  'pratiques-raisonnees',
  'renaturation-restauration',
  'sensibilisation',
  'formation',
  'consultation',
  'suivis',
] as const satisfies readonly ProjectType[];

const PROJECT_TYPE_LABEL_TO_SLUG: Record<string, ProjectType> = {
  Sensibilisation: 'sensibilisation',
  'Renaturation / Restauration': 'renaturation-restauration',
  'Pratiques raisonnées': 'pratiques-raisonnees',
  Formation: 'formation',
  'Consultation / Concertation': 'consultation',
  Suivi: 'suivis',
};

function normalizeRegion(value: string | null | undefined): Region {
  if (value && (VALID_REGIONS as readonly string[]).includes(value)) {
    return value as Region;
  }
  return DEFAULT_REGION;
}

function normalizeProjectType(value: string | null | undefined): ProjectType {
  if (value && (VALID_PROJECT_TYPES as readonly string[]).includes(value)) {
    return value as ProjectType;
  }
  return DEFAULT_PROJECT_TYPE;
}

function resolveProjectType(item: StrapiProjectItem): ProjectType {
  if (item.projectTypeSelection) {
    const slug = PROJECT_TYPE_LABEL_TO_SLUG[item.projectTypeSelection];
    if (slug) {
      return normalizeProjectType(slug);
    }
  }
  return normalizeProjectType(item.projectType?.slug);
}

function resolveOwner(item: StrapiProjectItem): string {
  if (typeof item.ownerName === 'string') {
    return item.ownerName;
  }
  return item.partner?.name ?? '';
}

function resolveOwnerProfile(item: StrapiProjectItem): string | undefined {
  return item.ownerProfile ?? item.partner?.profile ?? undefined;
}

function resolveHabitatType(item: StrapiProjectItem): string[] {
  if (item.habitatTypeSelection) {
    return [item.habitatTypeSelection];
  }
  return item.habitatTypes?.map((h) => h.label) ?? [];
}

function resolveReasonedPracticeTypes(item: StrapiProjectItem): string[] | undefined {
  if (Array.isArray(item.reasonedPracticeSelections)) {
    return item.reasonedPracticeSelections;
  }
  return item.reasonedPracticeTypes?.map((c) => c.label);
}

function resolveRenaturationTypes(item: StrapiProjectItem): string[] | undefined {
  if (Array.isArray(item.renaturationSelections)) {
    return item.renaturationSelections;
  }
  return item.renaturationTypes?.map((c) => c.label);
}

function resolveExtent(item: StrapiProjectItem): string | undefined {
  if (item.extentValue !== null && item.extentValue !== undefined) {
    return item.extentUnit
      ? `${item.extentValue} ${item.extentUnit}`
      : String(item.extentValue);
  }
  return item.extent ?? undefined;
}

/**
 * Interface représentant un projet tel que retourné par l'API REST Strapi v5
 * avec ?populate=* (relations et composants peuplés).
 */
export interface StrapiProjectItem {
  id: number;
  documentId: string;
  title: string;
  description: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  extent: string | null;
  isOngoing: boolean | null;
  displayContactEmail: boolean | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  sensitizationTitle: string | null;
  trainingTitle: string | null;
  consultationType: string | null;
  followUpType: string | null;
  followUpFrequency: string | null;
  publishedAt: string | null;

  /** Relation manyToOne → Department */
  department: {
    code: string;
    name: string;
    region: string;
  } | null;

  /** Relation manyToOne → Partner */
  partner: {
    name: string;
    profile: string | null;
  } | null;

  /** Relation manyToOne → ProjectType */
  projectType: {
    slug: string;
    label: string;
    color: string | null;
  } | null;

  /** Relation manyToMany → HabitatType */
  habitatTypes: Array<{ label: string }>;

  /** Composant repeatable project.practice-type */
  reasonedPracticeTypes: Array<{ label: string }>;

  /** Composant repeatable project.renaturation-type */
  renaturationTypes: Array<{ label: string }>;

  /** Champs directs de saisie (Phase 4/4.5) */
  projectTypeSelection: string | null;
  ownerProfile: string | null;
  ownerName: string | null;
  habitatTypeSelection: string | null;
  reasonedPracticeSelections: string[] | null;
  renaturationSelections: string[] | null;
  extentValue: number | null;
  extentUnit: string | null;
}

export interface StrapiProjectsResponse {
  data: StrapiProjectItem[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Transforme un projet Strapi (REST shape) en `Project` du contrat partagé.
 * Les champs latitude/longitude/region/department peuvent être écrasés
 * ultérieurement par le géocodage.
 */
export function strapiProjectToDomain(item: StrapiProjectItem): Project {
  return {
    id: item.documentId,
    title: item.title || 'Projet sans titre',
    description: item.description ?? '',

    address: (item.address || '').trim(),
    city: (item.city || '').trim(),
    postalCode: (item.postalCode || '').trim(),
    latitude: item.latitude ?? 0,
    longitude: item.longitude ?? 0,

    region: normalizeRegion(item.department?.region),
    department: item.department?.name ?? '',

    type: resolveProjectType(item),

    owner: resolveOwner(item),
    ownerProfile: resolveOwnerProfile(item),
    contactEmail: item.displayContactEmail ? item.contactEmail ?? undefined : undefined,
    contactPhone: item.contactPhone ?? undefined,
    website: item.website ?? undefined,

    habitatType: resolveHabitatType(item),
    extent: resolveExtent(item),
    reasonedPracticeTypes: resolveReasonedPracticeTypes(item),
    renaturationTypes: resolveRenaturationTypes(item),
    sensitizationTitle: item.sensitizationTitle ?? undefined,
    trainingTitle: item.trainingTitle ?? undefined,
    consultationType: item.consultationType ?? undefined,
    followUpType: item.followUpType ?? undefined,
    followUpFrequency: item.followUpFrequency ?? undefined,
    isOngoing: item.isOngoing ?? undefined,
  };
}
