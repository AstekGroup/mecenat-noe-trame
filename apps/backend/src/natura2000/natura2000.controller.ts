import { Controller, Get, Logger } from '@nestjs/common';
import { Natura2000Service } from './natura2000.service';

@Controller('api/natura2000')
export class Natura2000Controller {
  private readonly logger = new Logger(Natura2000Controller.name);

  constructor(private readonly natura2000Service: Natura2000Service) {}

  @Get()
  async getGeoJSON() {
    this.logger.log('GET /api/natura2000');
    return this.natura2000Service.getGeoJSON();
  }
}
