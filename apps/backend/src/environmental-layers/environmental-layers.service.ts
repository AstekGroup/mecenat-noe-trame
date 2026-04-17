import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class EnvironmentalLayersService {
  private readonly logger = new Logger(EnvironmentalLayersService.name);
  private readonly dataDir = path.join(
    process.cwd(),
    'src/data/environmental-layers',
  );
  private cache: Record<string, any> = {};

  async getLayer(layerName: string) {
    if (this.cache[layerName]) {
      return this.cache[layerName];
    }

    const fileName = `${layerName}-simple.json`;
    const filePath = path.join(this.dataDir, fileName);

    try {
      this.logger.log(`Chargement du calque ${layerName} depuis ${filePath}`);
      const rawData = await fs.readFile(filePath, 'utf8');
      this.cache[layerName] = JSON.parse(rawData);
      return this.cache[layerName];
    } catch (error) {
      this.logger.error(
        `Erreur lors du chargement du calque ${layerName}: ${error.message}`,
      );
      // Tentative avec un chemin alternatif (si on est dans dist)
      try {
        const altPath = path.join(
          process.cwd(),
          'dist/data/environmental-layers',
          fileName,
        );
        const rawData = await fs.readFile(altPath, 'utf8');
        this.cache[layerName] = JSON.parse(rawData);
        return this.cache[layerName];
      } catch (altError) {
        this.logger.error(
          `Échec du chargement alternatif pour ${layerName}: ${altError.message}`,
        );
        return { type: 'FeatureCollection', features: [] };
      }
    }
  }
}
