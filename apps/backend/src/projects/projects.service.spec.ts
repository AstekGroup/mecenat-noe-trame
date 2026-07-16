import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { StrapiService } from '../strapi/strapi.service';
import type { Project } from '@make-map/types';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let fetchProjectsMock: jest.Mock;

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

  const mockDevProject: Project = {
    ...mockProject,
    id: 'rec2',
    title: 'Projet Dev',
  };

  beforeEach(async () => {
    fetchProjectsMock = jest
      .fn()
      .mockImplementation((devMode: boolean) =>
        Promise.resolve(devMode ? [mockDevProject] : [mockProject]),
      );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: StrapiService,
          useValue: {
            fetchProjects: fetchProjectsMock,
          },
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('devrait être défini', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('devrait charger les projets depuis Strapi au premier appel', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockProject]);
      expect(fetchProjectsMock).toHaveBeenCalledWith(false);
    });

    it('devrait utiliser le cache lors du deuxième appel', async () => {
      await service.findAll();
      const result = await service.findAll();

      expect(result).toEqual([mockProject]);
      expect(fetchProjectsMock).toHaveBeenCalledTimes(1);
    });

    it('devrait avoir des caches séparés pour prod et devMode', async () => {
      const prodResult = await service.findAll(false);
      const devResult = await service.findAll(true);

      expect(prodResult).toEqual([mockProject]);
      expect(devResult).toEqual([mockDevProject]);
      expect(fetchProjectsMock).toHaveBeenCalledTimes(2);
      expect(fetchProjectsMock).toHaveBeenCalledWith(false);
      expect(fetchProjectsMock).toHaveBeenCalledWith(true);
    });
  });

  describe('findOne', () => {
    it('devrait retourner un projet par son ID', async () => {
      const result = await service.findOne('rec1');
      expect(result).toEqual(mockProject);
    });

    it("devrait retourner null si le projet n'existe pas", async () => {
      const result = await service.findOne('inconnu');
      expect(result).toBeNull();
    });
  });

  describe('invalidateCache', () => {
    it('devrait forcer un nouvel appel à Strapi après invalidation', async () => {
      await service.findAll();
      service.invalidateCache();
      await service.findAll();

      expect(fetchProjectsMock).toHaveBeenCalledTimes(2);
    });

    it('devrait invalider à la fois le cache prod et dev', async () => {
      await service.findAll(false);
      await service.findAll(true);
      service.invalidateCache();
      await service.findAll(false);
      await service.findAll(true);

      expect(fetchProjectsMock).toHaveBeenCalledTimes(4);
    });

    it('ne remet pas en cache un résultat commencé avant l’invalidation', async () => {
      let resolveFirstFetch: ((projects: Project[]) => void) | undefined;
      const staleProject = { ...mockProject, title: 'Projet périmé' };
      const freshProject = { ...mockProject, title: 'Projet à jour' };
      fetchProjectsMock
        .mockReset()
        .mockImplementationOnce(
          () =>
            new Promise<Project[]>((resolve) => {
              resolveFirstFetch = resolve;
            }),
        )
        .mockResolvedValueOnce([freshProject]);

      const pendingProjects = service.findAll();
      service.invalidateCache();
      resolveFirstFetch?.([staleProject]);

      await expect(pendingProjects).resolves.toEqual([freshProject]);
      expect(fetchProjectsMock).toHaveBeenCalledTimes(2);
      await expect(service.findAll()).resolves.toEqual([freshProject]);
      expect(fetchProjectsMock).toHaveBeenCalledTimes(2);
    });
  });
});
