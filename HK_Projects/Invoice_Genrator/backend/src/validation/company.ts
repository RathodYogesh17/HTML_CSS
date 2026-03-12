import Joi from "joi";

export const addCompanySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  address: Joi.string().trim().min(5).max(200).required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    'string.pattern.base': 'Phone number must be 10 digits'
  }),
  email: Joi.string().email().required(),
  gstNumber: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).required().messages({
    'string.pattern.base': 'Invalid GST number format'
  }),
  logo: Joi.string().uri().optional().allow(''),
  storeId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Store ID must be a valid ObjectId',
    'any.required': 'Store ID is required'
  }),
  isActive: Joi.boolean().optional().default(true)
});

export const updateCompanySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  address: Joi.string().trim().min(5).max(200).optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  email: Joi.string().email().optional(),
  gstNumber: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional(),
  logo: Joi.string().uri().optional().allow(''),
  storeId: Joi.string().hex().length(24).optional(),
  isActive: Joi.boolean().optional()
});