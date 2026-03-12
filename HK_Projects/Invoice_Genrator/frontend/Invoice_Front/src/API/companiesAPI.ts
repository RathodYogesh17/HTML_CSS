import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/company", 
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.request.use(
  (config) => {
    console.log(` ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || config.params);
    return config;
  },
  (error) => {console.error(" Request Error:", error);
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {console.log(" Response:", response.data);
    return response;
  },
  (error) => { console.error(" Response Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);


export const addCompany = async (data: any) => {
  try {
    console.log(" Adding company with data:", data);
    const res = await API.post("/", data);
    console.log(" Company added:", res.data);
    return res.data.data;
  } catch (error) {
    console.error(" Error adding company:", error);
    throw error;
  }
};

export const getAllCompanies = async (params: any) => {
  try {
    const query = new URLSearchParams(params).toString();
    console.log(" Fetching companies with params:", params);
    const res = await API.get(`/?${query}`);
    console.log(" Companies fetched:", res.data);
    return res.data.data;
  } catch (error) {
    console.error(" Error fetching companies:", error);
    throw error;
  }
};

export const getCompanyById = async (id: string) => {
  try {
    console.log(" Fetching company with ID:", id);
    const res = await API.get(`/${id}`);
    console.log(" Company fetched:", res.data);
    return res.data.data;
  } catch (error) {
    console.error(" Error fetching company:", error);
    throw error;
  }
};

export const updateCompany = async (id: string, data: any) => {
  try {
    console.log(" Updating company:", id, "with data:", data);
    const res = await API.put(`/${id}`, data);
    console.log(" Company updated:", res.data);
    return res.data.data;
  } catch (error) {
    console.error(" Error updating company:", error);
    throw error;
  }
};

export const deleteCompany = async (id: string) => {
  try {
    console.log(" Deleting company:", id);
    const res = await API.delete(`/${id}`);
    console.log(" Company deleted:", res.data);
    return res.data;
  } catch (error) {
    console.error(" Error deleting company:", error);
    throw error;
  }
};