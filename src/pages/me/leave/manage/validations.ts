import Joi from 'joi'

export type LeaveFormValues = {
  leaveTypeId: string
  startDate: string
  endDate: string
  reason: string
}

/** Mirrors backend createLeaveSchema: leaveTypeId/startDate/endDate/reason required, endDate >= startDate. */
export const leaveSchema = Joi.object<LeaveFormValues>({
  leaveTypeId: Joi.string().required().messages({
    'string.empty': 'Leave type is required',
  }),
  startDate: Joi.string().required().messages({
    'string.empty': 'Start date is required',
  }),
  endDate: Joi.string()
    .required()
    .custom((value, helpers) => {
      const { startDate } = helpers.state.ancestors[0] as LeaveFormValues
      if (startDate && value < startDate) return helpers.error('date.min')
      return value
    })
    .messages({
      'string.empty': 'End date is required',
      'date.min': 'End date cannot be before start date',
    }),
  reason: Joi.string().max(500).required().messages({
    'string.empty': 'Reason is required',
    'string.max': 'Reason must be at most 500 characters',
  }),
})
