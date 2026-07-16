import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EnvironmentalLayersService } from './environmental-layers.service';

function collectPositions(coordinates: unknown, positions: number[][]) {
  if (
    Array.isArray(coordinates) &&
    coordinates.length >= 2 &&
    typeof coordinates[0] === 'number' &&
    typeof coordinates[1] === 'number'
  ) {
    positions.push(coordinates as number[]);
    return;
  }

  if (Array.isArray(coordinates)) {
    coordinates.forEach((child) => collectPositions(child, positions));
  }
}

describe('EnvironmentalLayersService', () => {
  let service: EnvironmentalLayersService;

  beforeEach(() => {
    service = new EnvironmentalLayersService();
  });

  it('rejette un nom contenant une traversée de chemin', async () => {
    await expect(service.getLayer('../natura2000')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('retourne 404 pour un calque syntaxiquement valide mais non autorisé', async () => {
    await expect(
      service.getLayer('reserves-biologiques'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it.each([
    ['parcs-naturels-regionaux', 59],
    ['reserves-naturelles-nationales', 186],
    ['reserves-naturelles-regionales', 187],
  ])(
    'convertit %s de EPSG:3857 vers WGS84 sans perdre de features',
    async (name, expectedCount) => {
      const layer = await service.getLayer(name);
      const positions: number[][] = [];

      layer.features.forEach((feature) =>
        collectPositions(feature.geometry?.coordinates, positions),
      );

      expect(layer.features).toHaveLength(expectedCount);
      expect(layer.crs).toBeUndefined();
      expect(positions.length).toBeGreaterThan(0);
      expect(
        positions.every(([longitude]) => longitude >= -180 && longitude <= 180),
      ).toBe(true);
      expect(
        positions.every(([, latitude]) => latitude >= -90 && latitude <= 90),
      ).toBe(true);
    },
  );

  it('conserve le calque des parcs nationaux déjà en WGS84', async () => {
    const layer = await service.getLayer('parcs-nationaux');

    expect(layer.features).toHaveLength(28);
    expect(layer.crs).toBeUndefined();
  });
});
