import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Project } from '@make-map/types';
import { GeocodingService } from '../geocoding/geocoding.service';
import type {
  StrapiProjectItem,
  StrapiProjectsResponse,
} from './strapi-projects-mapping.util';
import { strapiProjectToDomain } from './strapi-projects-mapping.util';

@Injectable()
export class StrapiService {
  private readonly logger = new Logger(StrapiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly geocodingService: GeocodingService,
  ) {}

  /**
   * Récupère et transforme tous les projets depuis l'API REST Strapi.
   * Inclut le géocodage des adresses (même pipeline que AirtableService).
   *
   * @param devMode - conservé pour compatibilité avec ProjectsService.
   *                  Il n'active pas les brouillons côté Strapi : le endpoint
   *                  frontend public ne doit pas devenir une route de preview.
   */
  async fetchProjects(devMode = false): Promise<Project[]> {
    if (devMode) {
      this.logger.warn(
        'devMode ignoré pour Strapi : seuls les projets publiés sont exposés par ce endpoint public.',
      );
    }

    this.logger.log(
      'Chargement des projets publiés depuis Strapi...',
    );

    // 1. Récupérer les entrées paginées depuis l'API REST Strapi
    const items = await this.fetchProjectItems();
    this.logger.log(
      `${items.length} projets récupérés depuis l'API Strapi`,
    );

    // 2. Transformer sans géocodage
    const partialProjects: Project[] = items.map((item) =>
      strapiProjectToDomain(item),
    );

    // 3. Préparer le batch geocoding (même logique que AirtableService)
    const itemsToGeocode = partialProjects
      .filter((p) => (p.address || p.city) && p.postalCode)
      .map((p) => ({
        id: p.id,
        address: p.address,
        postalCode: p.postalCode,
        city: p.city,
      }));

    this.logger.log(
      `Géocodage de ${itemsToGeocode.length} adresses de projets...`,
    );

    // 4. Géocoder en batch (réutilise le GeocodingService existant)
    const geocodingResults =
      await this.geocodingService.batchGeocode(itemsToGeocode);

    // 5. Fusionner les résultats (même logique que AirtableService)
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
   * Récupère tous les projets depuis l'API REST Strapi avec pagination.
   */
  private async fetchProjectItems(): Promise<StrapiProjectItem[]> {
    const strapiUrl = this.configService
      .get<string>('STRAPI_API_URL')
      ?.replace(/\/+$/, '');
    const strapiToken = this.configService.get<string>('STRAPI_API_TOKEN');

    if (!strapiUrl) {
      throw new Error(
        'STRAPI_API_URL manquant. Vérifiez la variable d\'environnement.',
      );
    }

    const items: StrapiProjectItem[] = [];
    let page = 1;
    const pageSize = 100;
    let hasMore = true;

    while (hasMore) {
      const url = new URL(`${strapiUrl}/api/projects`);
      url.searchParams.set('pagination[page]', String(page));
      url.searchParams.set('pagination[pageSize]', String(pageSize));
      // Peupler toutes les relations et composants
      url.searchParams.set('populate', '*');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (strapiToken) {
        headers['Authorization'] = `Bearer ${strapiToken}`;
      }

      const response = await fetch(url.toString(), { headers });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(
          `Erreur API Strapi (projets): ${response.status} ${errorBody}`,
        );
        throw new Error(
          `Erreur Strapi (projets): ${response.status} ${response.statusText}`,
        );
      }

      const data: StrapiProjectsResponse = await response.json();
      items.push(...data.data);

      const { page: currentPage, pageCount } = data.meta.pagination;
      hasMore = currentPage < pageCount;
      page++;
    }

    return items;
  }
}
