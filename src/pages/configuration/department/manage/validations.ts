import Joi from 'joi'

export type DepartmentFormValues = {
  name: string
  description: string
}

/** Mirrors backend middlewares/joi/config/department: name ≤100, description ≤500. */
export const departmentSchema = Joi.object<DepartmentFormValues>({
  name: Joi.string().max(100).required().messages({
    'string.empty': 'Department name is required',
    'string.max': 'Department name must be at most 100 characters',
  }),
  description: Joi.string().max(500).allow('').messages({
    'string.max': 'Description must be at most 500 characters',
  }),
})
