import express from "express";
import { addUserSchema, loginUserSchema, updateUserSchema } from "../validation";
import { userController } from "../controllers";
import { upload, validate, verifyToken } from "../middleware";

const router = express.Router();

router.post("/login", validate(loginUserSchema), userController.loginUser);
router.post("/addUser", 
  upload.single("profileImage"), 
  validate(addUserSchema),
  userController.addUser
);

router.post("/forgot-password", userController.forgotPassword);
router.post("/verify-otp", userController.verifyOTP);
router.post("/reset-password", userController.resetPassword);

router.use(verifyToken);

router.get("/me", userController.getProfile);
router.put("/me", validate(updateUserSchema), userController.updateUser);
router.delete("/me", userController.deleteUser);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getSingleUser);
router.put("/:id", validate(updateUserSchema), userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.patch("/:id/toggle", userController.toggleActive);

export { router as userRouter };