import { createSlice } from "@reduxjs/toolkit";

interface User {
  _id: string;
  role: string;
  medicalStoreName: string;
  ownerName: string;
  email: string;
  mobileNumber: string;
  address: string;
  gstNumber?: string;
  profileImage?: string;
  isActive: boolean;
  isApproved: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token") || null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;

      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
