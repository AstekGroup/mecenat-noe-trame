import { Module } from '@nestjs/common';
import { EnvironmentalLayersController } from './environmental-layers.controller';
import { EnvironmentalLayersService } from './environmental-layers.service';

@Module({
  controllers: [EnvironmentalLayersController],
  providers: [EnvironmentalLayersService],
  exports: [EnvironmentalLayersService],
})
export class EnvironmentalLayersModule {}
