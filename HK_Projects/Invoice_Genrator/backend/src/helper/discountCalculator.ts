export const calculateDiscount = (
    subTotal: number,
    discount: number,
    discountType: "FIXED" | "PERCENTAGE"
  ) => {
    let discountAmount = 0;
  
    if (discountType === "PERCENTAGE") {
      discountAmount = (subTotal * discount) / 100;
    } else {
      discountAmount = discount;
    }
  
    if (discountAmount > subTotal) {
      throw new Error("DISCOUNT_CANNOT_EXCEED_SUBTOTAL");
    }
  
    return discountAmount;
  };