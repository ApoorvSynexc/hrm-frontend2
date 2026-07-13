import Joi from 'joi'

export type HolidayFormValues = {
  name: string
  date: string
  type: 'FIXED' | 'FESTIVAL' | 'NATIONAL'
  restrictionType: 'FIXED' | 'RESTRICTED'
}

/** Mirrors backend middlewares/joi/config/holiday: name/date/type required, restrictionType optional. */
export const holidaySchema = Joi.object<HolidayFormValues>({
  name: Joi.string().required().messages({
    'string.empty': 'Holiday name is required',
  }),
  date: Joi.string().required().messages({
    'string.empty': 'Date is required',
  }),
  type: Joi.string().valid('FIXED', 'FESTIVAL', 'NATIONAL').required().messages({
    'any.only': 'Type must be Fixed, Festival, or National',
  }),
  restrictionType: Joi.string().valid('FIXED', 'RESTRICTED').required().messages({
    'any.only': 'Restriction type must be Fixed or Restricted',
  }),
})
