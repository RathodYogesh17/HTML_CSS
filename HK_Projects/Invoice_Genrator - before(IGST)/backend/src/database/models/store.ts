import mongoose, { Schema, Document } from "mongoose";

export interface IStore extends Document {
  name: string;
  address: string;
  gstNumber: string;
  panNumber: string;
  email: string;
  mobile: string;
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