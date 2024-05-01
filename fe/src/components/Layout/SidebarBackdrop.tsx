import { useContext } from "react";
import { SidebarContext } from "./SidebarContext";

export default function SidebarBackdrop() {
  const { isSidebarOpen, setSidebarOpen }: any = useContext(SidebarContext);
  return isSidebarOpen ? (
    <div className="fixed inset-0 z-10 bg-black bg-opacity-20 lg:hidden backdrop-blur-lg"></div>
  ) : null;
}
