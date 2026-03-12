import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/category",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const addCategory = async (data: any) => {
  const res = await API.post("/", data);
  return res.data.data;
};

export const getAllCategories = async (params: any) => {
  const query = new URLSearchParams(params).toString();
  const res = await API.get(`/?${query}`);
  return res.data;  
};

export const getCategoryById = async (id: string) => {
  const res = await API.get(`/${id}`);
  return res.data.data;
};

export const updateCategory = async (id: string, data: any) => {
  const res = await API.put(`/${id}`, data);
  return res.data.data;
};

export const deleteCategory = async (id: string) => {
  const res = await API.delete(`/${id}`);
  return res.data;
};

