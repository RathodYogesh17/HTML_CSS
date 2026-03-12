import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: any, property: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(", "),
      });
    }

    next();
  };