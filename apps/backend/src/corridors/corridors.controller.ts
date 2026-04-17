import { Controller, Get, Logger } from '@nestjs/common';
import { CorridorsService } from './corridors.service';

@Controller('api/corridors')
export class CorridorsController {
  private readonly logger = new Logger(CorridorsController.name);

  constructor(private readonly corridorsService: CorridorsService) {}

  @Get()
  async getGeoJSON() {
    this.logger.log('GET /api/corridors');
    return this.corridorsService.getGeoJSON();
  }
}
