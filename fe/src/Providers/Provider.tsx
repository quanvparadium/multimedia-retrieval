import React from "react";
import { Provider } from "react-redux";
import store from "../store/store";

const Providers: React.FC<React.PropsWithChildren<{ children: React.ReactNode }>> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

export default Providers;
