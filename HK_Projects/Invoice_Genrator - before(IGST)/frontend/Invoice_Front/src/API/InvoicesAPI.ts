import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api", // Change this to base API URL
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const createInvoice = async (data: any) => {
    const res = await API.post("/invoice", data);
    return res.data.data;
};

export const getAllInvoices = async (params: any) => {
    const query = new URLSearchParams(params).toString();
    const res = await API.get(`/invoice?${query}`);
    return res.data;
  };

export const getInvoiceById = async (id: string) => {
    const res = await API.get(`/invoice/${id}`);
    return res.data;
};

export const updateInvoice = async (id: string, data: any) => {
    const res = await API.put(`/invoice/${id}`, data);
    return res.data.data;
};

export const deleteInvoice = async (id: string) => {
    const res = await API.delete(`/invoice/${id}`);
    return res.data;
};

export const getMyCompanies = async () => {
    const res = await API.get("/company/my");
    return res.data.data;
};
export const getMyProducts = async () => {
    const response = await API.get("/product/myProducts");
    return response.data.data;
  };