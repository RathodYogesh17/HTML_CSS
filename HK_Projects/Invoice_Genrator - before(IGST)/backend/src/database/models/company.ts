import mongoose, { Schema, Document } from "mongoose";

export interface ICompany extends Document {
  name: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  logo?: string;
  storeId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId; 
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    gstNumber: { type: String, required: true },
    logo: { type: String, default: "" },

    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true
    },

    createdBy: { 
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export const CompanyModel = mongoose.model<ICompany>("Company", CompanySchema);