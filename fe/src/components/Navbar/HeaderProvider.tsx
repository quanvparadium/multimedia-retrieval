import React, { createContext, useState } from "react";

export const HeaderContext = createContext({});

export default function HeaderProvider({ children }: IHeaderProviderProps) {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <HeaderContext.Provider value={{ openMenu, setOpenMenu }}>{children}</HeaderContext.Provider>
  );
}

interface IHeaderProviderProps {
  children: JSX.Element | JSX.Element[];
}
