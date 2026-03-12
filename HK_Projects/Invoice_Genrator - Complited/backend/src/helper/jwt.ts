import jwt from "jsonwebtoken";

export const generateToken = (user: any) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      stores: user.stores || []
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );
};