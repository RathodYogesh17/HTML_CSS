import Joi from "joi";

const invoiceItemSchema = Joi.object({
    productId: Joi.string().required(),
    qty: Joi.number().min(1).required()
});

export const createInvoiceSchema = Joi.object({
    companyId: Joi.string().required(),
    customerName: Joi.string().trim().min(2).max(100).required(),
    customerMobile: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    paymentMethod: Joi.string().valid("CASH", "CARD", "UPI").required(),
    items: Joi.array().items(invoiceItemSchema).min(1).required()
});

export const updateInvoiceSchema = Joi.object({
    paymentStatus: Joi.string().valid("PAID", "UNPAID").optional(),
    status: Joi.string().valid("ACTIVE", "CANCELLED").optional()
}).min(1);