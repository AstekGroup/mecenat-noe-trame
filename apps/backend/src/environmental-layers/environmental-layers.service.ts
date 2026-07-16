import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as proj4 from 'proj4';

export interface EnvironmentalGeoJson {
  type: string;
  features: Array<{
    geometry?: {
      coordinates?: unknown;
    } | null;
    [key: string]: unknown;
  }>;
  crs?: {
    properties?: {
      name?: string;
    };
  };
  [key: string]: unknown;
}

const AVAILABLE_LAYERS = new Set([
  'parcs-nationaux',
  'parcs-naturels-regionaux',
  'reserves-naturelles-nationales',
  'reserves-naturelles-regionales',
]);

@Injectable()
export class EnvironmentalLayersService {
  private readonly logger = new Logger(EnvironmentalLayersService.name);
  private readonly dataDir = path.join(
    process.cwd(),
    'src/data/environmental-layers',
  );
  private cache: Record<string, EnvironmentalGeoJson> = {};

  async getLayer(layerName: string): Promise<EnvironmentalGeoJson> {
    if (!/^[a-z0-9-]+$/.test(layerName)) {
      throw new BadRequestException('Nom de calque invalide');
    }

    if (!AVAILABLE_LAYERS.has(layerName)) {
      throw new NotFoundException(`Calque ${layerName} non disponible`);
    }

    if (this.cache[layerName]) {
      return this.cache[layerName];
    }

    const fileName = `${layerName}-simple.json`;
    const filePath = path.join(this.dataDir, fileName);

    try {
      this.logger.log(`Chargement du calque ${layerName} depuis ${filePath}`);
      const rawData = await fs.readFile(filePath, 'utf8');
      this.cache[layerName] = this.toWgs84(
        JSON.parse(rawData) as EnvironmentalGeoJson,
      );
      return this.cache[layerName];
    } catch (error) {
      this.logger.error(
        `Erreur lors du chargement du calque ${layerName}: ${this.errorMessage(error)}`,
      );
      // Tentative avec un chemin alternatif (si on est dans dist)
      try {
        const altPath = path.join(
          process.cwd(),
          'dist/data/environmental-layers',
          fileName,
        );
        const rawData = await fs.readFile(altPath, 'utf8');
        this.cache[layerName] = this.toWgs84(
          JSON.parse(rawData) as EnvironmentalGeoJson,
        );
        return this.cache[layerName];
      } catch (altError) {
        this.logger.error(
          `Échec du chargement alternatif pour ${layerName}: ${this.errorMessage(altError)}`,
        );
        throw new NotFoundException(`Calque ${layerName} non disponible`);
      }
    }
  }

  private toWgs84(geojson: EnvironmentalGeoJson): EnvironmentalGeoJson {
    const crsName = geojson.crs?.properties?.name;
    if (!crsName?.includes('3857')) {
      return geojson;
    }

    const converter = proj4('EPSG:3857', 'EPSG:4326');

    const convertCoordinates = (coordinates: unknown): unknown => {
      if (
        Array.isArray(coordinates) &&
        coordinates.length >= 2 &&
        typeof coordinates[0] === 'number' &&
        typeof coordinates[1] === 'number'
      ) {
        return converter.forward(coordinates as [number, number]);
      }

      return Array.isArray(coordinates)
        ? coordinates.map(convertCoordinates)
        : coordinates;
    };

    for (const feature of geojson.features ?? []) {
      if (feature.geometry?.coordinates) {
        feature.geometry.coordinates = convertCoordinates(
          feature.geometry.coordinates,
        );
      }
    }

    delete geojson.crs;
    return geojson;
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
