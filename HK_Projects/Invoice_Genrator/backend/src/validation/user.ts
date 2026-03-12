import Joi from "joi";

export const addUserSchema = Joi.object({
  role: Joi.string().valid('USER', 'ADMIN').default('USER').optional(),
  stores: Joi.array().items(Joi.string().hex().length(24)).optional(),
  ownerName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  mobileNumber: Joi.string().required(),
  address: Joi.string().required(),
  gstNumber: Joi.string().allow(null, ""),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateUserSchema = Joi.object({
  role: Joi.string().valid('USER', 'ADMIN').optional(),
  stores: Joi.array().items(Joi.string().hex().length(24)).optional(),
  ownerName: Joi.string().optional(),
  email: Joi.string().email().optional(),           
  mobileNumber: Joi.string().optional(),
  address: Joi.string().optional(),                 
  password: Joi.string().min(6).optional(),
  gstNumber: Joi.string().allow(null, "").optional(), 
});