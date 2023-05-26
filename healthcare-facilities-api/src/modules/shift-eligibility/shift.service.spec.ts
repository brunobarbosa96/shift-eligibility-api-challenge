import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Facility,
  FacilityRequirement,
  Profession,
  Shift,
  Worker,
} from '@prisma/client';
import { PaginationParamsDTO } from './dtos/pagination.dto';
import { GroupedShiftsResponse } from './interfaces/grouped-shifts-response.interface';
import { PaginationResponse } from './interfaces/pagination-response.interface';
import { FacilityRequirementRepository } from './repositories/facility-requirement.repository';
import { FacilityRepository } from './repositories/facility.repository';
import { ShiftRepository } from './repositories/shift.repository';
import { WorkerRepository } from './repositories/worker.repository';
import { ShiftService } from './shift.service';

describe('ShiftService', () => {
  let shiftService: ShiftService;
  let shiftRepository: ShiftRepository;
  let workerRepository: WorkerRepository;
  let facilityRepository: FacilityRepository;
  let facilityRequirementRepository: FacilityRequirementRepository;

  const mockShiftRepository = {
    findAndGroupAllAvailableByFacility: jest.fn(),
    findClaimedShiftsByWorker: jest.fn(),
    findAllAvailableMatchingShift: jest.fn(),
  };

  const mockWorkerRepository = {
    findById: jest.fn(),
  };

  const mockFacilityRepository = {
    findById: jest.fn(),
  };

  const mockFacilityRequirementRepository = {
    findMissingRequirementsForWorker: jest.fn(),
  };

  const facilityId = 1;
  const workerId = 1;
  const startDate = '2023-01-01';
  const endDate = '2023-01-10';
  const pagination: PaginationParamsDTO = {
    page: 1,
    pageSize: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftService,
        {
          provide: ShiftRepository,
          useValue: mockShiftRepository,
        },
        {
          provide: WorkerRepository,
          useValue: mockWorkerRepository,
        },
        {
          provide: FacilityRepository,
          useValue: mockFacilityRepository,
        },
        {
          provide: FacilityRequirementRepository,
          useValue: mockFacilityRequirementRepository,
        },
      ],
    }).compile();

    shiftService = module.get<ShiftService>(ShiftService);
    shiftRepository = module.get<ShiftRepository>(ShiftRepository);
    workerRepository = module.get<WorkerRepository>(WorkerRepository);
    facilityRepository = module.get<FacilityRepository>(FacilityRepository);
    facilityRequirementRepository = module.get<FacilityRequirementRepository>(
      FacilityRequirementRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllAvailableByFacilityAndWorker', () => {
    const mockWorker = { id: 1, is_active: true, profession: 'CNA' };
    const mockFacility = { id: 1, is_active: true };
    const mockMissingFacilityRequirements: FacilityRequirement[] = [];
    const mockClaimedAvailableShifts = [1, 2];

    beforeEach(() => {
      jest
        .spyOn(workerRepository, 'findById')
        .mockResolvedValue(mockWorker as Worker | null);

      jest
        .spyOn(facilityRepository, 'findById')
        .mockResolvedValue(mockFacility as Facility | null);

      jest
        .spyOn(
          facilityRequirementRepository,
          'findMissingRequirementsForWorker',
        )
        .mockResolvedValue(mockMissingFacilityRequirements);

      jest
        .spyOn(shiftService, 'findMatchingShifts')
        .mockResolvedValue(mockClaimedAvailableShifts);
    });

    it('should throw NotFoundException if the worker is not found', async () => {
      // Arrange
      jest.spyOn(workerRepository, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(
        shiftService.findAllAvailableByFacilityAndWorker(
          facilityId,
          workerId,
          startDate,
          endDate,
          pagination,
        ),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should throw NotFoundException if the facility is not found', async () => {
      // Arrange
      jest.spyOn(facilityRepository, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(
        shiftService.findAllAvailableByFacilityAndWorker(
          facilityId,
          workerId,
          startDate,
          endDate,
          pagination,
        ),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should throw BadRequestException if the worker has missing facility requirements', async () => {
      // Arrange
      const mockMissingFacilityRequirements: FacilityRequirement[] = [
        { id: 1, document_id: 1, facility_id: 1 },
        { id: 2, document_id: 2, facility_id: 1 },
      ];

      jest
        .spyOn(
          facilityRequirementRepository,
          'findMissingRequirementsForWorker',
        )
        .mockResolvedValue(mockMissingFacilityRequirements);

      // Act & Assert
      await expect(
        shiftService.findAllAvailableByFacilityAndWorker(
          facilityId,
          workerId,
          startDate,
          endDate,
          pagination,
        ),
      ).rejects.toThrowError(BadRequestException);
    });

    it('should call shiftRepository.findAndGroupAllAvailableByFacility with the correct parameters', async () => {
      // Arrange
      const mockResult: PaginationResponse<GroupedShiftsResponse[]> = {
        totalCount: 5,
        totalPages: 1,
        pageNumber: 1,
        nextPage: 2,
        data: [{ start: '2023-01-01', end: '2023-01-01', shifts: [] }],
      };

      jest
        .spyOn(shiftRepository, 'findAndGroupAllAvailableByFacility')
        .mockResolvedValue(mockResult);

      // Act
      await shiftService.findAllAvailableByFacilityAndWorker(
        facilityId,
        workerId,
        startDate,
        endDate,
        pagination,
      );

      // Assert
      expect(
        shiftRepository.findAndGroupAllAvailableByFacility,
      ).toHaveBeenCalledWith(
        facilityId,
        startDate,
        endDate,
        mockWorker.profession,
        pagination,
        mockClaimedAvailableShifts,
      );
    });

    it('should return the result of shiftRepository.findAndGroupAllAvailableByFacility', async () => {
      // Arrange
      const mockResult = {
        totalCount: 5,
        totalPages: 1,
        pageNumber: 1,
        nextPage: 2,
        data: [
          { start: '2023-01-01', end: '2023-01-01', shifts: [] as Shift[] },
        ],
      };

      jest
        .spyOn(shiftRepository, 'findAndGroupAllAvailableByFacility')
        .mockResolvedValue(mockResult);

      // Act
      const result = await shiftService.findAllAvailableByFacilityAndWorker(
        facilityId,
        workerId,
        startDate,
        endDate,
        pagination,
      );

      // Assert
      expect(result).toEqual(mockResult);
    });
  });

  describe('findMatchingShifts', () => {
    it('should call shiftRepository.findClaimedShiftsByWorker with the correct parameters', async () => {
      // Arrange
      const mockClaimedShifts: Shift[] = [
        {
          id: 1,
          start: new Date('2023-01-01'),
          end: new Date('2023-01-02'),
          profession: Profession.CNA,
          is_deleted: false,
          facility_id: 1,
          worker_id: 1,
        },
      ];

      jest
        .spyOn(shiftRepository, 'findClaimedShiftsByWorker')
        .mockResolvedValue(mockClaimedShifts);

      // Act
      await shiftService.findMatchingShifts(
        facilityId,
        workerId,
        startDate,
        endDate,
      );

      // Assert
      expect(shiftRepository.findClaimedShiftsByWorker).toHaveBeenCalledWith(
        workerId,
        startDate,
        endDate,
      );
    });

    it('should call shiftRepository.findAllAvailableMatchingShift for each claimed shift', async () => {
      // Arrange
      const mockClaimedShifts: Shift[] = [
        {
          id: 1,
          start: new Date('2023-01-01'),
          end: new Date('2023-01-02'),
          profession: Profession.CNA,
          is_deleted: false,
          facility_id: 1,
          worker_id: 1,
        },
        {
          id: 2,
          start: new Date('2023-01-01'),
          end: new Date('2023-01-02'),
          profession: Profession.CNA,
          is_deleted: false,
          facility_id: 1,
          worker_id: 1,
        },
      ];

      jest
        .spyOn(shiftRepository, 'findClaimedShiftsByWorker')
        .mockResolvedValue(mockClaimedShifts);

      jest.spyOn(shiftRepository, 'findAllAvailableMatchingShift');

      // Act
      await shiftService.findMatchingShifts(
        facilityId,
        workerId,
        startDate,
        endDate,
      );

      // Assert
      expect(
        shiftRepository.findAllAvailableMatchingShift,
      ).toHaveBeenCalledTimes(mockClaimedShifts.length);
    });

    it('should return an array of matching shift IDs', async () => {
      // Arrange
      const mockClaimedShifts: Shift[] = [
        {
          id: 1,
          start: new Date('2023-01-01'),
          end: new Date('2023-01-02'),
          profession: Profession.CNA,
          is_deleted: false,
          facility_id: 1,
          worker_id: 1,
        },
      ];

      const mockAvailableMatchingShifts = [
        { id: 3, start: '2023-01-01', end: '2023-01-02' },
        { id: 4, start: '2023-01-03', end: '2023-01-04' },
        { id: 5, start: '2023-01-05', end: '2023-01-06' },
      ];

      jest
        .spyOn(shiftRepository, 'findClaimedShiftsByWorker')
        .mockResolvedValue(mockClaimedShifts);

      jest
        .spyOn(shiftRepository, 'findAllAvailableMatchingShift')
        .mockResolvedValue(mockAvailableMatchingShifts);

      // Act
      const result = await shiftService.findMatchingShifts(
        facilityId,
        workerId,
        startDate,
        endDate,
      );

      // Assert
      expect(result).toEqual([3, 4, 5]);
    });

    it('should return an empty array if there are no claimed shifts', async () => {
      // Arrange
      const mockClaimedShifts: Shift[] = [];

      jest
        .spyOn(shiftRepository, 'findClaimedShiftsByWorker')
        .mockResolvedValue(mockClaimedShifts);

      // Act
      const result = await shiftService.findMatchingShifts(
        facilityId,
        workerId,
        startDate,
        endDate,
      );

      // Assert
      expect(result).toEqual([]);
    });
  });
});
