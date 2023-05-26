import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { Worker } from '@prisma/client';

@Injectable()
export class WorkerRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: Worker['id']): Promise<Worker> {
    return await this.prisma.worker.findUnique({
      where: {
        id,
      },
    });
  }
}
