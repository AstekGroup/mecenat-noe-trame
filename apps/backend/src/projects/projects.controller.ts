import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import type { Project } from '@make-map/types';
import { ProjectsService } from './projects.service';

@Controller('api/projects')
export class ProjectsController {
  private readonly logger = new Logger(ProjectsController.name);

  constructor(private readonly projectsService: ProjectsService) {}

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
}

