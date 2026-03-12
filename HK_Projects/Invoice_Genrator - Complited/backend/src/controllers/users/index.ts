import { STATUS_CODE, responseMessage } from "../../common";
import { errorResponse, successResponse } from "../../helper";
import { Request, Response } from "express";
import { authRequest } from "../../middleware";
import { userService } from "../../services";
import { forgotPasswordService, resetPasswordService, verifyOTPService } from "../../services/user";


export const addUser = async (req: any, res: Response) => {
  try {
    console.log("Received payload:", req.body);  
    console.log("Received file:", req.file);     
    
    const data = await userService.createUserService(req.body, req.file);

    return successResponse(
      res,
      responseMessage.addDataSuccess("user"),
      data,
      STATUS_CODE.CREATED
    );
  } catch (error: any) {
    console.error("Error in addUser:", error);  
    
    if (error.message === "USER_EXISTS") {
      return errorResponse(
        res,
        responseMessage.dataAlreadyExist("User"),
        STATUS_CODE.BAD_REQUEST
      );
    }

    return errorResponse(
      res,
      error.message || responseMessage.internalServerError,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
};

// ✅ UPDATED: Get all users controller
export const getAllUsers = async (req: authRequest, res: Response) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return errorResponse(
        res,
        responseMessage.accessDenied,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const users = await userService.getAllUsersService();
    
    // Debug: Check if stores are populated
    console.log("Users with stores:", users.map(u => ({
      id: u._id,
      stores: u.stores
    })));

    return successResponse(
      res,
      responseMessage.getDataSuccess("users"),
      users,
      STATUS_CODE.SUCCESS
    );
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return errorResponse(
      res,
      responseMessage.internalServerError,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
};



export const loginUser = async (req: Request, res: Response) => {
  try {
    const data = await userService.loginUserService(
      req.body.email,
      req.body.password
    );

    return successResponse(res, "Login successful", data, STATUS_CODE.SUCCESS);
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || "Invalid credentials",
      STATUS_CODE.UNAUTHORIZED
    );
  }
};

export const getProfile = async (req: authRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, "Unauthorized", STATUS_CODE.UNAUTHORIZED);
    }

    const user = await userService.getProfileService(req.user.userId);

    if (!user) {
      return errorResponse(
        res,
        responseMessage.getDataNotFound("user"),
        STATUS_CODE.NOT_FOUND
      );
    }

    return successResponse(
      res,
      responseMessage.getDataSuccess("user"),
      user,
      STATUS_CODE.SUCCESS
    );
  } catch {
    return errorResponse(
      res,
      responseMessage.internalServerError,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
};

export const updateUser = async (req: authRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, "Unauthorized", STATUS_CODE.UNAUTHORIZED);
    }

    const user = await userService.updateUserService(
      req.user,
      req.params.id,
      req.body
    );

    if (!user) {
      return errorResponse(
        res,
        responseMessage.getDataNotFound("user"),
        STATUS_CODE.NOT_FOUND
      );
    }

    return successResponse(
      res,
      responseMessage.updateDataSuccess("user"),
      user,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || responseMessage.accessDenied,
      STATUS_CODE.UNAUTHORIZED
    );
  }
};

export const deleteUser = async (req: authRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, "Unauthorized", STATUS_CODE.UNAUTHORIZED);
    }

    const deleted = await userService.deleteUserService(
      req.user,
      req.params.id
    );

    if (!deleted) {
      return errorResponse(
        res,
        responseMessage.getDataNotFound("user"),
        STATUS_CODE.NOT_FOUND
      );
    }

    return successResponse(
      res,
      responseMessage.deleteDataSuccess("user"),
      null,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || responseMessage.accessDenied,
      STATUS_CODE.UNAUTHORIZED
    );
  }
};


export const getSingleUser = async (req: authRequest, res: Response) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return errorResponse(
        res,
        responseMessage.accessDenied,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const user = await userService.getSingleUserService(req.params.id);

    if (!user) {
      return errorResponse(
        res,
        responseMessage.getDataNotFound("user"),
        STATUS_CODE.NOT_FOUND
      );
    }

    return successResponse(
      res,
      responseMessage.getDataSuccess("user"),
      user,
      STATUS_CODE.SUCCESS
    );
  } catch {
    return errorResponse(
      res,
      responseMessage.internalServerError,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
};

export const toggleActive = async (req: authRequest, res: Response) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return errorResponse(
        res,
        responseMessage.accessDenied,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const user = await userService.toggleActiveService(req.params.id);

    return successResponse(
      res,
      "User status updated successfully",
      user,
      STATUS_CODE.SUCCESS
    );
  } catch {
    return errorResponse(
      res,
      responseMessage.internalServerError,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
};





// FORGOT PASSWORD CONTROLLER
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(
        res,
        "Email is required",
        STATUS_CODE.BAD_REQUEST
      );
    }

    await forgotPasswordService(email);

    return successResponse(
      res,
      "OTP sent successfully to your email",
      null,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);

    if (error.message === "USER_NOT_FOUND") {
      return errorResponse(
        res,
        "No account found with this email",
        STATUS_CODE.NOT_FOUND
      );
    }

    if (error.message === "FAILED_TO_SEND_EMAIL") {
      return errorResponse(
        res,
        "Failed to send OTP. Please try again later",
        STATUS_CODE.INTERNAL_SERVER_ERROR
      );
    }

    return errorResponse(
      res,
      responseMessage.internalServerError,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return errorResponse(
        res,
        "Email and OTP are required",
        STATUS_CODE.BAD_REQUEST
      );
    }

    await verifyOTPService(email, otp);

    return successResponse(
      res,
      "OTP verified successfully",
      null,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    console.error("Verify OTP error:", error);

    if (error.message === "USER_NOT_FOUND") {
      return errorResponse(
        res,
        "User not found",
        STATUS_CODE.NOT_FOUND
      );
    }

    if (error.message === "OTP_NOT_REQUESTED") {
      return errorResponse(
        res,
        "Please request OTP first",
        STATUS_CODE.BAD_REQUEST
      );
    }

    if (error.message === "OTP_EXPIRED") {
      return errorResponse(
        res,
        "OTP has expired. Please request a new one",
        STATUS_CODE.BAD_REQUEST
      );
    }

    if (error.message === "INVALID_OTP") {
      return errorResponse(
        res,
        "Invalid OTP. Please try again",
        STATUS_CODE.BAD_REQUEST
      );
    }

    return errorResponse(
      res,
      responseMessage.internalServerError,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return errorResponse(
        res,
        "Email, OTP, and new password are required",
        STATUS_CODE.BAD_REQUEST
      );
    }

    if (newPassword.length < 6) {
      return errorResponse(
        res,
        "Password must be at least 6 characters",
        STATUS_CODE.BAD_REQUEST
      );
    }

    await resetPasswordService(email, otp, newPassword);

    return successResponse(
      res,
      "Password reset successfully",
      null,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    console.error("Reset password error:", error);

    if (error.message === "USER_NOT_FOUND") {
      return errorResponse(
        res,
        "User not found",
        STATUS_CODE.NOT_FOUND
      );
    }

    if (error.message === "OTP_NOT_REQUESTED") {
      return errorResponse(
        res,
        "Please verify OTP first",
        STATUS_CODE.BAD_REQUEST
      );
    }

    if (error.message === "OTP_EXPIRED") {
      return errorResponse(
        res,
        "OTP has expired. Please request a new one",
        STATUS_CODE.BAD_REQUEST
      );
    }

    if (error.message === "INVALID_OTP") {
      return errorResponse(
        res,
        "Invalid OTP",
        STATUS_CODE.BAD_REQUEST
      );
    }

    return errorResponse(
      res,
      responseMessage.internalServerError,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
};