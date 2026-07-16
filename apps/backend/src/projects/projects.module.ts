import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { AirtableModule } from '../airtable/airtable.module';
import { StrapiModule } from '../strapi/strapi.module';

@Module({
  imports: [AirtableModule, StrapiModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
