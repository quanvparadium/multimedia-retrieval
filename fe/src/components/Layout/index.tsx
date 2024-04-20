import { ReactNode, useState } from "react";
import CustomSidebar from "./Sidebar";
import SidebarBackdrop from "./SidebarBackdrop";
import Navbar from "../Navbar/Navbar";
import Header from "./Header";
import SidebarProvider from "./SidebarContext";
import HeaderProvider from "../Navbar/HeaderProvider";
interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps): JSX.Element {
  return (
    <div className="antialiased text-gray-900 bg-white">
      <div
        className="flex h-screen overflow-y-hidden bg-white"
      >
        <SidebarProvider>
            <SidebarBackdrop/>
            <CustomSidebar/>
            <div className="flex flex-col flex-1 h-full overflow-hidden bg-sky-50">
                <HeaderProvider>
                    <Header/>
                </HeaderProvider>

                <div className="p-4">
                  {children}
                </div>

                { /* Include footer partial here */ }
            </div> 
        </SidebarProvider>
      </div>
    </div>
  );
}
