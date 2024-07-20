import { ReactNode, useEffect, useState } from "react";
import SidebarBackdrop from "./SidebarBackdrop";
import Header from "./Header";
import SidebarProvider from "./SidebarContext";
import HeaderProvider from "../Navbar/HeaderProvider";
import CustomSidebar from "./SideBar";
import { userApi } from "@/src/apis/user/user.api";
import { useAppDispatch } from "@/src/store/store";
import { useRouter } from "next/router";
import { setUser } from "@/src/store/user/userSlice";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps): JSX.Element {
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const getMySelf = async () => {
      try {
        const data: any = await userApi.getMe();
        dispatch(setUser(data.user));
      } catch (error) {
        router.push("/login");
      }
    };
    getMySelf();
  }, []);
  return (
    <div className="antialiased text-gray-900 bg-white">
      <div className="flex max-h-screen min-h-screen overflow-y-hidden bg-white">
        <SidebarProvider>
          <SidebarBackdrop />
          <CustomSidebar />
          <div className="flex flex-col flex-1 max-h-max overflow-hidden bg-sky-50 ">
            <HeaderProvider>
              <Header />
            </HeaderProvider>

            <div className="p-4 bg-white h-full overflow-scroll overflow-x-hidden">{children}</div>

            {/* Include footer partial here */}
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
