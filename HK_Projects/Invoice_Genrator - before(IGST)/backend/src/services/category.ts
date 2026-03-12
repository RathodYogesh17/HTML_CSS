import { Category } from "../database";

export const createCategoryService = async (
  name: string,
  description: string,
  user: any
) => {
  const storeId = user.stores[0];
  const formattedName = name.trim().toLowerCase();

  const existing = await Category.findOne({
    name: formattedName,
    storeId,
    isDeleted: false,
    createdBy: user.userId 
  });

  if (existing) {
    throw new Error("ALREADY_EXISTS");
  }

  return await Category.create({
    name: formattedName,
    description: description?.trim() || "",
    storeId,
    createdBy: user.userId 
  });
};


export const getAllCategoryService = async (
  user: any,
  queryParams: any
) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    order = "desc",
  } = queryParams;

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);

  const query: any = { isDeleted: false };

  if (search) {
    query.name = { $regex: search.trim(), $options: "i" };
  }

  if (user.role !== "ADMIN") {
    query.storeId = user.stores[0];
    
  }

  const sortOption: any = {
    [sortBy]: order === "asc" ? 1 : -1
  };

  const total = await Category.countDocuments(query);

  const categories = await Category.find(query)
  .populate("createdBy", "ownerName email")  
  .populate("storeId", "name")
  .sort(sortOption)
  .skip((pageNumber - 1) * limitNumber)
  .limit(limitNumber);

  return {
    data: categories,
    total,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(total / limitNumber),
  };
};

export const getCategoryByIdService = async (
  id: string,
  user: any
) => {
  const category = await Category.findOne({
    _id: id,
    isDeleted: false
  })
  .populate("createdBy", "ownerName email")
  .populate("storeId", "name");

  if (!category) {
    return null;
  }

  if (user.role === "ADMIN") {
    return category;
  }

  if (category.storeId.toString() !== user.stores[0].toString()) {
    throw new Error("FORBIDDEN");
  }

  return category;
};


export const updateCategoryService = async (
  id: string,
  updateData: any,
  user: any
) => {
  const updatePayload: any = { ...updateData };

  if (updateData.name) {
    updatePayload.name = updateData.name.trim().toLowerCase();
  }

  const category = await Category.findOne({
    _id: id,
    isDeleted: false
  });

  if (!category) {
    return null;
  }

  if (user.role !== "ADMIN") {
    if (category.createdBy.toString() !== user.userId) {
      throw new Error("FORBIDDEN");
    }
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    updatePayload,
    { new: true }
  )
  .populate("createdBy", "ownerName email") 
  .populate("storeId", "name"); 

  return updatedCategory;
};

export const deleteCategoryService = async (
  id: string,
  user: any
) => {
  const category = await Category.findOne({
    _id: id,
    isDeleted: false
  });

  if (!category) {
    return null;
  }

  if (user.role !== "ADMIN") {
    if (category.createdBy.toString() !== user.userId) {
      throw new Error("FORBIDDEN");
    }
  }

  category.isDeleted = true;
  category.deletedAt = new Date();
  await category.save();

  return category;
};