import mongoose, { Schema, Document } from "mongoose";

export interface InvoiceItem {
    productId: mongoose.Types.ObjectId;
    name: string;
    category: string;
    batchNo: string;
    expiry: Date;
    mrp: number;
    rate: number;
    qty: number;
    gstPercent: number;
    gstAmount: number;
    total: number;
    
}

export interface IInvoice extends Document {
    invoiceNumber: string;
    companyId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    customerName: string;
    customerMobile?: string;
    items: InvoiceItem[];
    subTotal: number;
    gstTotal: number;
    grandTotal: number;
    paymentMethod: "CASH" | "CARD" | "UPI";
    paymentStatus: "PAID" | "UNPAID";
    status: "ACTIVE" | "CANCELLED";
    isDeleted: boolean;
    deletedAt?: Date | null;
}

const InvoiceItemSchema = new Schema<InvoiceItem>({
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    category: String,
    batchNo: String,
    expiry: Date,
    mrp: Number,
    rate: Number,
    qty: Number,
    gstPercent: Number,
    gstAmount: Number,
    total: Number
}, { _id: false });

const InvoiceSchema = new Schema<IInvoice>({
    invoiceNumber: { type: String, unique: true, index: true },

    companyId: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: true,
        index: true
    },

    storeId: {
        type: Schema.Types.ObjectId,
        ref: "Store",   // 🔥 FIXED
        required: true,
        index: true
    },

    customerName: { type: String, required: true },
    customerMobile: String,

    items: { type: [InvoiceItemSchema], required: true },

    subTotal: Number,
    gstTotal: Number,
    grandTotal: Number,

    paymentMethod: {
        type: String,
        enum: ["CASH", "CARD", "UPI"],
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

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }

}, { timestamps: true });

export const InvoiceModel = mongoose.model<IInvoice>("Invoice", InvoiceSchema);