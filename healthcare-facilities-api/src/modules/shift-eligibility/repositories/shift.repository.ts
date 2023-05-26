import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { Facility, Profession, Shift, Worker } from '@prisma/client';
import { parseISO } from 'date-fns';
import { format, utcToZonedTime } from 'date-fns-tz';
import { groupBy } from 'lodash';
import { PaginationParamsDTO } from '../dtos/pagination.dto';
import { GroupedShiftsResponse } from '../interfaces/grouped-shifts-response.interface';
import { PaginationResponse } from '../interfaces/pagination-response.interface';

@Injectable()
export class ShiftRepository {
  constructor(private prisma: PrismaService) {}

  async findClaimedShiftsByWorker(
    workerId: Worker['id'],
    startDate: string,
    endDate: string,
  ): Promise<Shift[]> {
    return await this.prisma.shift.findMany({
      where: {
        worker_id: workerId,
        is_deleted: false,
        start: {
          gte: parseISO(startDate),
        },
        end: {
          lte: parseISO(endDate),
        },
      },
    });
  }

  async findAllAvailableMatchingShift(
    facilityId: Facility['id'],
    startDate: Date,
    endDate: Date,
  ) {
    return await this.prisma.shift.findMany({
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
                start: {
                  lte: startDate,
                },
              },
              {
                start: {
                  gte: endDate,
                },
              },
            ],
          },
          {
            AND: [
              {
                start: {
                  gte: startDate,
                },
              },
              {
                start: {
                  lte: endDate,
                },
              },
            ],
          },
        ],
      },
    });
  }

  async findAndGroupAllAvailableByFacility(
    facilityId: Facility['id'],
    startDate: string,
    endDate: string,
    profession: Profession,
    { page = 1, pageSize = 10 }: PaginationParamsDTO,
    claimedShifts?: Array<Shift['id']> | null,
  ): Promise<PaginationResponse<GroupedShiftsResponse[]>> {
    const filters: any = {
      facility_id: facilityId,
      // The professions between the Shift and Worker must match.
      profession,
      // The Shift must be active and not claimed by someone else.
      worker: null,
      is_deleted: false,
      start: {
        gte: parseISO(startDate),
      },
      end: {
        lte: parseISO(endDate),
      },
    };

    if (claimedShifts?.length) {
      filters.id = {
        notIn: claimedShifts,
      };
    }

    const result = await this.prisma.shift.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: filters,
      orderBy: [{ start: 'asc' }, { end: 'asc' }],
    });

    const totalCount = await this.prisma.shift.count({
      where: filters,
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    // The shifts must be grouped by date.
    const groupedData = groupBy(
      result,
      (item) =>
        `${format(utcToZonedTime(item.start, 'UTC'), 'yyyy-MM-dd')}_${format(
          utcToZonedTime(item.end, 'UTC'),
          'yyyy-MM-dd',
        )}`,
    );

    const groupedResult = Object.entries(groupedData).map(([key, values]) => {
      const [start, end] = key.split('_');
      return {
        start,
        end,
        shifts: values,
      };
    });

    return {
      totalCount,
      totalPages,
      pageNumber: page,
      nextPage: page + 1,
      data: groupedResult,
    };
  }
}
