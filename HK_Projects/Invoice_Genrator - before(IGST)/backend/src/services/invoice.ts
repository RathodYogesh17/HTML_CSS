import mongoose from "mongoose";
import { InvoiceModel, ProductModel } from "../database";

export const createInvoiceService = async (invoiceData: any, user: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, customerName, customerMobile, paymentMethod, companyId  } =
      invoiceData;
      const storeId = user.stores[0];

    if (user.role !== "ADMIN") {
      if (!user.stores?.includes(storeId)) {
        throw new Error("FORBIDDEN");
      }
    }

    const productIds = items.map((i: any) => i.productId);

    const products = await ProductModel.find({
      _id: { $in: productIds },
      storeId,
      isDeleted: false,
    }).session(session);

    let subTotal = 0;
    let gstTotal = 0;
    const invoiceItems: any[] = [];

    for (const item of items) {
      const product = products.find(
        (p) => p._id.toString() === item.productId
      );

      if (!product) throw new Error("PRODUCT_NOT_FOUND");

      if (product.stock < item.qty)
        throw new Error(`INSUFFICIENT_STOCK: ${product.name}`);

      const base = product.rate * item.qty;
      const gst = (base * product.gstPercent) / 100;
      const total = base + gst;

      subTotal += base;
      gstTotal += gst;

      invoiceItems.push({
        productId: product._id,
        name: product.name,
        rate: product.rate,
        qty: item.qty,
        gstPercent: product.gstPercent,
        gstAmount: gst,
        total,
      });

      product.stock -= item.qty;
      await product.save({ session });
    }

    const invoiceNumber = `INV-${Date.now()}`;
    const [invoice] = await InvoiceModel.create(
      [
        {
          invoiceNumber,
          storeId,
          companyId,
          customerName,
          customerMobile,
          items: invoiceItems,
          subTotal,
          gstTotal,
          grandTotal: subTotal + gstTotal,
          paymentMethod,
          status: "ACTIVE",
          isDeleted: false,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return invoice;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getInvoiceByIdService = async (id: string, user: any) => {
  const invoice = await InvoiceModel.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate("storeId", "name")
    .populate("items.productId", "name");

  if (!invoice) return null;

  if (user.role !== "ADMIN") {
    if (!user.stores?.includes(invoice.storeId._id.toString())) {
      throw new Error("FORBIDDEN");
    }
  }

  return invoice;
};

export const getAllInvoicesService = async (user: any, queryParams: any) => {
  const { page = 1, limit = 10, search = "", storeId } = queryParams;

  const query: any = { isDeleted: false };

  if (user.role !== "ADMIN") {
    query.storeId = { $in: user.stores };
  }

  if (storeId) query.storeId = storeId;

  if (search) {
    query.$or = [
      { invoiceNumber: { $regex: search, $options: "i" } },
      { customerName: { $regex: search, $options: "i" } },
    ];
  }

  const total = await InvoiceModel.countDocuments(query);

  const invoices = await InvoiceModel.find(query)
    .populate("storeId", "name")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return {
    data: invoices,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  };
};

export const updateInvoiceService = async (
  id: string,
  updateData: any,
  user: any
) => {
  const invoice = await InvoiceModel.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!invoice) return null;

  if (user.role !== "ADMIN") {
    if (!user.stores?.includes(invoice.storeId.toString())) {
      throw new Error("FORBIDDEN");
    }
  }

  return await InvoiceModel.findByIdAndUpdate(id, updateData, {
    new: true,
  });
};

export const deleteInvoiceService = async (id: string, user: any) => {
    const session = await mongoose.startSession();
  
    try {
      let deletedInvoice: any;
  
      await session.withTransaction(async () => {
        const invoice = await InvoiceModel.findOne({
          _id: id,
          isDeleted: false,
        }).session(session);
  
        if (!invoice) return null;
  
        if (user.role !== "ADMIN") {
          if (!user.stores?.includes(invoice.storeId.toString())) {
            throw new Error("FORBIDDEN");
          }
        }
  
        // 🔁 revert stock
        for (const item of invoice.items) {
          await ProductModel.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: item.qty } },
            { session }
          );
        }
  
        // ✅ ONLY soft delete
        invoice.isDeleted = true;
        invoice.deletedAt = new Date();
  
        await invoice.save({ session });
  
        deletedInvoice = invoice;
      });
  
      return deletedInvoice;
    } finally {
      session.endSession();
    }
  };

export const cancelInvoiceService = async (id: string, user: any) => {
  const invoice = await InvoiceModel.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!invoice) return null;

  if (user.role !== "ADMIN") {
    if (!user.stores?.includes(invoice.storeId.toString())) {
      throw new Error("FORBIDDEN");
    }
  }

  invoice.status = "CANCELLED";
  await invoice.save();

  return invoice;
};