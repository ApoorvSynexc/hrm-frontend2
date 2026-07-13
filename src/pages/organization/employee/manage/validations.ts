import Joi from 'joi'

export type EmployeeFormValues = {
  firstName: string
  lastName: string
  email: string
  password: string
  hireDate: string
  departmentId: string
  designationId: string
  roleId: string
  reportingManagerId: string
}

/**
 * Mirrors backend middlewares/joi/employee: firstName/lastName/email/roleId
 * required on both create and edit (password only required on create — the
 * modal itself skips rendering/validating it when editing).
 */
export const employeeSchema = Joi.object<EmployeeFormValues>({
  firstName: Joi.string().max(50).required().messages({
    'string.empty': 'First name is required',
    'string.max': 'First name must be at most 50 characters',
  }),
  lastName: Joi.string().max(50).required().messages({
    'string.empty': 'Last name is required',
    'string.max': 'Last name must be at most 50 characters',
  }),
  email: Joi.string().email({ tlds: false }).required().messages({
    'string.email': 'Enter a valid email address',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().allow('').min(6).messages({
    'string.min': 'Password must be at least 6 characters',
  }),
  hireDate: Joi.string().allow(''),
  departmentId: Joi.string().allow(''),
  designationId: Joi.string().allow(''),
  roleId: Joi.string().required().messages({
    'string.empty': 'Role is required',
  }),
  reportingManagerId: Joi.string().allow(''),
})
