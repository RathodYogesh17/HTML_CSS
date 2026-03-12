import mongoose, { Schema, Document } from "mongoose";

export interface IStore extends Document {
  name: string;
  address: string;
  gstNumber: string;
  panNumber: string;
  email: string;
  mobile: string;
  gstType: "IGST" | "CGST_SGST"; // New field
  defaultGstRate?: number; // Default GST rate (e.g., 18%)
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    address: {
      type: String,
      required: true
    },

    gstNumber: {
      type: String,
      required: true
    },

    panNumber: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true
    },

    mobile: {
      type: String,
      required: true
    },

    gstType: {
      type: String,
      enum: ["IGST", "CGST_SGST"],
      default: "IGST",
      required: true
    },

    defaultGstRate: {
      type: Number,
      default: 18,
      min: 0,
      max: 100
    },

    isActive: {
      type: Boolean,
      default: true
    },

    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export const StoreModel = mongoose.model<IStore>("Store", StoreSchema);