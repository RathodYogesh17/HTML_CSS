

import express from "express";
import { validate } from "../middleware";
import { invoiceController } from "../controllers";
import { createInvoiceSchema, updateInvoiceSchema } from "../validation";

const router = express.Router();

router.post("/",validate(createInvoiceSchema), invoiceController.createInvoice);
router.get("/",invoiceController.getAllInvoices);
router.get("/:id", invoiceController.getInvoiceById);
router.put("/:id",validate(updateInvoiceSchema),invoiceController.updateInvoice);
router.delete("/:id", invoiceController.deleteInvoice);

export { router as invoiceRouter };