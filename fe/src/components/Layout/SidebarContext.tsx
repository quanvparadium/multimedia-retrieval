import React, { createContext, useState } from "react";

export const SidebarContext = createContext({});

export default function SidebarProvider({ children }: ISidebarProviderProps) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return <SidebarContext.Provider value={{ isSidebarOpen, setSidebarOpen }}>
        {children}
    </SidebarContext.Provider>
}

interface ISidebarProviderProps {
    children: JSX.Element | JSX.Element[];
}
  