/**
 * Utilitaires de mapping pour la table Airtable des PROJETS
 */

import type { Project, ProjectType } from '@make-map/types';
import type { AirtableProjectRecord } from './airtable-projects.types';

/**
 * Mapping des libellés Airtable -> ProjectType.
 * On reste volontairement tolérant sur la casse et les variantes.
 */
export function mapProjectType(
  rawType: string | string[] | undefined,
): ProjectType {
  if (!rawType || (Array.isArray(rawType) && rawType.length === 0)) {
    return 'renaturation';
  }

  const value = Array.isArray(rawType) ? rawType[0] : rawType;
  const lower = value.toLowerCase();

  if (lower.includes('pratique') || lower.includes('raisonn')) {
    return 'pratiques-raisonnees';
  }
  if (lower.includes('renatur')) {
    return 'renaturation';
  }
  if (lower.includes('restaur')) {
    return 'restauration';
  }
  if (lower.includes('sensibil')) {
    return 'sensibilisation';
  }
  if (lower.includes('format')) {
    return 'formation';
  }
  if (lower.includes('consult') || lower.includes('concertation')) {
    return 'consultation';
  }
  if (lower.includes('suivi') || lower.includes('monitor')) {
    return 'suivis';
  }

  // Valeur par défaut raisonnable si aucun mot-clé n'est reconnu.
  return 'renaturation';
}

/**
 * Transforme un enregistrement Airtable "Projet" en `Project` (sans géocodage).
 * Le géocodage (latitude/longitude/région/département) est appliqué ensuite
 * dans le service via `GeocodingService`.
 */
export function transformProjectRecord(
  record: AirtableProjectRecord,
  fallbackRegionFromPostalCode: (postalCode: string) => string | undefined,
): Project {
  const f = record.fields;

  const postalCode = (f['Code postal'] || '').trim();
  const fallbackRegion = fallbackRegionFromPostalCode(postalCode);

  const rawType = f['Type de projet'];
  const projectType = mapProjectType(rawType);

  const isOngoingRaw = f['Projet en cours ?'];
  const isOngoing =
    typeof isOngoingRaw === 'boolean'
      ? isOngoingRaw
      : typeof isOngoingRaw === 'string'
        ? isOngoingRaw.toLowerCase().startsWith('oui')
        : undefined;

  return {
    id: record.id,
    title: f['Nom du projet'] || 'Projet sans titre',
    description: f['Description'] || '',

    address: (f['Adresse'] || '').trim(),
    city: (f['Ville'] || '').trim(),
    region: (fallbackRegion as any) ?? (f['Région'] as any) ?? 'Île-de-France',
    department: (f['Département'] || '').trim(),
    postalCode,
    latitude: 0,
    longitude: 0,

    type: projectType,

    owner: f['Acteur porteur'] || '',
    contactEmail: f['Email de contact'] || undefined,
    contactPhone: f['Téléphone de contact'] || undefined,
    website: f['Site web'] || undefined,

    startDate: f['Date de début'] || undefined,
    endDate: f['Date de fin'] || undefined,
    isOngoing,

    tags: f['Mots-clés'] || undefined,
  };
}

