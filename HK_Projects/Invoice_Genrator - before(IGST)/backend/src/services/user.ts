import bcrypt from "bcryptjs";
import { generateToken } from "../helper";
import { UserModel } from "../database";
import { sendOTPEmail } from "../helper/sendMail";


export const createUserService = async (payload: any, file?: any) => {
  const existingUser = await UserModel.findOne({
    email: payload.email,
    isDeleted: false,
  });

  if (existingUser) throw new Error("USER_EXISTS");

  const hashedPassword = await bcrypt.hash(payload.password, 10);

const user = new UserModel({
  ...payload, 
  password: hashedPassword,
  profileImage: file?.path || null,
});

  await user.save();

  const token = generateToken(user);

  const safeUser = await UserModel.findById(user._id).select("-password");

  return {
    user: safeUser,
    token,
  };
};

export const getAllUsersService = async () => {
  return UserModel.find({ isDeleted: false })
    .select("-password")
    .populate('stores', 'storeName address mobileNumber')  
    .sort({ createdAt: -1 });
};

export const getSingleUserService = async (id: string) => {
  return UserModel.findOne({ _id: id, isDeleted: false })
    .select("-password")
    .populate('stores', 'storeName address mobileNumber');
};


export const loginUserService = async (email: string, password: string) => {
  const user = await UserModel.findOne({
    email,
    isDeleted: false,
  }).select("+password");

  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  if (!user.isActive) throw new Error("User is inactive");

  const token = generateToken(user);

  const safeUser = await UserModel.findById(user._id).select("-password");

  return {
    user: safeUser,
    token,
  };
};

export const getProfileService = async (userId: string) => {
  return UserModel.findOne({
    _id: userId,
    isDeleted: false,
  }).select("-password");
};

export const updateUserService = async (
  loggedUser: any,
  targetUserId: string,
  payload: any
) => {
  if (loggedUser.role !== "ADMIN" && loggedUser.userId !== targetUserId) {
    throw new Error("FORBIDDEN");
  }

  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, 10);
  }

  return UserModel.findOneAndUpdate(
    { _id: targetUserId, isDeleted: false },
    payload,
    { new: true }
  ).select("-password");
};

export const deleteUserService = async (
  loggedUser: any,
  targetUserId: string
) => {
  if (loggedUser.role !== "ADMIN" && loggedUser.userId !== targetUserId) {
    throw new Error("FORBIDDEN");
  }

  const user = await UserModel.findById(targetUserId);
  if (!user) return null;

  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();

  return user;
};


export const toggleActiveService = async (id: string) => {
  const user = await UserModel.findOne({ _id: id, isDeleted: false });
  if (!user) throw new Error("User not found");

  user.isActive = !user.isActive;
  await user.save();

  return user;
};





export const forgotPasswordService = async (email: string) => {
  const user = await UserModel.findOne({ 
    email: email.toLowerCase(), 
    isDeleted: false 
  });
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordOTP = otp;
  user.resetPasswordExpire = new Date(Date.now() + 5 * 60 * 1000);
  await user.save();
  try {
    await sendOTPEmail(user.email, otp);
  } catch (error) {
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    throw new Error("FAILED_TO_SEND_EMAIL");
  }
  return { message: "OTP sent successfully" };
};



export const verifyOTPService = async (email: string, otp: string) => {
  const user = await UserModel.findOne({ 
    email: email.toLowerCase(), 
    isDeleted: false 
  }).select("+resetPasswordOTP +resetPasswordExpire");

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (!user.resetPasswordOTP || !user.resetPasswordExpire) {
    throw new Error("OTP_NOT_REQUESTED");
  }

  if (user.resetPasswordExpire < new Date()) {
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    throw new Error("OTP_EXPIRED");
  }

  if (user.resetPasswordOTP !== otp) {
    throw new Error("INVALID_OTP");
  }

  return { message: "OTP verified successfully" };
};

export const resetPasswordService = async (email: string, otp: string, newPassword: string) => {
  const user = await UserModel.findOne({ 
    email: email.toLowerCase(), 
    isDeleted: false 
  }).select("+password +resetPasswordOTP +resetPasswordExpire");
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  if (!user.resetPasswordOTP || !user.resetPasswordExpire) {
    throw new Error("OTP_NOT_REQUESTED");
  }
  if (user.resetPasswordExpire < new Date()) {
    throw new Error("OTP_EXPIRED");
  }
  if (user.resetPasswordOTP !== otp) {
    throw new Error("INVALID_OTP");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.resetPasswordOTP = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return { message: "Password reset successfully" };
};