import { Category } from "../database";
import { SortOrder } from "mongoose";


const formatName = (name: string) => name?.trim().toLowerCase();

const checkPermission = (category: any, user: any) => {
  if (user.role !== "ADMIN" && category.createdBy.toString() !== user.userId) {
    throw new Error("FORBIDDEN");
  }
};


export const createCategoryService = async ( name: string,description: string,user: any) => {
  const storeId = user.stores?.[0];
  const formattedName = formatName(name);
  const exists = await Category.exists({
    name: formattedName,storeId,createdBy: user.userId, isDeleted: false,
  });
  if (exists) throw new Error("ALREADY_EXISTS");
  return Category.create({
    name: formattedName,  description: description?.trim() || "", storeId, createdBy: user.userId,
  });
};



export const getAllCategoryService = async (user: any, queryParams: any) => {
  const { page = 1, limit = 10,search = "",  sortBy = "createdAt", order = "desc", } = queryParams;
  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const query: any = { isDeleted: false };
  if (search) {
    query.name = { $regex: search.trim(), $options: "i" };}
  if (user.role !== "ADMIN") {
    query.storeId = user.stores?.[0];}
  const sortOption: Record<string, SortOrder> = {
    [sortBy]: order === "asc" ? 1 : -1
  };
  const [categories, total] = await Promise.all([
    Category.find(query)
      .populate("createdBy", "ownerName email")
      .populate("storeId", "name")
      .sort(sortOption)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
  
    Category.countDocuments(query),
  ]);
  return { data: categories, total, page: pageNumber, limit: limitNumber, totalPages: Math.ceil(total / limitNumber), };
};



export const getCategoryByIdService = async (id: string, user: any) => {
  const category = await Category.findOne({
    _id: id, isDeleted: false,
  })
    .populate("createdBy", "ownerName email")
    .populate("storeId", "name");
  if (!category) return null;
  if (user.role !== "ADMIN" && category.storeId.toString() !== user.stores?.[0]?.toString()
  ) { throw new Error("FORBIDDEN");}
  return category;
};



export const updateCategoryService = async (id: string, updateData: any, user: any) => {
  const category = await Category.findOne({
    _id: id,isDeleted: false,
  });
  if (!category) return null;
  checkPermission(category, user);
  if (updateData.name) {
    updateData.name = formatName(updateData.name);
  }
  return Category.findByIdAndUpdate(id, updateData, { new: true })
    .populate("createdBy", "ownerName email")
    .populate("storeId", "name");
};


export const deleteCategoryService = async (id: string, user: any) => {
  const category = await Category.findOne({
    _id: id, isDeleted: false,
  });
  if (!category) return null;
  checkPermission(category, user);
  category.isDeleted = true;
  category.deletedAt = new Date();
  await category.save();
  return category;
};