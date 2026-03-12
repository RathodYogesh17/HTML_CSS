import { Router } from "express";
import { storeController } from "../controllers/medicalStore/store";
// import { verifyToken } from "../../middlewares/auth.middleware";

const router = Router();

// router.use(verifyToken);  // 🔥 enable after auth ready

router.post("/create-store", storeController.create);
router.get("/", storeController.getAll);
router.get("/:id", storeController.getById);
router.put("/:id", storeController.update);
router.delete("/:id", storeController.delete);


export { router as storeRouter };