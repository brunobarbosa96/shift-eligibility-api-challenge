import { PrismaService } from '@/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { FacilityRequirementRepository } from './repositories/facility-requirement.repository';
import { FacilityRepository } from './repositories/facility.repository';
import { ShiftRepository } from './repositories/shift.repository';
import { WorkerRepository } from './repositories/worker.repository';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';

@Module({
  imports: [HttpModule],
  controllers: [ShiftController],
  providers: [
    ShiftService,
    PrismaService,
    ShiftRepository,
    WorkerRepository,
    FacilityRepository,
    FacilityRequirementRepository,
  ],
})
export class ShiftEligibilityModule {}
