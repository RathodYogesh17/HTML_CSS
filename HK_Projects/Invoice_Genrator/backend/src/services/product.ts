
import { CompanyModel, ProductModel , Category} from "../database";
import { checkOwnership, checkStoreAccess, populateProduct } from "../helper";

export const createProductService = async (body: any, user: any) => {

  const storeId = user.stores[0];

  const [category, company] = await Promise.all([
    Category.findOne({_id: body.category,storeId, isDeleted: false}),
    CompanyModel.findOne({ _id: body.companyId, isDeleted: false})
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
  const filter: any = { _id: id, isDeleted: false};

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
    filter.name = { $regex: query.search, $options: "i" }}

  if (user.role !== "ADMIN") {
    filter.storeId = { $in: user.stores }}

  const total = await ProductModel.countDocuments(filter);
  const products = await populateProduct(
    ProductModel.find(filter)
      .sort({ [query.sortBy || "createdAt"]: query.order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
  ).lean();

  return { total, page, totalPages: Math.ceil(total / limit),products };
};



export const updateProductService = async (id: string, body: any, user: any) => {
  const product = await ProductModel.findOne({ _id: id, isDeleted: false});

  if (!product) return null;
  checkOwnership(user, product.createdBy);
  checkStoreAccess(user, product.storeId);

  if (body.category) {
    const category = await Category.findOne({ _id: body.category, storeId: product.storeId, isDeleted: false});
    if (!category) throw new Error("CATEGORY_NOT_FOUND");}

  if (body.companyId) {
    const company = await CompanyModel.findOne({ _id: body.companyId, isDeleted: false});
    if (!company) throw new Error("COMPANY_NOT_FOUND"); }

  if (body.name) {
    const name = body.name.toLowerCase();
    const existing = await ProductModel.findOne({storeId: product.storeId,name, _id: { $ne: id }, isDeleted: false});
    if (existing) throw new Error("PRODUCT_ALREADY_EXISTS");
    product.name = name }

  if (body.category) product.category = body.category;
  if (body.companyId) product.companyId = body.companyId;
  await product.save();
  return populateProduct(ProductModel.findById(id));
};


export const deleteProductService = async (id: string, user: any) => {
  const product = await ProductModel.findOne({ _id: id, isDeleted: false});

  if (!product) return null;
  checkOwnership(user, product.createdBy);

  product.isDeleted = true;
  product.deletedAt = new Date();

  await product.save();
  return product;
};



export const getMyProductsService = async (user: any) => {
  const filter: any = { isDeleted: false };

  if (user.role !== "ADMIN") { filter.storeId = { $in: user.stores } }

  return ProductModel.find(filter)
    .select("_id name category companyId")
    .populate("category", "name")
    .populate("companyId", "name")
    .sort({ name: 1 })
    .lean();
};