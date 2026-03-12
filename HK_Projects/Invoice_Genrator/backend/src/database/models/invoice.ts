
import mongoose, { Schema, Document } from "mongoose";

export interface InvoiceItem {
    productId: mongoose.Types.ObjectId;
    name: string;
    category: string;
    rate: number;           
    mrp: number;           
    qty: number;
    gstPercent: number;
    gstAmount: number;
    cgstAmount?: number;    
    sgstAmount?: number;    
    igstAmount?: number;   
    total: number;
}

export interface IInvoice extends Document {
    invoiceNumber: string;
    companyId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    discount?: number;
    discountType?: "FIXED" | "PERCENTAGE";
    discountValue?: number;  
    storeInvoiceNumber: number;
    customerName: string;
    customerMobile?: string;
    items: InvoiceItem[];
    subTotal: number;
    gstTotal: number;
    cgstTotal?: number;
    sgstTotal?: number;
    igstTotal?: number;
    gstType?: "IGST" | "CGST_SGST";
    grandTotal: number;
    paymentMethod: "CASH" | "CREDIT";
    paymentStatus: "PAID" | "UNPAID";
    status: "ACTIVE" | "CANCELLED";
    createdBy: mongoose.Types.ObjectId;
    isDeleted: boolean;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const InvoiceItemSchema = new Schema<InvoiceItem>({
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    rate: { type: Number, required: true },
    mrp: { type: Number, required: true },
    qty: { type: Number, required: true },
    gstPercent: { type: Number, required: true },
    gstAmount: { type: Number, required: true },
    cgstAmount: { type: Number },
    sgstAmount: { type: Number },
    igstAmount: { type: Number },
    total: { type: Number, required: true }
}, { _id: false });

const InvoiceSchema = new Schema<IInvoice>({
    storeInvoiceNumber: { type: Number, required: true },

    companyId: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: true,
        index: true
    },

    storeId: {
        type: Schema.Types.ObjectId,
        ref: "Store",
        required: true,
        index: true
    },

    discount: {
        type: Number,
        default: 0
    },
    
    discountType: {
        type: String,
        enum: ["FIXED", "PERCENTAGE"],
        default: "FIXED"
    },

    discountValue: {  
        type: Number,
        default: 0
    },

    invoiceNumber: { type: String, required: true },

    customerName: { type: String, required: true },
    customerMobile: String,

    items: { type: [InvoiceItemSchema], required: true },

    subTotal: { type: Number, required: true },
    gstTotal: { type: Number, required: true },
    cgstTotal: { type: Number },
    sgstTotal: { type: Number },
    igstTotal: { type: Number },
    gstType: { type: String, enum: ["IGST", "CGST_SGST"] },
    grandTotal: { type: Number, required: true },

    paymentMethod: {
        type: String,
        enum: ["CASH", "CREDIT"],
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ["PAID", "UNPAID"],
        default: "PAID"
    },

    status: {
        type: String,
        enum: ["ACTIVE", "CANCELLED"],
        default: "ACTIVE"
    },

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }

}, { timestamps: true });

InvoiceSchema.index({ storeId: 1, invoiceNumber: 1 }, { unique: true });

export const InvoiceModel = mongoose.model<IInvoice>("Invoice", InvoiceSchema);