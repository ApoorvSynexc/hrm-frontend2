import Joi from 'joi'

/**
 * `date` is picked via the calendar in the modal (not typed in), and
 * checkInTime/checkOutTime are HH:mm — combined with `date` into full
 * ISO datetimes right before calling the API (see manage/index.tsx).
 */
export type RegularizationFormValues = {
  date: string
  dayPart: 'FIRST_HALF' | 'SECOND_HALF' | 'FULL_DAY'
  checkInTime: string
  checkOutTime: string
  reason: string
}

/**
 * Backend Joi (createRegularizationSchema) marks requestedCheckIn/requestedCheckOut
 * as optional, but the Prisma model requires both as non-nullable — omitting them
 * throws an unhandled Prisma error instead of a clean 400, so both are required here.
 */
export const regularizationSchema = Joi.object<RegularizationFormValues>({
  date: Joi.string().required().messages({
    'string.empty': 'Date is required',
  }),
  dayPart: Joi.string().valid('FIRST_HALF', 'SECOND_HALF', 'FULL_DAY').required(),
  checkInTime: Joi.string().required().messages({
    'string.empty': 'Requested check-in time is required',
  }),
  checkOutTime: Joi.string().required().messages({
    'string.empty': 'Requested check-out time is required',
  }),
  reason: Joi.string().max(500).required().messages({
    'string.empty': 'Reason is required',
    'string.max': 'Reason must be at most 500 characters',
  }),
})
