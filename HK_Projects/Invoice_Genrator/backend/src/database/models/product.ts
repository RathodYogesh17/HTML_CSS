
import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  storeId: mongoose.Types.ObjectId;
  name: string;
  category: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId; 
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true
    },

    companyId: {  
      type: Schema.Types.ObjectId,
      ref: "Company",
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

ProductSchema.index(
  { storeId: 1, name: 1 },
  { unique: true }
);

export const ProductModel = mongoose.model<IProduct>(
  "Product",
  ProductSchema
);