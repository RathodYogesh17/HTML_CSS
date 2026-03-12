import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  role: "USER" | "ADMIN";
  ownerName: string;
  email: string;
  password: string;
  mobileNumber: string;
  address: string;
  gstNumber?: string;
  profileImage?: string;
  stores: mongoose.Types.ObjectId[];
  isActive: boolean;
  isApproved: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  resetPasswordOTP?: string;
  resetPasswordExpire?: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER"
    },
    stores: [
      {
        type: Schema.Types.ObjectId,
        ref: "Store"
      }
    ],
    ownerName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    mobileNumber: { type: String, required: true },
    address: { type: String, required: true },
    gstNumber: { type: String, default: null },
    profileImage: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    resetPasswordOTP: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);