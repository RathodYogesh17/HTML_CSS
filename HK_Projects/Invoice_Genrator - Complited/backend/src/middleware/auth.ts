import jwt from "jsonwebtoken";
import { Response , Request, NextFunction } from "express";

export interface authRequest extends Request {
  user?: {
    userId: string;
    role: "ADMIN" | "USER";
    stores?: string[];
  };
}

export const verifyToken = async (req: authRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      stores: decoded.stores
    };
    next()
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
