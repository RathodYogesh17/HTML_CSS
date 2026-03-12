

import express from "express";
import { validate } from "../middleware";
import { categoryController } from "../controllers";
import { addCategorySchema, updateCategorySchema } from "../validation";

const router = express.Router();

router.post("/",validate(addCategorySchema),categoryController.addCategory);
router.get("/",categoryController.getAllCategory);
router.get("/:id",categoryController.getCategory);
router.put("/:id",validate(updateCategorySchema),categoryController.updateCategory);
router.delete("/:id",categoryController.deleteCategory);

export { router as categoryRouter };