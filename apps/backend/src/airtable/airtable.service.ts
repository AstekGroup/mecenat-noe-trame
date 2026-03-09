import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Event, Project } from '@make-map/types';
import type { AirtableRecord, AirtableResponse } from './airtable.types';
import {
  mapFormat,
  mapTargetAudience,
  mapModality,
  extractImageUrl,
  computeIsDuringWeek,
  parseAirtableDateTime,
  buildOrganizerContact,
  buildAccessibilityInfo,
} from './airtable-mapping.util';
import { GeocodingService } from '../geocoding/geocoding.service';
import type {
  AirtableProjectRecord,
  AirtableProjectsResponse,
} from './airtable-projects.types';
import { transformProjectRecord } from './airtable-projects-mapping.util';

// Valeurs qui EXCLUENT un événement de la cartographie
const MODERATION_EXCLUDED = 'Evénement validé à ne pas rendre visible';
const VISIBILITY_NOT_PUBLIC =
  "Je souhaite qu'il soit comptabilisé dans la Semaine de l'IA pour Tous mais non visible pour le grand public";

@Injectable()
export class AirtableService {
  private readonly logger = new Logger(AirtableService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly geocodingService: GeocodingService,
  ) {}

  /**
   * Récupère et transforme tous les événements depuis Airtable.
   * Inclut le géocodage des adresses.
   */
  async fetchEvents(devMode = false): Promise<Event[]> {
    this.logger.log(
      `Chargement des événements depuis Airtable (mode ${devMode ? 'dev' : 'production'})...`,
    );

    // 1. Récupérer les enregistrements bruts
    const records = await this.fetchRecords(devMode);
    this.logger.log(`${records.length} enregistrements récupérés depuis Airtable`);

    // 2. Transformer sans géocodage
    const partialEvents = records.map((r) => this.transformRecord(r));

    // 3. Préparer le batch geocoding (seulement pour les événements présentiels)
    const itemsToGeocode = partialEvents
      .filter((e) => e.modality === 'presentiel' && (e.address || e.city))
      .map((e) => ({
        id: e.id,
        address: e.address,
        postalCode: e.postalCode,
        city: e.city,
      }));

    this.logger.log(`Géocodage de ${itemsToGeocode.length} adresses...`);

    // 4. Géocoder en batch
    const geocodingResults =
      await this.geocodingService.batchGeocode(itemsToGeocode);

    // 5. Fusionner les résultats
    const events: Event[] = partialEvents.map((event) => {
      const geo = geocodingResults.get(event.id);
      if (geo) {
        return {
          ...event,
          latitude: geo.latitude,
          longitude: geo.longitude,
          region: geo.region || event.region,
          department: geo.department || event.department,
        };
      }
      return event;
    });

    this.logger.log(
      `${events.length} événements prêts (${events.filter((e) => e.latitude !== 0).length} géocodés)`,
    );

    return events;
  }

  /**
   * Récupère et transforme tous les projets depuis la table Airtable dédiée.
   * Inclut le géocodage des adresses.
   */
  async fetchProjects(devMode = false): Promise<Project[]> {
    this.logger.log(
      `Chargement des projets depuis Airtable (mode ${devMode ? 'dev' : 'production'})...`,
    );

    // 1. Récupérer les enregistrements bruts
    const records = await this.fetchProjectRecords(devMode);
    this.logger.log(
      `${records.length} enregistrements projets récupérés depuis Airtable`,
    );

    // 2. Transformer sans géocodage
    const partialProjects = records.map((r) =>
      transformProjectRecord(
        r,
        (postalCode) => this.geocodingService.getRegionFromPostalCode(postalCode),
      ),
    );

    // 3. Préparer le batch geocoding
    const itemsToGeocode = partialProjects
      .filter((p) => (p.address || p.city) && p.postalCode)
      .map((p) => ({
        id: p.id,
        address: p.address,
        postalCode: p.postalCode,
        city: p.city,
      }));

    this.logger.log(`Géocodage de ${itemsToGeocode.length} adresses de projets...`);

    // 4. Géocoder en batch
    const geocodingResults =
      await this.geocodingService.batchGeocode(itemsToGeocode);

    // 5. Fusionner les résultats
    const projects: Project[] = partialProjects.map((project) => {
      const geo = geocodingResults.get(project.id);
      if (geo) {
        return {
          ...project,
          latitude: geo.latitude,
          longitude: geo.longitude,
          region: (geo.region as any) || project.region,
          department: geo.department || project.department,
        };
      }
      return project;
    });

    this.logger.log(
      `${projects.length} projets prêts (${projects.filter((p) => p.latitude !== 0).length} géocodés)`,
    );

    return projects;
  }

  /**
   * Récupère tous les enregistrements depuis Airtable avec pagination.
   */
  private async fetchRecords(devMode: boolean): Promise<AirtableRecord[]> {
    const apiKey = this.configService.get<string>('AIRTABLE_API_KEY');
    const baseId = this.configService.get<string>('AIRTABLE_BASE_ID');
    const tableId = this.configService.get<string>('AIRTABLE_TABLE_ID');

    if (!apiKey || !baseId || !tableId) {
      throw new Error(
        'Configuration Airtable manquante. Vérifiez AIRTABLE_API_KEY, AIRTABLE_BASE_ID et AIRTABLE_TABLE_ID.',
      );
    }

    const records: AirtableRecord[] = [];
    let offset: string | undefined;

    do {
      const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`);
      url.searchParams.set('pageSize', '100');

      if (offset) {
        url.searchParams.set('offset', offset);
      }

      const filterFormula = this.buildFilterFormula(devMode);
      if (filterFormula) {
        url.searchParams.set('filterByFormula', filterFormula);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(`Erreur Airtable API: ${response.status} ${errorBody}`);
        throw new Error(
          `Erreur Airtable: ${response.status} ${response.statusText}`,
        );
      }

      const data: AirtableResponse = await response.json();
      records.push(...data.records);
      offset = data.offset;
    } while (offset);

    return records;
  }

  /**
   * Récupère tous les enregistrements PROJETS depuis la table Airtable dédiée,
   * avec pagination.
   */
  private async fetchProjectRecords(
    devMode: boolean,
  ): Promise<AirtableProjectRecord[]> {
    const apiKey = this.configService.get<string>('AIRTABLE_API_KEY');
    const baseId =
      this.configService.get<string>('AIRTABLE_PROJECTS_BASE_ID') ||
      this.configService.get<string>('AIRTABLE_BASE_ID');
    const tableId =
      this.configService.get<string>('AIRTABLE_PROJECTS_TABLE_ID');

    if (!apiKey || !baseId || !tableId) {
      throw new Error(
        'Configuration Airtable Projets manquante. Vérifiez AIRTABLE_PROJECTS_BASE_ID et AIRTABLE_PROJECTS_TABLE_ID.',
      );
    }

    const records: AirtableProjectRecord[] = [];
    let offset: string | undefined;

    do {
      const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`);
      url.searchParams.set('pageSize', '100');

      if (offset) {
        url.searchParams.set('offset', offset);
      }

      const filterFormula = this.buildProjectsFilterFormula(devMode);
      if (filterFormula) {
        url.searchParams.set('filterByFormula', filterFormula);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(
          `Erreur Airtable API (projets): ${response.status} ${errorBody}`,
        );
        throw new Error(
          `Erreur Airtable (projets): ${response.status} ${response.statusText}`,
        );
      }

      const data: AirtableProjectsResponse = await response.json();
      records.push(...data.records);
      offset = data.offset;
    } while (offset);

    return records;
  }

  /**
   * Construit la formule de filtre Airtable.
   */
  private buildFilterFormula(devMode: boolean): string | null {
    if (devMode) return null;

    return `AND({Modération de l'événement} != "${MODERATION_EXCLUDED}", {Visibilité sur la cartographie} != "${VISIBILITY_NOT_PUBLIC}")`;
  }

  /**
   * Formule de filtrage pour la table PROJETS.
   * Pour l'instant on ne filtre pas côté Airtable (retourne tout),
   * mais ce point pourra être ajusté en fonction des champs de modération.
   */
  private buildProjectsFilterFormula(_devMode: boolean): string | null {
    return null;
  }

  /**
   * Transforme un enregistrement Airtable en Event (sans géocodage).
   */
  private transformRecord(record: AirtableRecord): Event {
    const f = record.fields;

    const startDateTime = parseAirtableDateTime(
      f["Date de début de l'événement"],
    );
    const endDateTime = parseAirtableDateTime(
      f["Date de fin de l'événement"],
    );
    const { format, type } = mapFormat(f['Format']);
    const modality = mapModality(f["Type de l'événement"]);
    const targetAudience = mapTargetAudience(f['Public']);
    const imageUrl = extractImageUrl(f["Visuel de l'événement"]);
    const isDuringWeek = computeIsDuringWeek(
      f["Date de début de l'événement"],
    );
    const organizerContact = buildOrganizerContact(
      f["Prénom de l'animateur"],
      f["Nom de l'animateur"],
    );
    const accessibilityInfo = buildAccessibilityInfo(
      f["Modalités spécifiques d'accès au lieu"],
    );
    const postalCode = (f['Code postal du lieu'] || '').trim();
    const fallbackRegion =
      this.geocodingService.getRegionFromPostalCode(postalCode);

    return {
      id: record.id,
      title: f["Nom de l'événement"] || 'Événement sans titre',
      description: f['Description'] || '',
      date: startDateTime.date,
      time: startDateTime.time,
      endDate: endDateTime.date || undefined,
      endTime: endDateTime.time || undefined,
      address: (f['Adresse du lieu'] || '').trim(),
      city: (f['Ville du lieu'] || '').trim(),
      region: fallbackRegion,
      department: '',
      postalCode,
      latitude: 0,
      longitude: 0,
      type,
      organizer: f['Nom de la structure organisatrice'] || '',
      organizerContact,
      registrationUrl: f["Lien d'inscription à l'événement"] || undefined,
      isDuringWeek,
      modality,
      imageUrl,
      venueName: f['Lieu'] || undefined,
      accessibilityInfo,
      videoConferenceUrl: f['Lien de la visio'] || undefined,
      format,
      targetAudience,
      contactEmail:
        f['Email contact événement'] ||
        f["E-mail de l'animateur"] ||
        undefined,
      organizerWebsite: f['Site web de la structure'] || undefined,
      capacity: f["Capacité d'accueil de l'événement"] || undefined,
      registeredCount: undefined,
    };
  }
}
