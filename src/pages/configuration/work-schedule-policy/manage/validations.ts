import Joi from 'joi'
import { TIMEZONE_OPTIONS } from './timezones'

export type WorkSchedulePolicyFormValues = {
  name: string
  workingDays: string[]
  startTime: string
  endTime: string
  breakDurationMinutes: string
  fullDayMinimumMinutes: string
  halfDayMinimumMinutes: string
  lateMarkAfter: string
  graceTimeInMinutes: string
  timezone: string
}

const optionalMinutes = (label: string) =>
  Joi.string()
    .allow('')
    .pattern(/^\d+$/)
    .messages({ 'string.pattern.base': `${label} must be a whole number` })

/** Mirrors backend middlewares/joi/config/work-schedule-policy: name/workingDays/startTime/endTime required, rest optional. */
export const workSchedulePolicySchema = Joi.object<WorkSchedulePolicyFormValues>({
  name: Joi.string().max(100).required().messages({
    'string.empty': 'Policy name is required',
    'string.max': 'Policy name must be at most 100 characters',
  }),
  workingDays: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.min': 'Select at least one working day',
  }),
  startTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required().messages({
    'string.empty': 'Start time is required',
    'string.pattern.base': 'Start time must be in HH:mm format',
  }),
  endTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required().messages({
    'string.empty': 'End time is required',
    'string.pattern.base': 'End time must be in HH:mm format',
  }),
  breakDurationMinutes: optionalMinutes('Break duration'),
  fullDayMinimumMinutes: optionalMinutes('Full day minimum'),
  halfDayMinimumMinutes: optionalMinutes('Half day minimum'),
  lateMarkAfter: Joi.string()
    .allow('')
    .pattern(/^\d{2}:\d{2}$/)
    .messages({ 'string.pattern.base': 'Late mark time must be in HH:mm format' }),
  graceTimeInMinutes: optionalMinutes('Grace time'),
  timezone: Joi.string()
    .valid(...TIMEZONE_OPTIONS.map((option) => option.value))
    .required()
    .messages({ 'any.only': 'Select a valid timezone' }),
})
