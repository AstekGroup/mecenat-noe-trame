import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StrapiService } from './strapi.service';
import { GeocodingService } from '../geocoding/geocoding.service';
import type { StrapiProjectsResponse } from './strapi-projects-mapping.util';

describe('StrapiService', () => {
  let service: StrapiService;
  let geocodingService: GeocodingService;
  const requestedUrls: string[] = [];

  const strapiResponse: StrapiProjectsResponse = {
    data: [
      {
        id: 1,
        documentId: 'project-doc-1',
        title: 'Projet Strapi',
        description: 'Description Strapi',
        address: '1 rue Test',
        city: 'Paris',
        postalCode: '75001',
        latitude: null,
        longitude: null,
        extent: null,
        isOngoing: true,
        contactEmail: null,
        contactPhone: null,
        website: null,
        sensitizationTitle: null,
        trainingTitle: null,
        consultationType: null,
        followUpType: null,
        followUpFrequency: null,
        publishedAt: '2026-07-09T00:00:00.000Z',
        department: {
          code: '75',
          name: 'Paris',
          region: 'Île-de-France',
        },
        partner: {
          name: 'Noé',
          profile: 'Association',
        },
        projectType: {
          slug: 'formation',
          label: 'Formation',
          color: null,
        },
        habitatTypes: [{ label: 'Prairie' }],
        reasonedPracticeTypes: [],
        renaturationTypes: [],
      },
    ],
    meta: {
      pagination: {
        page: 1,
        pageSize: 100,
        pageCount: 1,
        total: 1,
      },
    },
  };

  beforeEach(async () => {
    requestedUrls.length = 0;
    global.fetch = jest.fn().mockImplementation((url: URL | string) => {
      requestedUrls.push(url.toString());
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(strapiResponse),
      });
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StrapiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'STRAPI_API_URL') return 'http://localhost:1337/';
              if (key === 'STRAPI_API_TOKEN') return 'test-token';
              return undefined;
            }),
          },
        },
        {
          provide: GeocodingService,
          useValue: {
            batchGeocode: jest.fn().mockResolvedValue(
              new Map([
                [
                  'project-doc-1',
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

    service = module.get<StrapiService>(StrapiService);
    geocodingService = module.get<GeocodingService>(GeocodingService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('récupère les projets Strapi, les mappe et applique le géocodage serveur', async () => {
    const projects = await service.fetchProjects();

    expect(projects).toHaveLength(1);
    expect(projects[0]).toMatchObject({
      id: 'project-doc-1',
      type: 'formation',
      latitude: 48.8566,
      longitude: 2.3522,
      region: 'Île-de-France',
    });
    expect(geocodingService.batchGeocode).toHaveBeenCalledWith([
      {
        id: 'project-doc-1',
        address: '1 rue Test',
        postalCode: '75001',
        city: 'Paris',
      },
    ]);
  });

  it('ne transforme pas devMode en accès brouillon public Strapi', async () => {
    await service.fetchProjects(true);

    expect(requestedUrls[0]).toContain('/api/projects');
    expect(requestedUrls[0]).toContain('populate=*');
    expect(requestedUrls[0]).not.toContain('status=draft');
  });
});
