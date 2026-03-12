

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/users",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {config.headers.Authorization = `Bearer ${token}`}
  return config;
});

export const getAllUsers = async () => {
  try {
    const res = await API.get("/");
    console.log("API Response:", res.data); 
    
    if (res.data?.data?.users) {
      return res.data.data.users; 
    } else if (res.data?.data) {
      return res.data.data; 
    } else if (Array.isArray(res.data)) {
      return res.data; 
    } else {
      return []; 
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; 
  }
};

export const toggleUserActive = async (id: string) => {
  try {
    const res = await API.patch(`/${id}/toggle`);
    return res.data;
  } catch (error) {
    console.error("Error toggling user status:", error);
    throw error;
  }
};

export const deleteUserByAdmin = async (id: string) => {
  try {
    const res = await API.delete(`/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const getProfile = async () => {
  const res = await API.get("/me");
  return res.data;
};


export const updateUserByAdmin = async (id: string, data: any) => {
  const res = await API.put(`/${id}`, data);
  return res.data;
};


export const updateProfile = async (data: any) => {
  const res = await API.put("/me", data);
  return res.data;
};


export const deleteProfile = async () => {
  const res = await API.delete("/me");
  return res.data;
};


export const getSingleUser = async (id: string) => {
  const res = await API.get(`/${id}`);
  return res.data.data; 
};


export const createUserByAdmin = async (formData: any) => {
  const res = await API.post("/addUser", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

