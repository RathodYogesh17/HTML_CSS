export const checkStoreAccess = (user: any, storeId: object) => {
    if (user.role === "ADMIN") return;
  
    if (!user.stores || !user.stores.includes(storeId.toString())) {
      throw new Error("ACCESS_DENIED");
    }
  };
  
  export const checkOwnership = (user: any, createdBy: object) => {
    if (user.role === "ADMIN") return;
  
    if (createdBy.toString() !== user.userId) {
      throw new Error("ACCESS_DENIED");
    }
  };


  export const populateProduct = (query: any) => {
    return query
      .populate("category", "name")
      .populate("companyId", "name gstNumber")
      .populate("createdBy", "ownerName email");
  };