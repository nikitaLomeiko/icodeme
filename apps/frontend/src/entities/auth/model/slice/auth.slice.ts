import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IAuthData, IAuthState } from "../types";
const initialState: IAuthState = {
  isAuthenticated: null,
  user: { id: "", email: "" },
};
export const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<IAuthData>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setUserId: (state, action: PayloadAction<string>) => {
      state.user.id = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = { id: "", email: "" };
    },
  },
});
export const { setAuthData, setUserId, logout } = AuthSlice.actions;
export const authSliceReducer = AuthSlice.reducer;
