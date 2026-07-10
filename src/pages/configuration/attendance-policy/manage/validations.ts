import Joi from 'joi'

export type IpRangeFormValue = {
  start: string
  end: string
}

export type AttendancePolicyFormValues = {
  name: string
  description: string
  policyType: 'STRICT' | 'FLEXIBLE'
  radiusMeters: string
  wifiSsids: string[]
  ipRanges: IpRangeFormValue[]
}

/**
 * Mirrors backend middlewares/joi/config/attendance-policy for name/policyType/radiusMeters
 * shape (name required ≤100, policyType required, radiusMeters integer ≥0). radiusMeters being
 * required-when-STRICT is a frontend-only UX rule; wifiSsids and ipRanges are always optional,
 * matching the backend which treats all three as optional regardless of policyType.
 */
export const attendancePolicySchema = Joi.object<AttendancePolicyFormValues>({
  name: Joi.string().max(100).required().messages({
    'string.empty': 'Policy name is required',
    'string.max': 'Policy name must be at most 100 characters',
  }),
  description: Joi.string().max(500).allow('').messages({
    'string.max': 'Description must be at most 500 characters',
  }),
  policyType: Joi.string().valid('STRICT', 'FLEXIBLE').required().messages({
    'any.only': 'Policy type must be Strict or Flexible',
  }),
  radiusMeters: Joi.string()
    .pattern(/^\d+$/)
    .when('policyType', {
      is: 'STRICT',
      then: Joi.string().required().messages({
        'string.empty': 'Radius is required for strict policies',
        'string.pattern.base': 'Radius must be a whole number',
      }),
      otherwise: Joi.string().allow('').messages({
        'string.pattern.base': 'Radius must be a whole number',
      }),
    }),
  wifiSsids: Joi.array().items(Joi.string()).optional(),
  ipRanges: Joi.array()
    .items(
      Joi.object({
        start: Joi.string().required(),
        end: Joi.string().required(),
      }),
    )
    .optional(),
})
