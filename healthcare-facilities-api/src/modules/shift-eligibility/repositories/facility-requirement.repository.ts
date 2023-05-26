import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { Facility, FacilityRequirement, Worker } from '@prisma/client';

@Injectable()
export class FacilityRequirementRepository {
  constructor(private prisma: PrismaService) {}

  async findMissingRequirementsForWorker(
    facilityId: Facility['id'],
    workerId: Worker['id'],
  ): Promise<FacilityRequirement[]> {
    const subQuery = this.prisma.documentWorker.findMany({
      where: {
        worker_id: workerId,
      },
      select: {
        document_id: true,
      },
    });

    return await this.prisma.facilityRequirement.findMany({
      take: 1,
      where: {
        facility_id: facilityId,
        document_id: {
          notIn: await subQuery.then((data) =>
            data.map((item) => item.document_id),
          ),
        },
        document: {
          is_active: true,
        },
      },
    });
  }
}
