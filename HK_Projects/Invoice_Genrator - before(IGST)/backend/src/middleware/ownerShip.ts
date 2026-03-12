import { Response, NextFunction } from "express";
import { ProductModel } from "../database/models";
import { authRequest } from "./auth";

export const ownProductOnly = async (req: authRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const productId = req.params.id;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.role === "ADMIN") {
      return next();
    }
    
    const product = await ProductModel.findOne({
      _id: productId,
      storeId: { $in: user.stores }
    });

    if (!product) {
      return res.status(403).json({ message: "Access denied (not your product)" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Ownership check failed" });
  }
};
