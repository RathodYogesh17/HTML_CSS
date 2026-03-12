import Joi from "joi";

export const addCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  description: Joi.string().allow("").optional(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).optional(),
  description: Joi.string().allow("").optional(),
});