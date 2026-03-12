import express from "express";
import { validate } from "../middleware";
import { companyController } from "../controllers";
import { addCompanySchema, updateCompanySchema } from "../validation";

const router = express.Router();

router.post("/", validate(addCompanySchema), companyController.createCompany);
router.get("/", companyController.getAllCompanies);
router.get("/my", companyController.getMyCompanies); 
router.get("/:id", companyController.getCompany);
router.put("/:id", validate(updateCompanySchema), companyController.updateCompany);
router.delete("/:id", companyController.deleteCompany);

export { router as companyRouter };