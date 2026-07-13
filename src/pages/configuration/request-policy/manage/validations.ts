import Joi from 'joi'

export type RequestPolicyFormValues = {
  name: string
  description: string
  type: 'LEAVE' | 'WFH' | 'REGULARIZATION'
  wfhType: 'PERMANENT' | 'RESTRICTED'
  wfhMaxDaysPerMonth: string
  wfhCarryForwardAllowed: boolean
  wfhCarryForwardLimit: string
  wfhRequiresApproval: boolean
  regType: 'UNRESTRICTED' | 'RESTRICTED'
  regMaxDaysPerMonth: string
  regRequiresApproval: boolean
}

const optionalCount = (label: string) =>
  Joi.string()
    .allow('')
    .pattern(/^\d+$/)
    .messages({ 'string.pattern.base': `${label} must be a whole number` })

/**
 * Mirrors backend middlewares/joi/config/request-policy: name/type required,
 * wfhRule required when type=WFH, regularizationRule required when
 * type=REGULARIZATION (both otherwise unused). Numeric fields collected as
 * strings for form-friendliness and converted to numbers on submit.
 */
export const requestPolicySchema = Joi.object<RequestPolicyFormValues>({
  name: Joi.string().max(100).required().messages({
    'string.empty': 'Policy name is required',
    'string.max': 'Policy name must be at most 100 characters',
  }),
  description: Joi.string().max(500).allow('').messages({
    'string.max': 'Description must be at most 500 characters',
  }),
  type: Joi.string().valid('LEAVE', 'WFH', 'REGULARIZATION').required().messages({
    'any.only': 'Type must be Leave, WFH, or Regularization',
  }),
  wfhType: Joi.string().valid('PERMANENT', 'RESTRICTED').required(),
  wfhMaxDaysPerMonth: optionalCount('Max days/month'),
  wfhCarryForwardAllowed: Joi.boolean().required(),
  wfhCarryForwardLimit: optionalCount('Carry forward limit'),
  wfhRequiresApproval: Joi.boolean().required(),
  regType: Joi.string().valid('UNRESTRICTED', 'RESTRICTED').required(),
  regMaxDaysPerMonth: optionalCount('Max days/month'),
  regRequiresApproval: Joi.boolean().required(),
})
