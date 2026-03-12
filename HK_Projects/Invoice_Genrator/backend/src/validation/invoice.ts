
import Joi from "joi";

const invoiceItemSchema = Joi.object({
    productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    qty: Joi.number().min(1).required(),
    rate: Joi.number().min(0).required(),      
    mrp: Joi.number().min(0).required()        
});

export const createInvoiceSchema = Joi.object({
    companyId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    customerName: Joi.string().trim().min(2).max(100).required(),
    customerMobile: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    paymentMethod: Joi.string().valid("CASH", "CREDIT").required(), 
    discount: Joi.number().min(0).default(0).optional(),
    discountType: Joi.string().valid("FIXED", "PERCENTAGE").default("FIXED").optional(),
    items: Joi.array().items(invoiceItemSchema).min(1).required()
});

export const updateInvoiceSchema = Joi.object({
    paymentStatus: Joi.string().valid("PAID", "UNPAID").optional(),
    status: Joi.string().valid("ACTIVE", "CANCELLED").optional(),
    discount: Joi.number().min(0).optional(),
    discountType: Joi.string().valid("FIXED", "PERCENTAGE").optional()
}).min(1);