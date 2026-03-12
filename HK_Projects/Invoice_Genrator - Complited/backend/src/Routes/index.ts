import express from "express";
import { userRouter } from "./user";
import { productRouter } from "./product";
import { invoiceRouter } from "./invoice";
import { companyRouter } from "./company";
import { categoryRouter } from "./category";
import { verifyToken } from "../middleware";
import { storeRouter } from "./store";

const router = express.Router();

router.use("/users", userRouter);
router.use(verifyToken);
router.use("/product", productRouter);
router.use("/invoice", invoiceRouter);  
router.use("/company", companyRouter);
router.use("/category", categoryRouter);
router.use("/store", storeRouter);

export { router };