// storeAPI.ts
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/store",
});

// Add token interceptor for protected routes
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types based on your IStore interface
export interface Store {
  _id: string;
  name: string;
  address: string;
  gstNumber: string;
  panNumber: string;
  email: string;
  mobile: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreResponse {
  message: string;
  data: Store | Store[];
}

export interface StoreListResponse {
  message: string;
  data: Store[];
}

// GET ALL STORES
export const getAllStores = async (params?: { page?: number; limit?: number }) => {
  try {
    const response = await API.get<StoreListResponse>("/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching stores:", error);
    throw error;
  }
};

// GET SINGLE STORE BY ID
export const getStoreById = async (id: string) => {
  try {
    const response = await API.get<StoreResponse>(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching store ${id}:`, error);
    throw error;
  }
};

// CREATE NEW STORE
export const createStore = async (storeData: Partial<Store>) => {
  try {
    const response = await API.post<StoreResponse>("/create-store", storeData);
    return response.data;
  } catch (error) {
    console.error("Error creating store:", error);
    throw error;
  }
};

// UPDATE STORE
export const updateStore = async (id: string, storeData: Partial<Store>) => {
  try {
    const response = await API.put<StoreResponse>(`/${id}`, storeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating store ${id}:`, error);
    throw error;
  }
};

// DELETE STORE (SOFT DELETE)
export const deleteStore = async (id: string) => {
  try {
    const response = await API.delete<StoreResponse>(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting store ${id}:`, error);
    throw error;
  }
};

// HELPER FUNCTION TO GET ACTIVE STORES ONLY
export const getActiveStores = async () => {
  try {
    const response = await getAllStores();
    if (response.data && Array.isArray(response.data)) {
      return {
        ...response,
        data: response.data.filter((store: Store) => store.isActive)
      };
    }
    return response;
  } catch (error) {
    console.error("Error fetching active stores:", error);
    throw error;
  }
};

// HELPER FUNCTION TO GET STORE OPTIONS FOR DROPDOWNS
export const getStoreOptions = async () => {
  try {
    const response = await getAllStores();
    if (response.data && Array.isArray(response.data)) {
      return response.data
        .filter((store: Store) => store.isActive)
        .map((store: Store) => ({
          value: store._id,
          label: store.name,
          email: store.email,
          mobile: store.mobile,
          address: store.address
        }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching store options:", error);
    return [];
  }
};

// SEARCH STORES
export const searchStores = async (searchTerm: string) => {
  try {
    const response = await getAllStores();
    if (response.data && Array.isArray(response.data)) {
      const filtered = response.data.filter((store: Store) => 
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.mobile.includes(searchTerm) ||
        store.gstNumber.includes(searchTerm) ||
        store.panNumber.includes(searchTerm)
      );
      return {
        ...response,
        data: filtered
      };
    }
    return response;
  } catch (error) {
    console.error("Error searching stores:", error);
    throw error;
  }
};

export const toggleStoreStatus = async (id: string, currentStatus: boolean) => {
  try {
    const response = await updateStore(id, { isActive: !currentStatus });
    return response;
  } catch (error) {
    console.error(`Error toggling store ${id} status:`, error);
    throw error;
  }
};