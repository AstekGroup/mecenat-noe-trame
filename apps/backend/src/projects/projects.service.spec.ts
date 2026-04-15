import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { AirtableService } from '../airtable/airtable.service';
import type { Project } from '@make-map/types';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let airtableService: AirtableService;

  const mockProject: Project = {
    id: 'rec1',
    title: 'Projet Test',
    description: 'Description test',
    address: '1 rue Test',
    city: 'Paris',
    region: 'Île-de-France',
    department: '75',
    postalCode: '75001',
    latitude: 48.8566,
    longitude: 2.3522,
    type: 'renaturation-restauration',
    owner: 'Porteur Test',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: AirtableService,
          useValue: {
            fetchProjects: jest.fn().mockResolvedValue([mockProject]),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    airtableService = module.get<AirtableService>(AirtableService);
  });

  it('devrait être défini', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('devrait appeler airtableService.fetchProjects au premier appel', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockProject]);
      expect(airtableService.fetchProjects).toHaveBeenCalledWith(false);
    });

    it('devrait utiliser le cache lors du deuxième appel', async () => {
      await service.findAll();
      const result = await service.findAll();
      
      expect(result).toEqual([mockProject]);
      expect(airtableService.fetchProjects).toHaveBeenCalledTimes(1);
    });

    it('devrait avoir des caches séparés pour prod et devMode', async () => {
      await service.findAll(false); // prod
      await service.findAll(true);  // dev
      
      expect(airtableService.fetchProjects).toHaveBeenCalledTimes(2);
      expect(airtableService.fetchProjects).toHaveBeenCalledWith(false);
      expect(airtableService.fetchProjects).toHaveBeenCalledWith(true);
    });
  });

  describe('findOne', () => {
    it('devrait retourner un projet par son ID', async () => {
      const result = await service.findOne('rec1');
      expect(result).toEqual(mockProject);
    });

    it('devrait retourner null si le projet n\'existe pas', async () => {
      const result = await service.findOne('inconnu');
      expect(result).toBeNull();
    });
  });

  describe('invalidateCache', () => {
    it('devrait forcer un nouvel appel à Airtable après invalidation', async () => {
      await service.findAll();
      service.invalidateCache();
      await service.findAll();
      
      expect(airtableService.fetchProjects).toHaveBeenCalledTimes(2);
    });
  });
});
