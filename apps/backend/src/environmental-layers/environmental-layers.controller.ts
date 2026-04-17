import { Controller, Get, Param } from '@nestjs/common';
import { EnvironmentalLayersService } from './environmental-layers.service';

@Controller('api/environmental-layers')
export class EnvironmentalLayersController {
  constructor(private readonly layersService: EnvironmentalLayersService) {}

  @Get(':layerName')
  async getLayer(@Param('layerName') layerName: string) {
    return this.layersService.getLayer(layerName);
  }
}
