import Joi from "joi";

/* ===============================
   GST & PAN Regex (India)
================================= */

const gstRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const panRegex =
  /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const mobileRegex =
  /^[6-9]\d{9}$/;

/* ===============================
   CREATE STORE
================================= */

export const createStoreValidation = Joi.object({
  name: Joi.string().trim().min(3).max(100).required(),

  address: Joi.string().min(5).required(),

  gstNumber: Joi.string()
    .uppercase()
    .pattern(gstRegex)
    .required()
    .messages({
      "string.pattern.base": "Invalid GST number format"
    }),

  panNumber: Joi.string()
    .uppercase()
    .pattern(panRegex)
    .required()
    .messages({
      "string.pattern.base": "Invalid PAN number format"
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .required(),

  mobile: Joi.string()
    .pattern(mobileRegex)
    .required()
    .messages({
      "string.pattern.base": "Invalid mobile number"
    }),

  gstType: Joi.string()
    .valid("IGST", "CGST_SGST")
    .default("IGST")
    .required(),

  defaultGstRate: Joi.number()
    .min(0)
    .max(100)
    .default(18)
    .optional()
}).options({ abortEarly: false });

/* ===============================
   UPDATE STORE
================================= */

export const updateStoreValidation = Joi.object({
  name: Joi.string().trim().min(3).max(100).optional(),

  address: Joi.string().min(5).optional(),

  gstNumber: Joi.string()
    .uppercase()
    .pattern(gstRegex)
    .optional(),

  panNumber: Joi.string()
    .uppercase()
    .pattern(panRegex)
    .optional(),

  email: Joi.string()
    .email()
    .lowercase()
    .optional(),

  mobile: Joi.string()
    .pattern(mobileRegex)
    .optional(),

  gstType: Joi.string()
    .valid("IGST", "CGST_SGST")
    .optional(),

  defaultGstRate: Joi.number()
    .min(0)
    .max(100)
    .optional(),

  isActive: Joi.boolean().optional()
})
  .min(1)
  .options({ abortEarly: false });