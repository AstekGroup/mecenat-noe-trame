import {
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  NotFoundException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import type { Project } from '@make-map/types';
import { ProjectsService } from './projects.service';

@Controller('api/projects')
export class ProjectsController {
  private readonly logger = new Logger(ProjectsController.name);

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Invalidation serveur déclenchée par Strapi après une mutation éditoriale.
   * Cette route ne modifie aucune donnée et exige un secret partagé côté serveur.
   */
  @Post('cache/invalidate')
  @HttpCode(HttpStatus.NO_CONTENT)
  invalidateCache(@Headers('authorization') authorization?: string): void {
    const expectedSecret = this.configService.get<string>(
      'PROJECT_CACHE_INVALIDATION_SECRET',
    );
    const providedSecret = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : '';

    if (!this.secretsMatch(providedSecret, expectedSecret)) {
      throw new UnauthorizedException('Secret d’invalidation invalide');
    }

    this.projectsService.invalidateCache();
  }

  /**
   * GET /api/projects
   * Retourne tous les projets.
   * Query: ?devMode=true pour inclure d'éventuels projets non publiés.
   */
  @Get()
  async findAll(@Query('devMode') devMode?: string): Promise<Project[]> {
    const isDevMode = devMode === 'true';
    this.logger.log(`GET /api/projects (devMode: ${isDevMode})`);
    return this.projectsService.findAll(isDevMode);
  }

  /**
   * GET /api/projects/:id
   * Retourne un projet par son ID.
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('devMode') devMode?: string,
  ): Promise<Project> {
    const isDevMode = devMode === 'true';
    this.logger.log(`GET /api/projects/${id} (devMode: ${isDevMode})`);
    const project = await this.projectsService.findOne(id, isDevMode);
    if (!project) {
      throw new NotFoundException(`Projet ${id} non trouvé`);
    }
    return project;
  }

  private secretsMatch(provided: string, expected?: string): boolean {
    if (!provided || !expected) return false;

    const providedBuffer = Buffer.from(provided);
    const expectedBuffer = Buffer.from(expected);
    return (
      providedBuffer.length === expectedBuffer.length &&
      timingSafeEqual(providedBuffer, expectedBuffer)
    );
  }
}
