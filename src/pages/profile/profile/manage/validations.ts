import Joi from 'joi'
import type { MediaInput } from '../../../../services'

export type ProfileFormValues = {
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  gender: '' | 'MALE' | 'FEMALE' | 'OTHER'
  maritalStatus: string
  contactEmail: string
  dialCode: string
  iso2: string
  country: string
  number: string
  media: MediaInput | null
}

/**
 * Mirrors backend middlewares/joi/account (updateProfileSchema). Every
 * backend field is technically optional, but firstName/lastName/email are
 * required here as a sane baseline for a self-profile form — you shouldn't
 * be able to blank out your own name. Mobile number sub-fields are all
 * optional individually, but if any one is filled, the others become
 * required (mirrors the backend only accepting a complete mobileNumber
 * object, never a partial one).
 */
export const profileSchema = Joi.object<ProfileFormValues>({
  firstName: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'First name is required',
    'string.max': 'First name must be at most 100 characters',
  }),
  lastName: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Last name is required',
    'string.max': 'Last name must be at most 100 characters',
  }),
  email: Joi.string()
    .email({ tlds: false })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Enter a valid email address',
    }),
  dateOfBirth: Joi.string().allow(''),
  gender: Joi.string().valid('', 'MALE', 'FEMALE', 'OTHER'),
  maritalStatus: Joi.string().max(50).allow(''),
  contactEmail: Joi.string().email({ tlds: false }).allow('').messages({
    'string.email': 'Enter a valid contact email address',
  }),
  dialCode: Joi.string().allow(''),
  iso2: Joi.string().allow(''),
  country: Joi.string().allow(''),
  number: Joi.string()
    .allow('')
    .custom((value, helpers) => {
      const { dialCode, iso2, country } = helpers.state.ancestors[0] as ProfileFormValues
      if (value && (!dialCode || !iso2 || !country)) {
        return helpers.error('mobile.incomplete')
      }
      return value
    })
    .messages({
      'mobile.incomplete': 'Fill in dial code, country code, and country too, or clear the number',
    }),
  media: Joi.object({
    name: Joi.string().required(),
    size: Joi.number().required(),
    url: Joi.string().required(),
    mimetype: Joi.string().required(),
  })
    .allow(null)
    .optional(),
})
