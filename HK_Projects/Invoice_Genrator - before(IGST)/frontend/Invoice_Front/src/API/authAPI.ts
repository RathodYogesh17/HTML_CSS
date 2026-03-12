// authAPI.ts
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Remove any default token interceptor for auth routes

export const registerUser = async (userData: any) => {
  try {
    console.log("Sending registration data:", userData);
    
    const response = await API.post("/users/addUser", userData, {
      headers: { 
        "Content-Type": "application/json",
      },
    });
    
    console.log("Registration response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await API.post("/users/login", {
      email: email.toLowerCase().trim(),
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};


export const forgotPassword = async (email: string) => {
  const response = await API.post(`/users/forgot-password`, { email });
  return response.data;
};

export const verifyOTP = async (email: string, otp: string) => {
  const response = await API.post(`/users/verify-otp`, { email, otp });
  return response.data;
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const response = await API.post(`/users/reset-password`, {
    email,
    otp,
    newPassword,
  });
  return response.data;
};