import { Module } from '@nestjs/common';
import { StrapiService } from './strapi.service';
import { GeocodingModule } from '../geocoding/geocoding.module';

@Module({
  imports: [GeocodingModule],
  providers: [StrapiService],
  exports: [StrapiService],
})
export class StrapiModule {}
