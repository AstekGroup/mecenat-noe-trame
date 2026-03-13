import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Project } from '@make-map/types';
import { GeocodingService } from '../geocoding/geocoding.service';
import type {
  AirtableProjectRecord,
  AirtableProjectsResponse,
} from './airtable-projects.types';
import { transformProjectRecord } from './airtable-projects-mapping.util';

@Injectable()
export class AirtableService {
  private readonly logger = new Logger(AirtableService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly geocodingService: GeocodingService,
  ) {}

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
   * Formule de filtrage pour la table PROJETS.
   * Pour l'instant on ne filtre pas côté Airtable (retourne tout),
   * mais ce point pourra être ajusté en fonction des champs de modération.
   */
  private buildProjectsFilterFormula(_devMode: boolean): string | null {
    return null;
  }
}
