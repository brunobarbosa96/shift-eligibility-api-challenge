import { PrismaService } from '@/prisma.service';
import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Facility } from '@prisma/client';
import { FacilityRepository } from './facility.repository';

describe('FacilityRepository', () => {
  let facilityRepository: FacilityRepository;
  let prismaService: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        FacilityRepository,
        { provide: PrismaService, useValue: createMock<PrismaService>() },
      ],
    }).compile();

    await module.init();

    facilityRepository = module.get<FacilityRepository>(FacilityRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('findById', () => {
    it('should return a facility when a valid ID is provided', async () => {
      // Arrange
      const facilityId = 1;
      const expectedFacility: Facility = {
        id: 1,
        name: 'Example Facility',
        is_active: true,
      };

      prismaService.facility.findUnique = jest
        .fn()
        .mockResolvedValueOnce(expectedFacility);

      // Act
      const result = await facilityRepository.findById(facilityId);

      // Assert
      expect(result).toEqual(expectedFacility);
      expect(prismaService.facility.findUnique).toHaveBeenCalledWith({
        where: { id: facilityId },
      });
    });

    it('should return null when an invalid ID is provided', async () => {
      // Arrange
      const facilityId = 999;

      prismaService.facility.findUnique = jest.fn().mockResolvedValueOnce(null);

      // Act
      const result = await facilityRepository.findById(facilityId);

      // Assert
      expect(result).toBeNull();
      expect(prismaService.facility.findUnique).toHaveBeenCalledWith({
        where: { id: facilityId },
      });
    });
  });
});
