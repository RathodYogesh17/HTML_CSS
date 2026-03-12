import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/store",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Store {
  _id: string;
  name: string;
  address: string;
  gstNumber: string;
  panNumber: string;
  email: string;
  mobile: string;
  gstType: "IGST" | "CGST_SGST";
  defaultGstRate: number;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreResponse {
  message: string;
  data: Store;
}

export interface StoreListResponse {
  message: string;
  data: {
    stores: Store[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const getAllStores = async (params?: { 
  page?: number; 
  limit?: number; 
  search?: string;
  sortBy?: string;
  order?: string;
}) => {
  try {
    const response = await API.get<StoreListResponse>("/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching stores:", error);
    throw error;
  }
};

export const getStoreById = async (id: string) => {
  try {
    const response = await API.get<StoreResponse>(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching store ${id}:`, error);
    throw error;
  }
};

export const createStore = async (storeData: Partial<Store>) => {
  try {
    const response = await API.post<StoreResponse>("/create-store", storeData);
    return response.data;
  } catch (error) {
    console.error("Error creating store:", error);
    throw error;
  }
};

export const updateStore = async (id: string, storeData: Partial<Store>) => {
  try {
    const response = await API.put<StoreResponse>(`/${id}`, storeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating store ${id}:`, error);
    throw error;
  }
};

export const deleteStore = async (id: string) => {
  try {
    const response = await API.delete<StoreResponse>(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting store ${id}:`, error);
    throw error;
  }
};

export const getActiveStores = async () => {
  try {
    const response = await getAllStores();
    if (response.data && response.data.stores) {
      return {...response,data: {
                  ...response.data, stores: response.data.stores.filter((store: Store) => store.isActive) }
      };
    }
    return response;
  } catch (error) { console.error("Error fetching active stores:", error);
    throw error;
  }
};

export const getStoreOptions = async () => {
  try {
    const response = await getAllStores({ limit: 100 });
    if (response.data && response.data.stores) {
      return response.data.stores
        .filter((store: Store) => store.isActive)
        .map((store: Store) => ({
          value: store._id,
          label: store.name,
          email: store.email,
          mobile: store.mobile,
          address: store.address,
          gstNumber: store.gstNumber,
          panNumber: store.panNumber,
          gstType: store.gstType,
          defaultGstRate: store.defaultGstRate
        }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching store options:", error);
    return [];
  }
};

export const searchStores = async (searchTerm: string) => {
  try {
    const response = await getAllStores({ search: searchTerm, limit: 100 });
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