import { PrismaService } from '@/prisma.service';
import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Profession, Shift } from '@prisma/client';
import { parseISO } from 'date-fns';
import { GroupedShiftsResponse } from '../interfaces/grouped-shifts-response.interface';
import { ShiftRepository } from './shift.repository';

describe('ShiftRepository', () => {
  let shiftRepository: ShiftRepository;
  let prismaService: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        ShiftRepository,
        { provide: PrismaService, useValue: createMock<PrismaService>() },
      ],
    }).compile();

    await module.init();

    shiftRepository = module.get<ShiftRepository>(ShiftRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('findClaimedShiftsByWorker', () => {
    it('should return the claimed shifts for a worker within a specific date range', async () => {
      // Arrange
      const workerId = 1;
      const startDate = '2022-01-01';
      const endDate = '2022-01-31';
      const expectedShifts: Shift[] = [
        {
          id: 1,
          facility_id: 1,
          worker_id: workerId,
          start: parseISO('2023-02-01T20:00:00.001Z'),
          end: parseISO('2023-02-01T20:00:00.001Z'),
          is_deleted: false,
          profession: Profession.CNA,
        },
        {
          id: 2,
          facility_id: 1,
          worker_id: workerId,
          start: parseISO('2023-02-01T20:00:00.231Z'),
          end: parseISO('2023-02-01T20:00:00.231Z'),
          is_deleted: false,
          profession: Profession.LVN,
        },
      ];

      prismaService.shift.findMany = jest
        .fn()
        .mockResolvedValue(expectedShifts);

      // Act
      const result = await shiftRepository.findClaimedShiftsByWorker(
        workerId,
        startDate,
        endDate,
      );

      // Assert
      expect(result).toEqual(expectedShifts);
      expect(prismaService.shift.findMany).toHaveBeenCalledWith({
        where: {
          worker_id: workerId,
          is_deleted: false,
          start: { gte: parseISO(startDate) },
          end: { lte: parseISO(endDate) },
        },
      });
    });

    it('should return an empty array when no claimed shifts are found for a worker', async () => {
      // Arrange
      const workerId = 1;
      const startDate = '2022-01-01';
      const endDate = '2022-01-31';

      prismaService.shift.findMany = jest.fn().mockResolvedValue([]);

      // Act
      const result = await shiftRepository.findClaimedShiftsByWorker(
        workerId,
        startDate,
        endDate,
      );

      // Assert
      expect(result).toEqual([]);
      expect(prismaService.shift.findMany).toHaveBeenCalledWith({
        where: {
          worker_id: workerId,
          is_deleted: false,
          start: { gte: parseISO(startDate) },
          end: { lte: parseISO(endDate) },
        },
      });
    });
  });

  describe('findAllAvailableMatchingShift', () => {
    it('should return all available matching shifts for a facility within a specific date range', async () => {
      // Arrange
      const facilityId = 1;
      const startDate = new Date('2022-01-01');
      const endDate = new Date('2022-01-31');
      const expectedShifts: Shift[] = [
        {
          id: 1,
          facility_id: facilityId,
          worker_id: null,
          start: new Date('2023-02-01T20:00:00.001Z'),
          end: new Date('2023-02-02T01:00:00.231Z'),
          is_deleted: false,
          profession: Profession.CNA,
        },
        {
          id: 2,
          facility_id: facilityId,
          worker_id: null,
          start: new Date('2023-02-01T20:00:00.231Z'),
          end: new Date('2023-02-01T20:00:00.231Z'),
          is_deleted: false,
          profession: Profession.RN,
        },
      ];

      prismaService.shift.findMany = jest
        .fn()
        .mockResolvedValue(expectedShifts);

      // Act
      const result = await shiftRepository.findAllAvailableMatchingShift(
        facilityId,
        startDate,
        endDate,
      );

      // Assert
      expect(result).toEqual(expectedShifts);
      expect(prismaService.shift.findMany).toHaveBeenCalledWith({
        select: { id: true },
        skip: 0,
        where: {
          facility_id: facilityId,
          worker: null,
          is_deleted: false,
          OR: [
            {
              AND: [
                {
                  start: { lte: startDate },
                },
                {
                  start: { gte: endDate },
                },
              ],
            },
            {
              AND: [
                {
                  start: { gte: startDate },
                },
                {
                  start: { lte: endDate },
                },
              ],
            },
          ],
        },
      });
    });

    it('should return an empty array when no available matching shifts are found for a facility', async () => {
      // Arrange
      const facilityId = 1;
      const startDate = new Date('2022-01-01');
      const endDate = new Date('2022-01-31');

      prismaService.shift.findMany = jest.fn().mockResolvedValue([]);

      // Act
      const result = await shiftRepository.findAllAvailableMatchingShift(
        facilityId,
        startDate,
        endDate,
      );

      // Assert
      expect(result).toEqual([]);
      expect(prismaService.shift.findMany).toHaveBeenCalledWith({
        select: { id: true },
        skip: 0,
        where: {
          facility_id: facilityId,
          worker: null,
          is_deleted: false,
          OR: [
            {
              AND: [
                {
                  start: { lte: startDate },
                },
                {
                  start: { gte: endDate },
                },
              ],
            },
            {
              AND: [
                {
                  start: { gte: startDate },
                },
                {
                  start: { lte: endDate },
                },
              ],
            },
          ],
        },
      });
    });
  });

  describe('findAndGroupAllAvailableByFacility', () => {
    it('should return and group all available shifts by facility within a specific date range', async () => {
      // Arrange
      const facilityId = 1;
      const startDate = '2023-02-01T17:35:22.886Z';
      const endDate = '2023-02-17T17:35:22.886Z';
      const profession: Profession = Profession.RN;
      const page = 1;
      const pageSize = 10;
      const claimedShifts: Shift['id'][] = [1, 2];

      const expectedShifts: Shift[] = [
        {
          id: 1,
          facility_id: facilityId,
          worker_id: null,
          start: new Date('2023-02-01T20:00:00.001Z'),
          end: new Date('2023-02-01T01:00:00.231Z'),
          is_deleted: false,
          profession: Profession.RN,
        },
        {
          id: 2,
          facility_id: facilityId,
          worker_id: null,
          start: new Date('2023-02-01T20:00:00.231Z'),
          end: new Date('2023-02-02T01:00:00.231Z'),
          is_deleted: false,
          profession: Profession.RN,
        },
      ];

      const expectedGroupedShifts: GroupedShiftsResponse[] = [
        {
          start: '2023-02-01',
          end: '2023-02-01',
          shifts: [expectedShifts[0]],
        },
        {
          start: '2023-02-01',
          end: '2023-02-02',
          shifts: [expectedShifts[1]],
        },
      ];

      prismaService.shift.findMany = jest
        .fn()
        .mockResolvedValue(expectedShifts);
      prismaService.shift.count = jest.fn().mockResolvedValue(2);

      // Act
      const result = await shiftRepository.findAndGroupAllAvailableByFacility(
        facilityId,
        startDate,
        endDate,
        profession,
        { page, pageSize },
        claimedShifts,
      );

      // Assert
      expect(result.totalCount).toBe(2);
      expect(result.totalPages).toBe(1);
      expect(result.pageNumber).toBe(1);
      expect(result.nextPage).toBe(2);
      expect(result.data).toEqual(expectedGroupedShifts);
      expect(prismaService.shift.findMany).toHaveBeenCalledWith({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where: {
          facility_id: facilityId,
          profession,
          worker: null,
          is_deleted: false,
          start: { gte: parseISO(startDate) },
          end: { lte: parseISO(endDate) },
          id: {
            notIn: claimedShifts,
          },
        },
        orderBy: [{ start: 'asc' }, { end: 'asc' }],
      });
      expect(prismaService.shift.count).toHaveBeenCalledWith({
        where: {
          facility_id: facilityId,
          profession,
          worker: null,
          is_deleted: false,
          start: { gte: parseISO(startDate) },
          end: { lte: parseISO(endDate) },
          id: {
            notIn: claimedShifts,
          },
        },
      });
    });

    it('should return an empty array when no available shifts are found for a facility', async () => {
      // Arrange
      const facilityId = 1;
      const startDate = '2022-01-01';
      const endDate = '2022-01-31';
      const profession: Profession = 'RN';
      const page = 1;
      const pageSize = 10;

      prismaService.shift.findMany = jest.fn().mockResolvedValue([]);
      prismaService.shift.count = jest.fn().mockResolvedValue(0);

      // Act
      const result = await shiftRepository.findAndGroupAllAvailableByFacility(
        facilityId,
        startDate,
        endDate,
        profession,
        { page, pageSize },
      );

      // Assert
      expect(result.totalCount).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.pageNumber).toBe(1);
      expect(result.nextPage).toBe(2);
      expect(result.data).toEqual([]);
      expect(prismaService.shift.findMany).toHaveBeenCalledWith({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where: {
          facility_id: facilityId,
          profession,
          worker: null,
          is_deleted: false,
          start: { gte: parseISO(startDate) },
          end: { lte: parseISO(endDate) },
        },
        orderBy: [{ start: 'asc' }, { end: 'asc' }],
      });
      expect(prismaService.shift.count).toHaveBeenCalledWith({
        where: {
          facility_id: facilityId,
          profession,
          worker: null,
          is_deleted: false,
          start: { gte: parseISO(startDate) },
          end: { lte: parseISO(endDate) },
        },
      });
    });
  });
});
