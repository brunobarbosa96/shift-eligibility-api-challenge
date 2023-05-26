import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { Facility } from '@prisma/client';

@Injectable()
export class FacilityRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: Facility['id']): Promise<Facility> {
    return await this.prisma.facility.findUnique({
      where: {
        id,
      },
    });
  }
}
