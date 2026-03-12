
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

export interface InvoiceItemInput {
    productId: string;
    qty: number;
    rate: number;
    mrp: number;
}

export interface CreateInvoiceData {
    companyId: string;
    customerName: string;
    customerMobile?: string;
    paymentMethod: "CASH" | "CREDIT";
    discount?: number;
    discountType?: "FIXED" | "PERCENTAGE";
    items: InvoiceItemInput[];
}

export const createInvoice = async (data: CreateInvoiceData) => {
    const res = await API.post("/invoice", data);
    return res.data.data;
};

export const getAllInvoices = async (params: any) => {
    const query = new URLSearchParams(params).toString();
    const res = await API.get(`/invoice?${query}`);
    return res.data;
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

export const getInvoiceById = async (id: string) => {
    const response = await API.get(`/invoice/${id}`);
    return response.data;
};

export const updateInvoice = async (id: string, data: any) => {
    const response = await API.put(`/invoice/${id}`, data);
    return response.data;
};