import { PrismaService } from '@/prisma.service';
import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Profession, Worker } from '@prisma/client';
import { WorkerRepository } from './worker.repository';

describe('WorkerRepository', () => {
  let workerRepository: WorkerRepository;
  let prismaService: PrismaService;

  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        WorkerRepository,
        { provide: PrismaService, useValue: createMock<PrismaService>() },
      ],
    }).compile();

    await module.init();

    workerRepository = module.get<WorkerRepository>(WorkerRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('findById', () => {
    it('should return a worker when a valid ID is provided', async () => {
      // Arrange
      const workerId = 1;
      const expectedWorker: Worker = {
        id: 1,
        name: 'John Doe',
        is_active: true,
        profession: Profession.CNA,
      };

      prismaService.worker.findUnique = jest
        .fn()
        .mockResolvedValueOnce(expectedWorker);

      // Act
      const result = await workerRepository.findById(workerId);

      // Assert
      expect(result).toEqual(expectedWorker);
      expect(prismaService.worker.findUnique).toHaveBeenCalledWith({
        where: { id: workerId },
      });
    });

    it('should return null when an invalid ID is provided', async () => {
      // Arrange
      const workerId = 999;

      prismaService.worker.findUnique = jest.fn().mockResolvedValueOnce(null);

      // Act
      const result = await workerRepository.findById(workerId);

      // Assert
      expect(result).toBeNull();
      expect(prismaService.worker.findUnique).toHaveBeenCalledWith({
        where: { id: workerId },
      });
    });
  });
});
