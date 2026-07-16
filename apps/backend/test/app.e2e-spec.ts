import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { StrapiService } from './../src/strapi/strapi.service';
import type { Project } from '@make-map/types';

interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

interface FeatureCollectionResponse {
  type: string;
  features: unknown[];
}

describe('API backend (e2e)', () => {
  let app: INestApplication<App>;
  const fetchProjects = jest.fn();
  const project: Project = {
    id: 'project-e2e',
    title: 'Projet e2e',
    description: 'Validation du contrat public',
    address: '1 rue Test',
    city: 'Paris',
    region: 'Île-de-France',
    department: 'Paris',
    postalCode: '75001',
    latitude: 48.8566,
    longitude: 2.3522,
    type: 'renaturation-restauration',
    owner: 'Porteur test',
  };

  beforeAll(async () => {
    process.env.PROJECT_CACHE_INVALIDATION_SECRET = 'e2e-cache-secret';
    fetchProjects.mockResolvedValue([project]);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(StrapiService)
      .useValue({ fetchProjects })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    delete process.env.PROJECT_CACHE_INVALIDATION_SECRET;
  });

  it('expose un healthcheck structuré', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect('Content-Type', /json/);

    const body = response.body as HealthResponse;

    expect(body).toMatchObject({
      status: 'ok',
      service: 'make-map-backend',
    });
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });

  it('expose les projets et invalide leur cache avec un secret serveur', async () => {
    await request(app.getHttpServer())
      .get('/api/projects')
      .expect(200, [project]);
    await request(app.getHttpServer())
      .get('/api/projects')
      .expect(200, [project]);
    expect(fetchProjects).toHaveBeenCalledTimes(1);

    await request(app.getHttpServer())
      .post('/api/projects/cache/invalidate')
      .set('Authorization', 'Bearer incorrect')
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/projects/cache/invalidate')
      .set('Authorization', 'Bearer e2e-cache-secret')
      .expect(204);

    await request(app.getHttpServer())
      .get('/api/projects')
      .expect(200, [project]);
    expect(fetchProjects).toHaveBeenCalledTimes(2);
  });

  it('rejette la traversée et distingue un calque inconnu', async () => {
    await request(app.getHttpServer())
      .get('/api/environmental-layers/..%2Fnatura2000')
      .expect(400);
    await request(app.getHttpServer())
      .get('/api/environmental-layers/reserves-biologiques')
      .expect(404);
  });

  it('sert un calque autorisé avec son nombre de features', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/environmental-layers/parcs-nationaux')
      .expect(200);

    const body = response.body as FeatureCollectionResponse;

    expect(body.type).toBe('FeatureCollection');
    expect(body.features).toHaveLength(28);
  });
});
