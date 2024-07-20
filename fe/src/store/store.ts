import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./count/countSlice";
import infoReducer from "./user/userSlice";
import { useDispatch, useSelector } from "react-redux";

const store = configureStore({
  reducer: {
    counter: counterReducer,
    info: infoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export default store;
