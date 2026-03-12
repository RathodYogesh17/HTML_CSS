import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllProducts = async ({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "createdAt",
  order = "desc",
}: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: string;
}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
    sortBy,
    order,
  });

  const res = await API.get(`/product?${params.toString()}`);
  return res.data;
};

export const getSingleProduct = async (id: string) => {
  try {
    const res = await API.get(`/product/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  const res = await API.delete(`/product/${id}`);
  return res.data;
};

export const updateProduct = async (id: string, data: any) => {
  const res = await API.put(`/product/${id}`, data);
  return res.data;
};

export const addProduct = async (productData: any) => {
  const res = await API.post(`/product`, productData);
  return res.data;
};