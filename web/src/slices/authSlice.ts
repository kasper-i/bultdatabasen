import { RootState } from "@/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  userId?: string;
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
    logout: () => {
      return initialState;
    },
    login: (
      state,
      action: PayloadAction<{ userId: string, firstName?: string; lastName?: string }>
    ) => {
      const {userId, firstName, lastName} = action.payload;
      state.userId = userId
      state.firstName = firstName;
      state.lastName = lastName;
      state.authenticated = true;
    },
  },
});

export const { login, logout } = authSlice.actions;

export const selectAuthenticated = (state: RootState) =>
  state.auth.authenticated;

export const selectFirstName = (state: RootState) => state.auth.firstName;

export const selectUserId = (state: RootState) => state.auth.userId;

export default authSlice.reducer;
