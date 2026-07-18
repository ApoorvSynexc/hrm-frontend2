import Joi from 'joi'

export type WorkFromHomeFormValues = {
  startDate: string
  endDate: string
  startDateDayPart: 'FIRST_HALF' | 'SECOND_HALF' | 'FULL_DAY'
  endDateDayPart: 'FIRST_HALF' | 'SECOND_HALF' | 'FULL_DAY'
  reason: string
}

/**
 * Backend Joi (createWorkFromHomeValidation) marks startDate/endDate as
 * optional, but the Prisma model requires both as non-nullable — omitting
 * them throws an unhandled Prisma error instead of a clean 400, so both are
 * required here.
 */
export const workFromHomeSchema = Joi.object<WorkFromHomeFormValues>({
  startDate: Joi.string().required().messages({
    'string.empty': 'Start date is required',
  }),
  endDate: Joi.string()
    .required()
    .custom((value, helpers) => {
      const { startDate } = helpers.state.ancestors[0] as WorkFromHomeFormValues
      if (startDate && value < startDate) return helpers.error('date.min')
      return value
    })
    .messages({
      'string.empty': 'End date is required',
      'date.min': 'End date cannot be before start date',
    }),
  startDateDayPart: Joi.string().valid('FIRST_HALF', 'SECOND_HALF', 'FULL_DAY').required(),
  endDateDayPart: Joi.string().valid('FIRST_HALF', 'SECOND_HALF', 'FULL_DAY').required(),
  reason: Joi.string().max(500).allow('').messages({
    'string.max': 'Reason must be at most 500 characters',
  }),
})
