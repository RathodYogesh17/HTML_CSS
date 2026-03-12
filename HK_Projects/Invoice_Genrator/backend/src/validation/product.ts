
import Joi from "joi";

export const addProductSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Product name is required',
      'string.min': 'Product name must be at least 2 characters',
      'string.max': 'Product name cannot exceed 100 characters',
      'any.required': 'Product name is required'
    }),

  category: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid category ID format',
      'any.required': 'Category is required'
    }),

  companyId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid company ID format',
      'any.required': 'Company is required'
    })
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  companyId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional()
}).min(1);