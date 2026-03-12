import { Response, NextFunction } from "express";
import { authRequest } from "./auth";

export const isAdmin = (req: authRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

export const isUser = (req: authRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "USER") {
    return res.status(403).json({ message: "User access only" });
  }
  next();
};
