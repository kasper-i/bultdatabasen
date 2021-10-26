import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "index";

interface AuthState {
  firstName?: string;
  lastName?: string;
  authenticated: boolean;
}

const initialState: AuthState = {
  authenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      return initialState;
    },
    login: (
      state,
      action: PayloadAction<{ firstName?: string; lastName?: string }>
    ) => {
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.authenticated = true;
    },
  },
});

export const { login, logout } = authSlice.actions;

export const selectAuthenticated = (state: RootState) =>
  state.auth.authenticated;

export const selectFirstName = (state: RootState) => state.auth.firstName;

export default authSlice.reducer;
