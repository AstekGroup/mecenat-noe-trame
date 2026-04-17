import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as proj4 from 'proj4';

@Injectable()
export class CorridorsService {
  private readonly logger = new Logger(CorridorsService.name);
  private readonly filePath = path.join(
    process.cwd(),
    'src/data/TramePollinisateursGjson.geojson',
  );
  private cachedData: any = null;

  // Définition de la projection Lambert 93 (EPSG:2154)
  private readonly LAMBERT_93 =
    '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
  private readonly WGS84 = 'EPSG:4326';

  async getGeoJSON() {
    if (this.cachedData) {
      return this.cachedData;
    }

    try {
      this.logger.log(
        `Chargement et conversion des données Corridors depuis ${this.filePath}`,
      );
      const rawData = await fs.readFile(this.filePath, 'utf8');
      const geojson = JSON.parse(rawData);

      // Si le CRS est spécifié comme EPSG:2154, on convertit
      const crsName = geojson.crs?.properties?.name;
      if (
        crsName &&
        (crsName.includes('2154') || crsName.includes('Lambert-93'))
      ) {
        this.logger.log(
          'Détection de la projection Lambert 93, conversion en WGS 84...',
        );
        this.convertCoordinates(geojson);
        // On supprime le CRS pour que MapLibre utilise WGS 84 par défaut
        delete geojson.crs;
      }

      this.cachedData = geojson;
      return this.cachedData;
    } catch (error) {
      this.logger.error(
        `Erreur lors du chargement des Corridors: ${error.message}`,
      );
      // Tentative avec un chemin alternatif (si on est dans dist)
      try {
        const altPath = path.join(
          process.cwd(),
          'dist/data/TramePollinisateursGjson.geojson',
        );
        const rawData = await fs.readFile(altPath, 'utf8');
        const geojson = JSON.parse(rawData);

        const crsName = geojson.crs?.properties?.name;
        if (
          crsName &&
          (crsName.includes('2154') || crsName.includes('Lambert-93'))
        ) {
          this.convertCoordinates(geojson);
          delete geojson.crs;
        }

        this.cachedData = geojson;
        return this.cachedData;
      } catch (altError) {
        this.logger.error(
          `Échec du chargement alternatif Corridors: ${altError.message}`,
        );
        return { type: 'FeatureCollection', features: [] };
      }
    }
  }

  private convertCoordinates(geojson: any) {
    const converter = (proj4 as any).default
      ? (proj4 as any).default(this.LAMBERT_93, this.WGS84)
      : (proj4 as any)(this.LAMBERT_93, this.WGS84);

    if (geojson.type === 'FeatureCollection') {
      geojson.features.forEach((feature: any) => {
        this.processGeometry(feature.geometry, converter);
      });
    } else if (geojson.type === 'Feature') {
      this.processGeometry(geojson.geometry, converter);
    } else if (geojson.geometry) {
      this.processGeometry(geojson.geometry, converter);
    }
  }

  private processGeometry(geometry: any, converter: any) {
    if (!geometry || !geometry.coordinates) return;

    switch (geometry.type) {
      case 'Point':
        geometry.coordinates = converter.forward(geometry.coordinates);
        break;
      case 'LineString':
      case 'MultiPoint':
        geometry.coordinates = geometry.coordinates.map((coord: any) =>
          converter.forward(coord),
        );
        break;
      case 'Polygon':
      case 'MultiLineString':
        geometry.coordinates = geometry.coordinates.map((ring: any) =>
          ring.map((coord: any) => converter.forward(coord)),
        );
        break;
      case 'MultiPolygon':
        geometry.coordinates = geometry.coordinates.map((polygon: any) =>
          polygon.map((ring: any) =>
            ring.map((coord: any) => converter.forward(coord)),
          ),
        );
        break;
      case 'GeometryCollection':
        geometry.geometries.forEach((g: any) =>
          this.processGeometry(g, converter),
        );
        break;
    }
  }
}
