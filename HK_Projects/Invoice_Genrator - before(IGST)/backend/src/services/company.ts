import { CompanyModel, ProductModel } from "../database/models";

export const createCompanyService = async (data: any, user: any) => {
  if (user.role !== "ADMIN") {
    if (!user.stores?.includes(data.storeId)) {
      throw new Error("FORBIDDEN");
    }
  }

  const existing = await CompanyModel.findOne({
    name: data.name,
    storeId: data.storeId,
    isDeleted: false
  });

  if (existing) throw new Error("ALREADY_EXISTS");

  return await CompanyModel.create({
    ...data,
    isActive: true,
    isDeleted: false,
    createdBy: user.userId 
  });
};

export const getAllCompaniesService = async (user: any, queryParams: any) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    order = "desc",
    storeId
  } = queryParams;

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);

  const query: any = { isDeleted: false };

  if (user.role !== "ADMIN") {
    query.storeId = { $in: user.stores };
  }

  if (storeId) {
    query.storeId = storeId;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { gstNumber: { $regex: search, $options: "i" } }
    ];
  }

  const sortOption: any = {};
  sortOption[sortBy] = order === "asc" ? 1 : -1;

  const total = await CompanyModel.countDocuments(query);

  const companies = await CompanyModel.find(query)
    .populate("storeId", "name")
    .populate("createdBy", "ownerName email") 
    .sort(sortOption)
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber)
    .lean();

  return {
    data: companies,
    total,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(total / limitNumber)
  };
};


export const getCompanyByIdService = async (id: string, user: any) => {
  const company = await CompanyModel.findOne({
    _id: id,
    isDeleted: false
  })
    .populate("storeId", "name")
    .populate("createdBy", "ownerName email");

  if (!company) return null;

  if (
    user.role !== "ADMIN" &&
    !user.stores?.includes(company.storeId._id.toString())
  ) {
    throw new Error("FORBIDDEN");
  }

  return company;
};

export const updateCompanyService = async (
  id: string,
  updateData: any,
  user: any
) => {
  const company = await CompanyModel.findOne({
    _id: id,
    isDeleted: false
  });
  if (!company) return null;
  if (
    user.role !== "ADMIN" &&
    !user.stores?.includes(company.storeId.toString())
  ) {
    throw new Error("FORBIDDEN");
  }
  if (user.role !== "ADMIN" && company.createdBy.toString() !== user.userId) {
    throw new Error("FORBIDDEN");
  }
  return await CompanyModel.findByIdAndUpdate(id, updateData, {
    new: true
  })
    .populate("storeId", "name")
    .populate("createdBy", "ownerName email");
};



export const deleteCompanyService = async (id: string, user: any) => {
  const company = await CompanyModel.findOne({
    _id: id,
    isDeleted: false
  });

  if (!company) return null;

  if (
    user.role !== "ADMIN" &&
    !user.stores?.includes(company.storeId.toString())
  ) {
    throw new Error("FORBIDDEN");
  }

  if (user.role !== "ADMIN" && company.createdBy.toString() !== user.userId) {
    throw new Error("FORBIDDEN");
  }

  company.isDeleted = true;
  company.deletedAt = new Date();
  await company.save();

  return company;
};


export const getMyCompaniesService = async (user: any) => {
  const filter: any = {
    isDeleted: false
  };

  if (user.role !== "ADMIN") {
    filter.storeId = { $in: user.stores };
  }

  const companies = await CompanyModel.find(filter)
    .select("_id name email phone gstNumber storeId")
    .populate("storeId", "name")
    .sort({ name: 1 })
    .lean();

  return companies;
};