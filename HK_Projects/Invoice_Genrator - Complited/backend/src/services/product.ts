
import { CompanyModel, ProductModel , Category} from "../database";
import { checkOwnership, checkStoreAccess, populateProduct } from "../helper";


// export const createProductService = async (body: any, user: any) => {
//   const storeId = user.stores[0];
//   const createdBy = user.userId;

//   const category = await Category.findOne({
//     _id: body.category,
//     storeId: storeId,
//     isDeleted: false
//   });

//   if (!category) {
//     throw new Error("CATEGORY_NOT_FOUND");
//   }

//   const company = await CompanyModel.findOne({
//     _id: body.companyId,
//     isDeleted: false
//   });

//   if (!company) {
//     throw new Error("COMPANY_NOT_FOUND");
//   }

//   const existing = await ProductModel.findOne({
//     storeId,
//     name: body.name.toLowerCase(),
//     isDeleted: false
//   });

//   if (existing) {
//     throw new Error("PRODUCT_ALREADY_EXISTS");
//   }

//   const newProduct = await ProductModel.create({
//     name: body.name.toLowerCase(),
//     category: body.category,
//     companyId: body.companyId,
//     storeId,
//     createdBy
//   });

//   return await ProductModel.findById(newProduct._id)
//     .populate("category", "name")
//     .populate("companyId", "name gstNumber")
//     .populate("createdBy", "ownerName email");
// };

// export const getSingleProductService = async (id: string, user: any) => {
//   const filter: any = {
//     _id: id,
//     isDeleted: false
//   };

//   if (user.role !== "ADMIN") {
//     if (!user.stores || user.stores.length === 0) {
//       return null;
//     }
//     filter.storeId = { $in: user.stores };
//   }

//   const product = await ProductModel.findOne(filter)
//     .populate("category", "name")
//     .populate("companyId", "name gstNumber")
//     .populate("createdBy", "ownerName email");

//   return product;
// };

// export const getAllProductService = async (query: any, user: any) => {
//   const page = Number(query.page) || 1;
//   const limit = Number(query.limit) || 10;
//   const search = query.search || "";
//   const sortBy = query.sortBy || "createdAt";
//   const order = query.order === "asc" ? 1 : -1;
//   const skip = (page - 1) * limit;

//   const filter: any = { isDeleted: false };

//   if (search) {
//     filter.name = { $regex: search, $options: "i" };
//   }

//   if (user.role !== "ADMIN") {
//     if (!user.stores || user.stores.length === 0) {
//       return {
//         total: 0,
//         page,
//         totalPages: 0,
//         products: []
//       };
//     }
//     filter.storeId = { $in: user.stores };
//   }

//   const total = await ProductModel.countDocuments(filter);

//   const products = await ProductModel.find(filter)
//     .populate("category", "name")
//     .populate("companyId", "name gstNumber")
//     .populate("createdBy", "ownerName email")
//     .sort({ [sortBy]: order })
//     .skip(skip)
//     .limit(limit)
//     .lean();

//   return {
//     total,
//     page,
//     totalPages: Math.ceil(total / limit),
//     products
//   };
// };

// export const updateProductService = async (id: string, body: any, user: any) => {
//   const product = await ProductModel.findOne({
//     _id: id,
//     isDeleted: false
//   });

//   if (!product) return null;

//   if (user.role !== "ADMIN") {
//     if (product.createdBy.toString() !== user.userId) {
//       throw new Error("ACCESS_DENIED");
//     }
//     if (!user.stores || !user.stores.includes(product.storeId.toString())) {
//       throw new Error("ACCESS_DENIED");
//     }
//   }

//   if (body.category) {
//     const category = await Category.findOne({
//       _id: body.category,
//       storeId: product.storeId,
//       isDeleted: false
//     });
//     if (!category) {
//       throw new Error("CATEGORY_NOT_FOUND");
//     }
//   }

//   if (body.companyId) {
//     const company = await CompanyModel.findOne({
//       _id: body.companyId,
//       isDeleted: false
//     });
//     if (!company) {
//       throw new Error("COMPANY_NOT_FOUND");
//     }
//   }

//   if (body.name && body.name.toLowerCase() !== product.name) {
//     const existing = await ProductModel.findOne({
//       storeId: product.storeId,
//       name: body.name.toLowerCase(),
//       _id: { $ne: id },
//       isDeleted: false
//     });
//     if (existing) {
//       throw new Error("PRODUCT_ALREADY_EXISTS");
//     }
//   }

//   const updateData: any = {};
//   if (body.name) updateData.name = body.name.toLowerCase();
//   if (body.category) updateData.category = body.category;
//   if (body.companyId) updateData.companyId = body.companyId;

//   const updatedProduct = await ProductModel.findByIdAndUpdate(
//     id,
//     updateData,
//     { new: true }
//   )
//     .populate("category", "name")
//     .populate("companyId", "name gstNumber")
//     .populate("createdBy", "ownerName email");

//   return updatedProduct;
// };

// // Delete product
// export const deleteProductService = async (id: string, user: any) => {
//   const product = await ProductModel.findOne({
//     _id: id,
//     isDeleted: false
//   });

//   if (!product) return null;

//   if (user.role !== "ADMIN") {
//     if (product.createdBy.toString() !== user.userId) {
//       throw new Error("ACCESS_DENIED");
//     }
//   }

//   product.isDeleted = true;
//   product.deletedAt = new Date();
//   await product.save();

//   return product;
// };

// export const getMyProductsService = async (user: any) => {
//   const filter: any = { isDeleted: false };

//   if (user.role !== "ADMIN") {
//     filter.storeId = { $in: user.stores };
//   }

//   const products = await ProductModel.find(filter)
//     .select("_id name category companyId")
//     .populate("category", "name")
//     .populate("companyId", "name")
//     .sort({ name: 1 })
//     .lean();

//   return products;
// };


export const createProductService = async (body: any, user: any) => {

  const storeId = user.stores[0];

  const [category, company] = await Promise.all([
    Category.findOne({
      _id: body.category,
      storeId,
      isDeleted: false
    }),
    CompanyModel.findOne({
      _id: body.companyId,
      isDeleted: false
    })
  ]);

  if (!category) throw new Error("CATEGORY_NOT_FOUND");
  if (!company) throw new Error("COMPANY_NOT_FOUND");

  const name = body.name.toLowerCase();

  const existing = await ProductModel.findOne({
    storeId,
    name,
    isDeleted: false
  });

  if (existing) throw new Error("PRODUCT_ALREADY_EXISTS");

  const product = await ProductModel.create({
    name,
    category: body.category,
    companyId: body.companyId,
    storeId,
    createdBy: user.userId
  });

  return populateProduct(ProductModel.findById(product._id));
};

export const getSingleProductService = async (id: string, user: any) => {

  const filter: any = {
    _id: id,
    isDeleted: false
  };

  if (user.role !== "ADMIN") {
    filter.storeId = { $in: user.stores };
  }

  return populateProduct(ProductModel.findOne(filter));
};


export const getAllProductService = async (query: any, user: any) => {

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: any = { isDeleted: false };

  if (query.search) {
    filter.name = { $regex: query.search, $options: "i" };
  }

  if (user.role !== "ADMIN") {
    filter.storeId = { $in: user.stores };
  }

  const total = await ProductModel.countDocuments(filter);

  const products = await populateProduct(
    ProductModel.find(filter)
      .sort({ [query.sortBy || "createdAt"]: query.order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
  ).lean();

  return {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    products
  };
};


export const updateProductService = async (id: string, body: any, user: any) => {

  const product = await ProductModel.findOne({
    _id: id,
    isDeleted: false
  });

  if (!product) return null;

  checkOwnership(user, product.createdBy);
  checkStoreAccess(user, product.storeId);

  if (body.category) {

    const category = await Category.findOne({
      _id: body.category,
      storeId: product.storeId,
      isDeleted: false
    });

    if (!category) throw new Error("CATEGORY_NOT_FOUND");
  }

  if (body.companyId) {

    const company = await CompanyModel.findOne({
      _id: body.companyId,
      isDeleted: false
    });

    if (!company) throw new Error("COMPANY_NOT_FOUND");
  }

  if (body.name) {

    const name = body.name.toLowerCase();

    const existing = await ProductModel.findOne({
      storeId: product.storeId,
      name,
      _id: { $ne: id },
      isDeleted: false
    });

    if (existing) throw new Error("PRODUCT_ALREADY_EXISTS");

    product.name = name;
  }

  if (body.category) product.category = body.category;
  if (body.companyId) product.companyId = body.companyId;

  await product.save();

  return populateProduct(ProductModel.findById(id));
};

export const deleteProductService = async (id: string, user: any) => {

  const product = await ProductModel.findOne({
    _id: id,
    isDeleted: false
  });

  if (!product) return null;

  checkOwnership(user, product.createdBy);

  product.isDeleted = true;
  product.deletedAt = new Date();

  await product.save();

  return product;
};

export const getMyProductsService = async (user: any) => {

  const filter: any = { isDeleted: false };

  if (user.role !== "ADMIN") {
    filter.storeId = { $in: user.stores };
  }

  return ProductModel.find(filter)
    .select("_id name category companyId")
    .populate("category", "name")
    .populate("companyId", "name")
    .sort({ name: 1 })
    .lean();
};