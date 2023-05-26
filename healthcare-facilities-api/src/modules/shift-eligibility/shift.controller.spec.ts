import { PrismaService } from '@/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { GroupedShiftsResponse } from './interfaces/grouped-shifts-response.interface';
import { PaginationResponse } from './interfaces/pagination-response.interface';
import { FacilityRequirementRepository } from './repositories/facility-requirement.repository';
import { FacilityRepository } from './repositories/facility.repository';
import { ShiftRepository } from './repositories/shift.repository';
import { WorkerRepository } from './repositories/worker.repository';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';

describe('ShiftController', () => {
  let shiftController: ShiftController;
  let shiftService: ShiftService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftController],
      providers: [
        PrismaService,
        ShiftService,
        ShiftRepository,
        WorkerRepository,
        FacilityRepository,
        FacilityRequirementRepository,
      ],
    }).compile();

    shiftController = module.get<ShiftController>(ShiftController);
    shiftService = module.get<ShiftService>(ShiftService);

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(shiftController).toBeDefined();
  });

  describe('findAllAvailable', () => {
    it('should call shiftService.findAllAvailableByFacilityAndWorker with the correct parameters', async () => {
      // Arrange
      const facilityId = 1;
      const workerId = 1;
      const startDate = '2023-01-01';
      const endDate = '2023-01-07';
      const page = 1;
      const pageSize = 10;
      const queryMock = {
        facilityId,
        workerId,
        startDate,
        endDate,
        page,
        pageSize,
      };

      const mockResult: PaginationResponse<GroupedShiftsResponse[]> = {
        totalCount: 5,
        totalPages: 1,
        pageNumber: 1,
        nextPage: 2,
        data: [{ start: '2023-01-01', end: '2023-01-01', shifts: [] }],
      };

      jest
        .spyOn(shiftService, 'findAllAvailableByFacilityAndWorker')
        .mockResolvedValue(mockResult);

      // Act
      const response = await request(app.getHttpServer())
        .get('/shifts/available')
        .query(queryMock);

      // Assert
      expect(
        shiftService.findAllAvailableByFacilityAndWorker,
      ).toHaveBeenCalledWith(
        String(facilityId),
        String(workerId),
        startDate,
        endDate,
        {
          page: String(page),
          pageSize: String(pageSize),
        },
      );
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
    });
  });
});
