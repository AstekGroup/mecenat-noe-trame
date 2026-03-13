import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { NotFoundException } from '@nestjs/common';
import type { Project } from '@make-map/types';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

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
    type: 'renaturation',
    owner: 'Porteur Test',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockProject]),
            findOne: jest.fn().mockImplementation((id) => {
              if (id === 'rec1') return Promise.resolve(mockProject);
              return Promise.resolve(null);
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  it('devrait être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('devrait retourner un tableau de projets', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockProject]);
      expect(service.findAll).toHaveBeenCalledWith(false);
    });

    it('devrait passer devMode=true si précisé dans la query', async () => {
      await controller.findAll('true');
      expect(service.findAll).toHaveBeenCalledWith(true);
    });
  });

  describe('findOne', () => {
    it('devrait retourner un projet par son ID', async () => {
      const result = await controller.findOne('rec1');
      expect(result).toEqual(mockProject);
    });

    it('devrait lancer une NotFoundException si le projet n\'est pas trouvé', async () => {
      await expect(controller.findOne('inconnu')).rejects.toThrow(NotFoundException);
    });
  });
});
