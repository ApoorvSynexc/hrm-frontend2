import Joi from 'joi'

export type LoginFormValues = {
  email: string
  password: string
  remember: boolean
}

export const loginSchema = Joi.object<LoginFormValues>({
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Enter a valid email address',
    }),
  password: Joi.string().required().min(8).messages({
    'string.empty': 'Password is required',
    'string.min': 'At least 8 characters',
  }),
  remember: Joi.boolean(),
})
