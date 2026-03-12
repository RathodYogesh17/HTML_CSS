import express from "express";
import { productController } from "../controllers";
import { addProductSchema, updateProductSchema } from "../validation";
import { validate } from "../middleware";

const router = express.Router();

router.get("/", productController.getAllProduct);
router.get("/myProducts", productController.getMyProducts); 
router.get("/:id", productController.getProduct);
router.delete("/:id", productController.deleteProduct);
router.post("/", validate(addProductSchema), productController.addProduct);
router.put("/:id", validate(updateProductSchema), productController.updateProduct);

export { router as productRouter };