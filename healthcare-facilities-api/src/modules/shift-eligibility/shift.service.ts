import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Facility, Worker } from '@prisma/client';
import { PaginationParamsDTO } from './dtos/pagination.dto';
import { FacilityRequirementRepository } from './repositories/facility-requirement.repository';
import { FacilityRepository } from './repositories/facility.repository';
import { ShiftRepository } from './repositories/shift.repository';
import { WorkerRepository } from './repositories/worker.repository';

@Injectable()
export class ShiftService {
  @Inject(ShiftRepository) shiftRepository: ShiftRepository;
  @Inject(WorkerRepository) workerRepository: WorkerRepository;
  @Inject(FacilityRepository) facilityRepository: FacilityRepository;
  @Inject(FacilityRequirementRepository)
  facilityRequirementRepository: FacilityRequirementRepository;

  async findAllAvailableByFacilityAndWorker(
    facilityId: Facility['id'],
    workerId: Worker['id'],
    startDate: string,
    endDate: string,
    pagination: PaginationParamsDTO,
  ) {
    // The Worker must be active.
    const worker = await this.workerRepository.findById(workerId);
    if (!worker?.is_active) {
      throw new NotFoundException(
        'Worker not found. Please check the provided identifier and try again.',
      );
    }

    // A Facility must be active
    const facility = await this.facilityRepository.findById(facilityId);
    if (!facility?.is_active) {
      throw new NotFoundException(
        'Facility not found. Please check the provided identifier and try again.',
      );
    }

    // The Worker must have all the documents required by the facilities.
    const missingFacilities =
      await this.facilityRequirementRepository.findMissingRequirementsForWorker(
        facilityId,
        workerId,
      );
    if (missingFacilities.length) {
      throw new BadRequestException(
        'Worker does not meet all the requirements for this facility.',
      );
    }

    // The Worker must not have claimed a shift that collides with the shift they are eligible for.
    const claimedAvailableShifts = await this.findMatchingShifts(
      facilityId,
      workerId,
      startDate,
      endDate,
    );

    const result =
      await this.shiftRepository.findAndGroupAllAvailableByFacility(
        facilityId,
        startDate,
        endDate,
        worker.profession,
        pagination,
        claimedAvailableShifts,
      );

    return result;
  }

  async findMatchingShifts(
    facilityId: Facility['id'],
    workerId: Worker['id'],
    startDate: string,
    endDate: string,
  ) {
    const claimedShifts = await this.shiftRepository.findClaimedShiftsByWorker(
      workerId,
      startDate,
      endDate,
    );

    if (claimedShifts.length) {
      const promises = claimedShifts.map(async (shift) => {
        const availableMatchingShifts =
          await this.shiftRepository.findAllAvailableMatchingShift(
            facilityId,
            shift.start,
            shift.end,
          );

        return availableMatchingShifts?.map(({ id }) => id) || [];
      });

      const matchingShifts = await Promise.all(promises);

      return matchingShifts.flatMap((item) => item);
    }

    return [];
  }
}
