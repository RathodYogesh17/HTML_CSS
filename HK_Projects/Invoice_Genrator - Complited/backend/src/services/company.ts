import { CompanyModel } from "../database/models";
import { SortOrder } from "mongoose";

const checkStorePermission = (storeId: string, user: any) => {
  if (user.role !== "ADMIN" && !user.stores?.includes(storeId)) {
    throw new Error("FORBIDDEN");
  }
};



export const createCompanyService = async (data: any, user: any) => {
  checkStorePermission(data.storeId, user);

  const exists = await CompanyModel.exists({
    name: data.name.trim(),
    storeId: data.storeId, isDeleted: false
  });

  if (exists) throw new Error("ALREADY_EXISTS");
  return CompanyModel.create({
    ...data, name: data.name.trim(), isActive: true, isDeleted: false, createdBy: user.userId
  });
};

export const getAllCompaniesService = async (user: any, queryParams: any) => {
  const { page = 1, limit = 10, search = "", sortBy = "createdAt", order = "desc", storeId
  } = queryParams;

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const query: any = { isDeleted: false };

  if (user.role !== "ADMIN") {query.storeId = { $in: user.stores };}
  if (storeId) query.storeId = storeId;

  if (search) {
    query.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { email: { $regex: search.trim(), $options: "i" } },
      { phone: { $regex: search.trim(), $options: "i" } },
      { gstNumber: { $regex: search.trim(), $options: "i" } }
    ];
  }

  const sortOption: Record<string, SortOrder> = { [sortBy]: order === "asc" ? 1 : -1 };

  const [companies, total] = await Promise.all([
    CompanyModel.find(query)
      .populate("storeId", "name")
      .populate("createdBy", "ownerName email")
      .sort(sortOption)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean(),

    CompanyModel.countDocuments(query)
  ]);

  return {
    data: companies, total, page: pageNumber,  limit: limitNumber, totalPages: Math.ceil(total / limitNumber)
  };
};

export const getCompanyByIdService = async (id: string, user: any) => {
  const company = await CompanyModel.findOne({
    _id: id,
    isDeleted: false
  })
    .populate("storeId", "name")
    .populate("createdBy", "ownerName email")
    .lean();
  if (!company) return null;
  checkStorePermission(company.storeId._id.toString(), user);
  return company;
};

export const updateCompanyService = async ( id: string, updateData: any,user: any) => {
  const company = await CompanyModel.findOne({
    _id: id,isDeleted: false
  });

  if (!company) return null;
  checkStorePermission(company.storeId.toString(), user);

  if (updateData.name) { updateData.name = updateData.name.trim(); }

  return CompanyModel.findByIdAndUpdate(id, updateData, { new: true })
    .populate("storeId", "name")
    .populate("createdBy", "ownerName email");
};

export const deleteCompanyService = async (id: string, user: any) => {
  const company = await CompanyModel.findOne({ _id: id,isDeleted: false
  });

  if (!company) return null;
  checkStorePermission(company.storeId.toString(), user);
  company.isDeleted = true;
  company.deletedAt = new Date();
  await company.save();
  return company;
};

export const getMyCompaniesService = async (user: any) => {
  const filter: any = { isDeleted: false };
  if (user.role !== "ADMIN") {
    filter.storeId = { $in: user.stores };
  }

  return CompanyModel.find(filter)
    .select("_id name email phone gstNumber storeId")
    .populate("storeId", "name")
    .sort({ name: 1 })
    .lean();
};