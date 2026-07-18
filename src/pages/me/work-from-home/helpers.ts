import { dayjs } from '../../../utils/date'
import type { WorkFromHomeDayPart } from '../../../services'

/**
 * The backend computes this same day count when creating a request but never
 * persists it (see WorkFromHome['amount'] in services/work-from-home/types) —
 * recomputed here from the date range and day-parts for display and for a
 * client-side balance check before submitting.
 */
export function computeRequestedDays(
  startDate: string,
  endDate: string,
  startDateDayPart: WorkFromHomeDayPart,
  endDateDayPart: WorkFromHomeDayPart,
): number {
  const totalDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1

  if (totalDays <= 1) {
    return startDateDayPart !== 'FULL_DAY' || endDateDayPart !== 'FULL_DAY' ? 0.5 : 1
  }

  let days = totalDays
  if (startDateDayPart !== 'FULL_DAY') days -= 0.5
  if (endDateDayPart !== 'FULL_DAY') days -= 0.5
  return days
}
