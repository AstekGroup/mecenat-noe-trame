import { Test, TestingModule } from '@nestjs/testing';
import { Natura2000Controller } from './natura2000.controller';
import { Natura2000Service } from './natura2000.service';

describe('Natura2000Controller', () => {
  let controller: Natura2000Controller;
  let service: Natura2000Service;

  const mockGeoJSON = {
    type: 'FeatureCollection',
    features: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Natura2000Controller],
      providers: [
        {
          provide: Natura2000Service,
          useValue: {
            getGeoJSON: jest.fn().mockResolvedValue(mockGeoJSON),
          },
        },
      ],
    }).compile();

    controller = module.get<Natura2000Controller>(Natura2000Controller);
    service = module.get<Natura2000Service>(Natura2000Service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getGeoJSON', () => {
    it('should call natura2000Service.getGeoJSON() and return its result', async () => {
      const result = await controller.getGeoJSON();

      expect(result).toEqual(mockGeoJSON);
      expect(service.getGeoJSON).toHaveBeenCalled();
    });
  });
});
