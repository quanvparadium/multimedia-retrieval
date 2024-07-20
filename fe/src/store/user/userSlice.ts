import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

const initialState = {
  user: undefined,
};

export const infoSlice = createSlice({
  name: "info",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { setUser } = infoSlice.actions;

export const getUser = (state: RootState) => state.info.user;

export default infoSlice.reducer;
