import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { FindAvailableShiftsDTO } from './dtos/shift.dto';
import { ShiftService } from './shift.service';

@Controller('shifts')
@ApiTags('Shifts')
export class ShiftController {
  @Inject(ShiftService)
  private readonly shiftService: ShiftService;

  @Get('/available')
  @ApiOperation({ summary: 'Find all available shifts' })
  @ApiQuery({
    name: 'facilityId',
    description: 'ID of the facility',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'workerId',
    description: 'ID of the worker',
    type: Number,
    example: 103,
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date of the range',
    type: String,
    example: '2023-02-01T17:35:22.886Z',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date of the range',
    type: String,
    example: '2023-02-17T17:35:22.886Z',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'Number of items per page',
    type: Number,
    example: 10,
  })
  @ApiOkResponse({
    description: 'Shifts found successfully',
  })
  async findAllAvailable(
    @Res() response: Response,
    @Query() params: FindAvailableShiftsDTO,
  ) {
    const { facilityId, workerId, startDate, endDate, page, pageSize } = params;
    const result = await this.shiftService.findAllAvailableByFacilityAndWorker(
      facilityId,
      workerId,
      startDate,
      endDate,
      {
        page,
        pageSize,
      },
    );
    return response.status(HttpStatus.OK).json(result);
  }
}
