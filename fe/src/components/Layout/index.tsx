import { ReactNode } from "react";
import Header from "./Header";
import SideBar from "./SideBar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps): JSX.Element {
  return (
    <div className="bg-slate-100 h-screen flex flex-col">
      <Header />
      <div className="flex flex-grow">
        <SideBar />
        <div className="bg-white flex-grow rounded-xl py-5 px-7">{children}</div>
      </div>
    </div>
  );
}
