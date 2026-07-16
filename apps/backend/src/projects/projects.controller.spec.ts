import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Project } from '@make-map/types';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let cacheSecret: string | undefined;
  let findAllMock: jest.Mock;
  let invalidateCacheMock: jest.Mock;

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
    cacheSecret = 'test-cache-secret';
    findAllMock = jest.fn().mockResolvedValue([mockProject]);
    invalidateCacheMock = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: {
            findAll: findAllMock,
            findOne: jest.fn().mockImplementation((id) => {
              if (id === 'rec1') return Promise.resolve(mockProject);
              return Promise.resolve(null);
            }),
            invalidateCache: invalidateCacheMock,
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => cacheSecret),
          },
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  it('devrait être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('devrait retourner un tableau de projets', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockProject]);
      expect(findAllMock).toHaveBeenCalledWith(false);
    });

    it('devrait passer devMode=true si précisé dans la query', async () => {
      await controller.findAll('true');
      expect(findAllMock).toHaveBeenCalledWith(true);
    });
  });

  describe('findOne', () => {
    it('devrait retourner un projet par son ID', async () => {
      const result = await controller.findOne('rec1');
      expect(result).toEqual(mockProject);
    });

    it("devrait lancer une NotFoundException si le projet n'est pas trouvé", async () => {
      await expect(controller.findOne('inconnu')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('invalidateCache', () => {
    it('invalide le cache avec le secret serveur attendu', () => {
      controller.invalidateCache('Bearer test-cache-secret');

      expect(invalidateCacheMock).toHaveBeenCalledTimes(1);
    });

    it('refuse un secret absent ou invalide', () => {
      expect(() => controller.invalidateCache()).toThrow(
        'Secret d’invalidation invalide',
      );
      expect(() => controller.invalidateCache('Bearer incorrect')).toThrow(
        'Secret d’invalidation invalide',
      );
      expect(invalidateCacheMock).not.toHaveBeenCalled();
    });

    it('reste fermée si le secret serveur n’est pas configuré', () => {
      cacheSecret = undefined;

      expect(() =>
        controller.invalidateCache('Bearer test-cache-secret'),
      ).toThrow('Secret d’invalidation invalide');
    });
  });
});
