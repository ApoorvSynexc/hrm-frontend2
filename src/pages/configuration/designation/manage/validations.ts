import Joi from 'joi'

export type DesignationFormValues = {
  name: string
  description: string
}

/** Mirrors backend middlewares/joi/config/designation: name ≤100, description ≤500. */
export const designationSchema = Joi.object<DesignationFormValues>({
  name: Joi.string().max(100).required().messages({
    'string.empty': 'Designation name is required',
    'string.max': 'Designation name must be at most 100 characters',
  }),
  description: Joi.string().max(500).allow('').messages({
    'string.max': 'Description must be at most 500 characters',
  }),
})
