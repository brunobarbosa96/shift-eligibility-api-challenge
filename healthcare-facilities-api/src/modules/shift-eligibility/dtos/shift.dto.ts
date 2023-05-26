import { Facility, Worker } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';
import { PaginationParamsDTO } from './pagination.dto';

export class FindAvailableShiftsDTO extends PaginationParamsDTO {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  facilityId: Facility['id'];

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  workerId: Worker['id'];

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
