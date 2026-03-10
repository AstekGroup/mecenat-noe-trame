import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class Natura2000Service {
  private readonly logger = new Logger(Natura2000Service.name);
  private readonly filePath = path.join(process.cwd(), 'src/data/natura2000-simple.json');
  private cachedData: any = null;

  async getGeoJSON() {
    if (this.cachedData) {
      return this.cachedData;
    }

    try {
      this.logger.log(`Chargement des données Natura 2000 depuis ${this.filePath}`);
      const rawData = await fs.readFile(this.filePath, 'utf8');
      this.cachedData = JSON.parse(rawData);
      return this.cachedData;
    } catch (error) {
      this.logger.error(`Erreur lors du chargement de Natura 2000: ${error.message}`);
      // Tentative avec un chemin alternatif (si on est dans dist)
      try {
        const altPath = path.join(process.cwd(), 'dist/data/natura2000-simple.json');
        const rawData = await fs.readFile(altPath, 'utf8');
        this.cachedData = JSON.parse(rawData);
        return this.cachedData;
      } catch (altError) {
        this.logger.error(`Échec du chargement alternatif: ${altError.message}`);
        return { type: 'FeatureCollection', features: [] };
      }
    }
  }
}
