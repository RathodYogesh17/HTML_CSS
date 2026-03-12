
import mongoose from "mongoose";
import { InvoiceModel, ProductModel, StoreModel, CompanyModel } from "../database";
import { buildInvoiceItems, calculateDiscount, generateStoreInvoiceNumber } from "../helper";

export const createInvoiceService = async (invoiceData: any, user: any) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      items,
      customerName,
      customerMobile,
      paymentMethod,
      companyId,
      discount = 0,
      discountType = "FIXED",
    } = invoiceData;

    const storeId = user.stores?.[0];
    if (!storeId) throw new Error("NO_STORE_ASSIGNED");

    const [store, company] = await Promise.all([
      StoreModel.findById(storeId).session(session),
      CompanyModel.findById(companyId).session(session),
    ]);

    if (!store) throw new Error("STORE_NOT_FOUND");
    if (!company) throw new Error("COMPANY_NOT_FOUND");

    const gstType = store.gstType || "IGST";
    const gstRate = store.defaultGstRate || 18;

    const productIds = items.map((i: any) => i.productId);

    const products = await ProductModel.find({
      _id: { $in: productIds },
      storeId,
      isDeleted: false,
    })
      .populate("category", "name")
      .session(session);

    if (products.length !== productIds.length) {
      throw new Error("SOME_PRODUCTS_NOT_FOUND");
    }

    const {
      invoiceItems,
      subTotal,
      gstTotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
    } = buildInvoiceItems(items, products, gstType, gstRate);

    const discountAmount = calculateDiscount(subTotal, discount, discountType);

    const taxableAmount = subTotal - discountAmount;
    const grandTotal = taxableAmount + gstTotal;

    const { storeInvoiceNumber, displayNumber } =
      await generateStoreInvoiceNumber(storeId);

    const [invoice] = await InvoiceModel.create(
      [
        {
          invoiceNumber: displayNumber,
          storeInvoiceNumber,
          storeId,
          companyId,
          customerName,
          customerMobile,
          items: invoiceItems,
          subTotal,
          gstTotal,
          cgstTotal,
          sgstTotal,
          igstTotal,
          gstType,
          grandTotal,
          discount: discountAmount,
          discountType,
          discountValue: discount,
          paymentMethod,
          paymentStatus: paymentMethod === "CASH" ? "PAID" : "UNPAID",
          createdBy: user.userId,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return InvoiceModel.findById(invoice._id)
      .populate("storeId", "name")
      .populate("companyId", "name gstNumber")
      .populate("createdBy", "ownerName email");

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getAllInvoicesService = async (user: any, queryParams: any) => {
  const { page = 1, limit = 10, search = "", storeId, sortBy = "createdAt", order = "desc" } = queryParams;

  const query: any = { isDeleted: false };

  if (user.role !== "ADMIN") {
    query.storeId = user.stores[0];
  }

  if (storeId) query.storeId = storeId;

  if (search) {
    query.$or = [
      { invoiceNumber: { $regex: search, $options: "i" } },
      { customerName: { $regex: search, $options: "i" } },
    ];
  }

  const total = await InvoiceModel.countDocuments(query);

  const sortOption: any = {
    [sortBy]: order === "asc" ? 1 : -1
  };

  const invoices = await InvoiceModel.find(query)
    .populate("storeId", "name")
    .populate("companyId", "name gstNumber")
    .populate("createdBy", "ownerName email")
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  return {
    data: invoices,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  };
};

export const getInvoiceByIdService = async (id: string, user: any) => {
  const invoice = await InvoiceModel.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate({
      path: "storeId",
      select: "name"
    })
    .populate({
      path: "companyId",
      select: "name gstNumber"
    })
    .populate({
      path: "createdBy",
      select: "ownerName email"
    })
    .lean();

  if (!invoice) return null;

  // Permission check
  if (user.role !== "ADMIN") {
    // const storeId = invoice.storeId as any;
    // if (storeId._id.toString() !== user.stores[0].toString()) {
      const storeObj = invoice.storeId as any;
if (storeObj && storeObj._id && storeObj._id.toString() !== user.stores[0].toString()) {
      throw new Error("FORBIDDEN");
    }
  }

  return invoice;
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
        if (invoice.createdBy.toString() !== user.userId) {
          throw new Error("FORBIDDEN");
        }
      }

      // No stock to revert since product doesn't have stock

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
    if (invoice.createdBy.toString() !== user.userId) {
      throw new Error("FORBIDDEN");
    }
  }

  invoice.status = "CANCELLED";
  await invoice.save();

  return invoice;
};

export const updateInvoiceService = async (id: string, updateData: any, user: any) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const invoice = await InvoiceModel.findOne({
      _id: id,
      isDeleted: false,
    }).session(session);

    if (!invoice) return null;

    if (user.role !== "ADMIN" && invoice.createdBy.toString() !== user.userId) {
      throw new Error("FORBIDDEN");
    }

    const store = await StoreModel.findById(invoice.storeId).session(session);
    if (!store) throw new Error("STORE_NOT_FOUND");

    const gstType = store.gstType || "IGST";
    const gstRate = store.defaultGstRate || 18;

    if (updateData.items) {
      const productIds = updateData.items.map((i: any) => i.productId);

      const products = await ProductModel.find({
        _id: { $in: productIds },
        storeId: invoice.storeId,
        isDeleted: false,
      })
        .populate("category", "name")
        .session(session);

      if (products.length !== productIds.length) {
        throw new Error("SOME_PRODUCTS_NOT_FOUND");
      }

      const {
        invoiceItems,
        subTotal,
        gstTotal,
        cgstTotal,
        sgstTotal,
        igstTotal,
      } = buildInvoiceItems(updateData.items, products, gstType, gstRate);

      invoice.items = invoiceItems;
      invoice.subTotal = subTotal;
      invoice.gstTotal = gstTotal;
      invoice.cgstTotal = cgstTotal;
      invoice.sgstTotal = sgstTotal;
      invoice.igstTotal = igstTotal;
      invoice.gstType = gstType;
    }

    if (updateData.discount !== undefined || updateData.discountType) {
      const discountValue = updateData.discount ?? invoice.discountValue ?? 0;
      const discountType = updateData.discountType ?? invoice.discountType;

      const discountAmount = calculateDiscount(invoice.subTotal, discountValue, discountType);

      invoice.discount = discountAmount;
      invoice.discountValue = discountValue;
      invoice.discountType = discountType;
    }

    if (updateData.customerName) invoice.customerName = updateData.customerName;
    if (updateData.customerMobile !== undefined) invoice.customerMobile = updateData.customerMobile;

    if (updateData.paymentMethod) {
      invoice.paymentMethod = updateData.paymentMethod;
      invoice.paymentStatus = updateData.paymentMethod === "CASH" ? "PAID" : "UNPAID";
    }

    if (updateData.status) invoice.status = updateData.status;

    const taxableAmount = invoice.subTotal - (invoice.discount || 0);
    invoice.grandTotal = taxableAmount + invoice.gstTotal;

    await invoice.save({ session });

    await session.commitTransaction();

    return InvoiceModel.findById(id)
      .populate("storeId", "name")
      .populate("companyId", "name gstNumber")
      .populate("createdBy", "ownerName email");

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};