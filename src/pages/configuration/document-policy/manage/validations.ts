import Joi from 'joi'
import type { MediaInput } from '../../../../services'

export type DocumentPolicyFormValues = {
  name: string
  description: string
  media: MediaInput | null
}

/** Mirrors backend middlewares/joi/config/document-policy. */
export const documentPolicySchema = Joi.object<DocumentPolicyFormValues>({
  name: Joi.string().max(100).required().messages({
    'string.empty': 'Policy name is required',
    'string.max': 'Policy name must be at most 100 characters',
  }),
  description: Joi.string().max(500).allow('').messages({
    'string.max': 'Description must be at most 500 characters',
  }),
  media: Joi.object({
    name: Joi.string().required(),
    size: Joi.number().required(),
    url: Joi.string().required(),
    mimetype: Joi.string().required(),
  })
    .required()
    .messages({
      'any.required': 'Please upload a file',
      'object.base': 'Please upload a file',
    }),
})
