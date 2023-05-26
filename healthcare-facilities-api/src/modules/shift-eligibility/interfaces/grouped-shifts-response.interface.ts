import { Shift } from '@prisma/client';

export interface GroupedShiftsResponse {
  start: string;
  end: string;
  shifts: Shift[];
}
