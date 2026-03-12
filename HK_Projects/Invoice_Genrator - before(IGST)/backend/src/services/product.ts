import { Category, ProductModel } from "../database";

export const createProductService = async (body: any, user: any) => {

  const storeId = user.stores[0]; 
  const createdBy = user.userId;

  const category = await Category.findOne({
    _id: body.category,
    isDeleted: false
  });

  if (!category) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  const existing = await ProductModel.findOne({
    storeId,
    name: body.name.toLowerCase(),
    batchNo: body.batchNo,
    isDeleted: false
  });

  if (existing) {
    throw new Error("PRODUCT_ALREADY_EXISTS");
  }

  const newProduct = await ProductModel.create({
    ...body,
    name: body.name.toLowerCase(),
    storeId,
    createdBy
  });

  
  return newProduct;
};

export const getSingleProductService = async (id: string, user: any) => {
  const filter: any = {
    _id: id,
    isDeleted: false
  };

  // For non-admin users, filter by store ID
  if (user.role !== "ADMIN") {
    if (!user.stores || user.stores.length === 0) {
      return null;
    }
    filter.storeId = { $in: user.stores };
  }

  console.log("Get single product filter:", filter);
  console.log("User making request:", {
    userId: user.userId,
    role: user.role,
    stores: user.stores
  });

  const product = await ProductModel.findOne(filter)
    .populate("category", "name")
    .populate("storeId", "name") 
    .populate("createdBy", "ownerName email");

  console.log("Found product:", product ? "Yes" : "No");
  if (product) {
    console.log("Product createdBy:", product.createdBy);
    console.log("Product storeId:", product.storeId);
  }

  return product;
};

export const getAllProductService = async (query: any, user: any) => {
 
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const search = query.search || "";
  const sortBy = query.sortBy || "createdAt";
  const order = query.order === "asc" ? 1 : -1;
  const skip = (page - 1) * limit;

  const filter: any = { isDeleted: false };

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  if (user.role !== "ADMIN") {
    if (!user.stores || user.stores.length === 0) {
      console.log("User has no stores!");
      return {
        total: 0,
        page,
        totalPages: 0,
        products: []
      };
    }
    
    filter.storeId = { $in: user.stores }; 
  }


  const total = await ProductModel.countDocuments(filter);

  const products = await ProductModel.find(filter)
    .populate("category", "name")
    .populate("storeId", "name")
    .populate("createdBy", "ownerName email")
    .sort({ [sortBy]: order })
    .skip(skip)
    .limit(limit)
    .lean();

  
  

  return {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    products
  };
};

export const updateProductService = async (
  id: string,
  body: any,
  user: any
) => {
  // First find the product
  const product = await ProductModel.findOne({
    _id: id,
    isDeleted: false
  });

  if (!product) return null;

  // Check permissions
  console.log("Permission check - User:", {
    userId: user.userId,
    role: user.role,
    productCreatedBy: product.createdBy.toString(),
    productStoreId: product.storeId.toString(),
    userStores: user.stores
  });

  if (user.role === "ADMIN") {
    console.log("Admin user - allowing update");
  } 
  else {
    if (product.createdBy.toString() !== user.userId) {
      console.log("Permission denied - user didn't create this product");
      throw new Error("ACCESS_DENIED");
    }
    
    if (!user.stores || !user.stores.includes(product.storeId.toString())) {
      console.log("Permission denied - user doesn't have access to this store");
      throw new Error("ACCESS_DENIED");
    }
  }

  if (body.category) {
    const category = await Category.findOne({
      _id: body.category,
      isDeleted: false
    });
    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND");
    }
  }

  const updateData = { ...body };
  delete updateData.storeId; // Prevent store change
  delete updateData.createdBy; // Prevent creator change
  delete updateData._id; // Prevent ID change

  console.log("Updating product with data:", updateData);

  // Update the product
  const updatedProduct = await ProductModel.findOneAndUpdate(
    { _id: id },
    updateData,
    { new: true, runValidators: true }
  )
    .populate("category", "name")
    .populate("storeId", "name")
    .populate("createdBy", "ownerName email");

  return updatedProduct;
};

export const deleteProductService = async (id: string, user: any) => {
  const filter: any = {
    _id: id,
    isDeleted: false
  };

  const product = await ProductModel.findOne(filter);
  if (!product) return null;

  if (user.role !== "ADMIN") {
    if (product.createdBy.toString() !== user.userId) {
      throw new Error("ACCESS_DENIED");
    }
  }

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

  const products = await ProductModel.find(filter)
    .select("_id name rate stock category")
    .populate("category", "name")
    .sort({ name: 1 })
    .lean();

  return products;
};