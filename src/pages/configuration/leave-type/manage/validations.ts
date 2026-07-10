import Joi from 'joi'
import type { LeaveTypeGender } from '../../../../services'

export type LeaveTypeFormValues = {
  name: string
  code: string
  color: string
  applicableGender: LeaveTypeGender
}

/** Mirrors backend middlewares/joi/config/leave-type: name & code required, code uppercased, color hex, gender MALE|FEMALE|BOTH. */
export const leaveTypeSchema = Joi.object<LeaveTypeFormValues>({
  name: Joi.string().required().messages({
    'string.empty': 'Name is required',
  }),
  code: Joi.string().required().messages({
    'string.empty': 'Code is required',
  }),
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .required()
    .messages({
      'string.pattern.base': 'Color must be a valid hex code (e.g. #4F46E5)',
      'string.empty': 'Color is required',
    }),
  applicableGender: Joi.string().valid('MALE', 'FEMALE', 'BOTH').required().messages({
    'any.only': 'Applicable gender must be Male, Female, or Both',
  }),
})
