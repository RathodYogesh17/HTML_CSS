export const paginate = async ({
    model,
    query = {},
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
    populate = [],
  }: any) => {
  
    const skip = (page - 1) * limit;
  
    const total = await model.countDocuments(query);
  
    const data = await model
      .find(query)
      .populate(populate)
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
  
    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  };

  