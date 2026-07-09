import Joi from 'joi'

export type RoleFormValues = {
  name: string
  description: string
}

/** Mirrors backend middlewares/joi/config/role: name ≤100 & not "admin", description ≤500. */
export const roleSchema = Joi.object<RoleFormValues>({
  name: Joi.string()
    .max(100)
    .required()
    .custom((value, helpers) => {
      if (value.toLowerCase() === 'admin') return helpers.error('name.reserved')
      return value
    })
    .messages({
      'string.empty': 'Role name is required',
      'string.max': 'Role name must be at most 100 characters',
      'name.reserved': 'Cannot use the reserved name "Admin"',
    }),
  description: Joi.string().max(500).allow('').messages({
    'string.max': 'Description must be at most 500 characters',
  }),
})
