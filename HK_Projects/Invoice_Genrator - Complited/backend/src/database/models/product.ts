// import mongoose, { Document, Schema } from "mongoose";

// export interface IProduct extends Document {
//   storeId: mongoose.Types.ObjectId;
//   name: string;
//   category: mongoose.Types.ObjectId;
//   batchNo: string;
//   expiry: Date;
//   mrp: number;
//   rate: number;
//   stock: number;
//   gstPercent: number;
//   createdBy: mongoose.Types.ObjectId; // 👈 ADD THIS
//   isActive: boolean;
//   isDeleted: boolean;
//   deletedAt?: Date | null;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const ProductSchema: Schema<IProduct> = new Schema(
//   {
//     storeId: {
//       type: Schema.Types.ObjectId,
//       ref: "Store",
//       required: true,
//       index: true
//     },

//     name: {
//       type: String,
//       required: true,
//       trim: true,
//       lowercase: true
//     },

//     category: {
//       type: Schema.Types.ObjectId,
//       ref: "Category",
//       required: true,
//       index: true
//     },

//     batchNo: {
//       type: String,
//       required: true
//     },

//     expiry: {
//       type: Date,
//       required: true,
//       index: true
//     },

//     mrp: { type: Number, required: true },
//     rate: { type: Number, required: true },

//     stock: {
//       type: Number,
//       required: true,
//       min: 0
//     },

//     gstPercent: {
//       type: Number,
//       required: true,
//       default: 12
//     },

//     createdBy: { // 👈 ADD THIS FIELD
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true
//     },

//     isActive: { type: Boolean, default: true },
//     isDeleted: { type: Boolean, default: false },
//     deletedAt: { type: Date, default: null }
//   },
//   { timestamps: true }
// );

// // Prevent duplicate product in same store
// ProductSchema.index(
//   { storeId: 1, name: 1, batchNo: 1 },
//   { unique: true }
// );

// export const ProductModel = mongoose.model<IProduct>(
//   "Product",
//   ProductSchema
// );


import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  storeId: mongoose.Types.ObjectId;
  name: string;
  category: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;  // 👈 ADD THIS
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

    companyId: {  // 👈 NEW FIELD
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

// Prevent duplicate product in same store with same name
ProductSchema.index(
  { storeId: 1, name: 1 },
  { unique: true }
);

export const ProductModel = mongoose.model<IProduct>(
  "Product",
  ProductSchema
);