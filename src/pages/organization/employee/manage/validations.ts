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
 * Backend middlewares/joi/employee only requires firstName/lastName/email/roleId
 * (password only required on create — the modal skips rendering/validating it
 * when editing). Department/Designation/Reporting Manager are enforced as
 * required here as a stricter frontend-only rule.
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
  departmentId: Joi.string().required().messages({
    'string.empty': 'Department is required',
  }),
  designationId: Joi.string().required().messages({
    'string.empty': 'Designation is required',
  }),
  roleId: Joi.string().required().messages({
    'string.empty': 'Role is required',
  }),
  reportingManagerId: Joi.string().required().messages({
    'string.empty': 'Reporting manager is required',
  }),
})
