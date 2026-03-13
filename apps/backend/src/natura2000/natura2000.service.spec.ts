import { Test, TestingModule } from '@nestjs/testing';
import { Natura2000Service } from './natura2000.service';
import * as fs from 'fs/promises';
import * as path from 'path';

jest.mock('fs/promises');

describe('Natura2000Service', () => {
  let service: Natura2000Service;

  const mockGeoJSON = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [2.3522, 48.8566] },
        properties: { name: 'Test Area' },
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Natura2000Service],
    }).compile();

    service = module.get<Natura2000Service>(Natura2000Service);
    
    // Clear cache between tests
    (service as any).cachedData = null;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGeoJSON', () => {
    it('should load and parse the GeoJSON file', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockGeoJSON));

      const result = await service.getGeoJSON();

      expect(result).toEqual(mockGeoJSON);
      expect(fs.readFile).toHaveBeenCalledWith(expect.stringContaining('natura2000-simple.json'), 'utf8');
    });

    it('should use cached data if available', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockGeoJSON));

      await service.getGeoJSON(); // First call
      const result = await service.getGeoJSON(); // Second call

      expect(result).toEqual(mockGeoJSON);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });

    it('should try fallback path if first attempt fails', async () => {
      (fs.readFile as jest.Mock)
        .mockRejectedValueOnce(new Error('File not found'))
        .mockResolvedValueOnce(JSON.stringify(mockGeoJSON));

      const result = await service.getGeoJSON();

      expect(result).toEqual(mockGeoJSON);
      expect(fs.readFile).toHaveBeenCalledTimes(2);
      expect(fs.readFile).toHaveBeenLastCalledWith(expect.stringContaining('dist'), 'utf8');
    });

    it('should return empty FeatureCollection if both attempts fail', async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('Access denied'));

      const result = await service.getGeoJSON();

      expect(result).toEqual({ type: 'FeatureCollection', features: [] });
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });
  });
});
