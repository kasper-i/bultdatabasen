import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "index";

interface ClipboardState {
  pointId?: string;
}

const initialState: ClipboardState = {};

export const clipboardSlice = createSlice({
  name: "clipboard",
  initialState,
  reducers: {
    clear: (state) => {
      return initialState;
    },
    copy: (state, action: PayloadAction<{ pointId: string }>) => {
      state.pointId = action.payload.pointId;
    },
  },
});

export const { copy, clear } = clipboardSlice.actions;
export const selectPointId = (state: RootState) => state.clipboard.pointId;

export default clipboardSlice.reducer;
