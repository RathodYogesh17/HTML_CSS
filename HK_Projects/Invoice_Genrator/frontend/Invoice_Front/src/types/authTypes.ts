export interface User {
    id: string;
    email: string;
    role: "USER" | "ADMIN";
  }
  
  export interface AuthState {
    user: User | null;
    token: string | null;
  }
  

  export interface Product  {
  
    name: string;
    category: string;
  
    batchNo: string;
    expiry: Date;
  
    mrp: number;
    rate: number;
  
    stock: number;
    gstPercent: number;
  
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  