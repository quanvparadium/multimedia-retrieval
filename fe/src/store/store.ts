import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./count/countSlice";

const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

export default store;
