import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AirtableService } from './airtable.service';
import { GeocodingService } from '../geocoding/geocoding.service';
import { AirtableProjectsResponse } from './airtable-projects.types';

describe('AirtableService', () => {
  let service: AirtableService;
  let configService: ConfigService;
  let geocodingService: GeocodingService;

  const mockProjectRecord = {
    id: 'rec1',
    fields: {
      'Nom du projet': 'Test Project',
      'Code postal': '75001',
      Adresse: '1 rue de Rivoli',
      Ville: 'Paris',
      "Type d'action": 'renaturation-restauration',
      'Acteur porteur': 'Ville de Paris',
    },
  };

  const mockAirtableResponse: AirtableProjectsResponse = {
    records: [mockProjectRecord],
  };

  beforeEach(async () => {
    // Mock global fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockAirtableResponse),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AirtableService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'AIRTABLE_API_KEY') return 'test-key';
              if (key === 'AIRTABLE_BASE_ID') return 'test-base';
              if (key === 'AIRTABLE_PROJECTS_TABLE_ID') return 'test-table';
              return null;
            }),
          },
        },
        {
          provide: GeocodingService,
          useValue: {
            getRegionFromPostalCode: jest.fn().mockReturnValue('Île-de-France'),
            batchGeocode: jest.fn().mockResolvedValue(
              new Map([
                [
                  'rec1',
                  {
                    latitude: 48.8566,
                    longitude: 2.3522,
                    region: 'Île-de-France',
                    department: 'Paris',
                  },
                ],
              ]),
            ),
          },
        },
      ],
    }).compile();

    service = module.get<AirtableService>(AirtableService);
    configService = module.get<ConfigService>(ConfigService);
    geocodingService = module.get<GeocodingService>(GeocodingService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchProjects', () => {
    it('should fetch, transform and geocode projects', async () => {
      const projects = await service.fetchProjects();

      expect(projects).toHaveLength(1);
      expect(projects[0]).toMatchObject({
        id: 'rec1',
        title: 'Test Project',
        latitude: 48.8566,
        longitude: 2.3522,
        region: 'Île-de-France',
      });

      expect(global.fetch).toHaveBeenCalled();
      expect(geocodingService.batchGeocode).toHaveBeenCalled();
    });

    it('should throw an error if Airtable configuration is missing', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(null);
      await expect(service.fetchProjects()).rejects.toThrow(
        'Configuration Airtable Projets manquante',
      );
    });

    it('should throw an error if Airtable API returns an error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: jest.fn().mockResolvedValue('Invalid API key'),
      });

      await expect(service.fetchProjects()).rejects.toThrow(
        'Erreur Airtable (projets): 401 Unauthorized',
      );
    });

    it('should handle pagination with offset', async () => {
      const firstResponse = {
        records: [mockProjectRecord],
        offset: 'next-page',
      };
      const secondResponse = {
        records: [{ ...mockProjectRecord, id: 'rec2' }],
      };

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(firstResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(secondResponse),
        });

      jest.spyOn(geocodingService, 'batchGeocode').mockResolvedValue(new Map());

      const projects = await service.fetchProjects();
      expect(projects).toHaveLength(2);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
