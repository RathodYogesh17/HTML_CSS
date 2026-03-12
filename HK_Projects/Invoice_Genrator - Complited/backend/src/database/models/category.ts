import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdBy: mongoose.Types.ObjectId; // Required karo
  deletedAt?: Date | null;
  storeId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",   
      required: true,
      index: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // 👈 REQUIRED KARO
      index: true
    }
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>("Category", CategorySchema);