import { Injectable, Logger } from '@nestjs/common';
import type { Project } from '@make-map/types';
import { StrapiService } from '../strapi/strapi.service';

interface CachedProjectsData {
  projects: Project[];
  timestamp: number;
}

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  // Cache en mémoire avec TTL (prod + devMode séparés)
  private cache: CachedProjectsData | null = null;
  private devCache: CachedProjectsData | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly strapiService: StrapiService) {}

  /**
   * Récupère tous les projets (avec cache TTL) depuis Strapi.
   */
  async findAll(devMode = false): Promise<Project[]> {
    const cached = devMode ? this.devCache : this.cache;

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.debug(
        `Cache projets hit (${devMode ? 'dev' : 'prod'}, âge: ${Math.round((Date.now() - cached.timestamp) / 1000)}s)`,
      );
      return cached.projects;
    }

    this.logger.log('Cache projets miss, chargement depuis Strapi...');

    const projects = await this.strapiService.fetchProjects(devMode);

    const newCache: CachedProjectsData = { projects, timestamp: Date.now() };
    if (devMode) {
      this.devCache = newCache;
    } else {
      this.cache = newCache;
    }

    return projects;
  }

  /**
   * Récupère un projet par son ID.
   */
  async findOne(id: string, devMode = false): Promise<Project | null> {
    const projects = await this.findAll(devMode);
    return projects.find((p) => p.id === id) || null;
  }

  /**
   * Force le rafraîchissement du cache.
   */
  invalidateCache(): void {
    this.cache = null;
    this.devCache = null;
    this.logger.log('Cache projets invalidé');
  }
}
