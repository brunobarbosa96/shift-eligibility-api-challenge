import { PrismaService } from '@/prisma.service';
import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { FacilityRequirement } from '@prisma/client';
import { FacilityRequirementRepository } from './facility-requirement.repository';

describe('FacilityRequirementRepository', () => {
  let facilityRequirementRepository: FacilityRequirementRepository;
  let prismaService: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        FacilityRequirementRepository,
        { provide: PrismaService, useValue: createMock<PrismaService>() },
      ],
    }).compile();

    await module.init();

    facilityRequirementRepository = module.get<FacilityRequirementRepository>(
      FacilityRequirementRepository,
    );
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('findMissingRequirementsForWorker', () => {
    it('should return the missing requirements for a worker in a facility', async () => {
      // Arrange
      const facilityId = 1;
      const workerId = 1;
      const expectedMissingRequirements: FacilityRequirement[] = [
        {
          id: 1,
          facility_id: 1,
          document_id: 1,
        },
        {
          id: 2,
          facility_id: 1,
          document_id: 2,
        },
      ];

      const subQueryResult = [{ document_id: 3 }, { document_id: 4 }];

      prismaService.documentWorker.findMany = jest
        .fn()
        .mockResolvedValue(subQueryResult);

      prismaService.facilityRequirement.findMany = jest
        .fn()
        .mockResolvedValue(expectedMissingRequirements);

      // Act
      const result =
        await facilityRequirementRepository.findMissingRequirementsForWorker(
          facilityId,
          workerId,
        );

      // Assert
      expect(result).toEqual(expectedMissingRequirements);
      expect(prismaService.documentWorker.findMany).toHaveBeenCalledWith({
        where: { worker_id: workerId },
        select: { document_id: true },
      });
      expect(prismaService.facilityRequirement.findMany).toHaveBeenCalledWith({
        take: 1,
        where: {
          facility_id: facilityId,
          document_id: {
            notIn: subQueryResult.map((item) => item.document_id),
          },
          document: {
            is_active: true,
          },
        },
      });
    });

    it('should return an empty array when there are no missing requirements for a worker in a facility', async () => {
      // Arrange
      const facilityId = 1;
      const workerId = 1;
      const subQueryResult: any[] = [];

      prismaService.documentWorker.findMany = jest
        .fn()
        .mockResolvedValue(subQueryResult);

      prismaService.facilityRequirement.findMany = jest
        .fn()
        .mockResolvedValue([]);

      // Act
      const result =
        await facilityRequirementRepository.findMissingRequirementsForWorker(
          facilityId,
          workerId,
        );

      // Assert
      expect(result).toEqual([]);
      expect(prismaService.documentWorker.findMany).toHaveBeenCalledWith({
        where: { worker_id: workerId },
        select: { document_id: true },
      });
      expect(prismaService.facilityRequirement.findMany).toHaveBeenCalledWith({
        take: 1,
        where: {
          facility_id: facilityId,
          document_id: {
            notIn: subQueryResult.map((item) => item.document_id),
          },
          document: {
            is_active: true,
          },
        },
      });
    });
  });
});
