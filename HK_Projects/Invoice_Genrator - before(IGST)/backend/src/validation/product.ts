import Joi from "joi";

export const addProductSchema = Joi.object({
  name: Joi.string().trim().required(),
  category: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  batchNo: Joi.string().trim().required(),
  expiry: Joi.date().required(),
  mrp: Joi.number().min(0).required(),
  rate: Joi.number().min(0).required(),
  stock: Joi.number().min(0).required(),
  gstPercent: Joi.number().min(0).max(100).required(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim(),
  category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  batchNo: Joi.string().trim(),
  expiry: Joi.date(),
  mrp: Joi.number().min(0),
  rate: Joi.number().min(0),
  stock: Joi.number().min(0),
  gstPercent: Joi.number().min(0).max(100),
}).min(1); 