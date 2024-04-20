import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { BiFileFind } from "react-icons/bi";
import { CgHomeAlt } from "react-icons/cg";
import { FaRegFolderOpen } from "react-icons/fa";
import Image from "next/image";
import { CustomSidebarProps } from "./interface";
import { SidebarContext } from "./SidebarContext";

export default function CustomSidebar() {
    const { isSidebarOpen, setSidebarOpen }: any = useContext(SidebarContext)
    const toggleSidbarMenu = () => {
        setSidebarOpen(!isSidebarOpen)
        // console.log(isSidebarOpen)
    }

    const router = useRouter();
    const pages = [
      {
        path: "/",
        name: "Trang chủ",
        Icon: CgHomeAlt,
      },
      {
        path: "/query",
        name: "Query của tôi",
        Icon: BiFileFind,
      },
      {
        path: "/my-drive",
        name: "Quản lý dữ liệu",
        Icon: FaRegFolderOpen,
      },
    ];
    const [pageIndex, setPageIndex] = useState(0);
    useEffect(() => {
      const pathIndex = pages.findIndex((page) => page.path == router.pathname);
      console.log(pageIndex);
      setPageIndex(pathIndex);
    }, [router.pathname]);
    return (
        <aside className={classNames("fixed px-2 inset-y-0 z-10 flex-col flex-shrink-0 w-64 max-h-screen overflow-hidden transition-all transform bg-sky-50 border-r shadow-lg lg:z-auto lg:static lg:shadow-none",{
            "-translate-x-full": !isSidebarOpen,
            "lg:translate-x-0": !isSidebarOpen,
            "lg:w-20": !isSidebarOpen
        })}>
            <div className={classNames("flex items-center justify-between flex-shrink-0 p-4",
                // {"lg:justify-center": !isSidebarOpen}
            )}>
                <span className="flex-shrink-0 flex items-center font-medium text-xl text-gray-700">
                {/* <span className="p-2 text-xl font-semibold leading-8 tracking-wider uppercase whitespace-nowrap justify-center"> */}
                    <Image className="w-8 h-8" src="logo.svg" alt="logo" width={400} height={400} />
                    <span className={classNames("ml-2", {"lg:hidden": !isSidebarOpen})}>Retrieval System</span>
                </span>
                <button onClick={() => toggleSidbarMenu()} className="p-2 rounded-md lg:hidden" aria-label="Close">
                    <svg
                    className="w-6 h-6 text-gray-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

            </div>

            {/* Implement all routes */}
            <span className={classNames({})}>
                {pages.map((page, index) => {
                    return (
                        <Link
                            href={page.path}
                            key={index}
                            className={classNames("flex items-center py-2.5 my-1 px-4 space-x-2 hover:bg-blue-100", {
                            "bg-blue-200": index == pageIndex,
                            "hover:bg-blue-100": index !== pageIndex,
                            "lg:justify-center": !isSidebarOpen,
                            "rounded-3xl": isSidebarOpen,
                            "rounded-md": !isSidebarOpen,
                            })}
                        >
                            <page.Icon size={24} />
                            <div className={classNames("ml-2", {"lg:hidden": !isSidebarOpen})}>
                                {page.name}
                            </div>
                            {/* {page.name} */}
                        </Link>
                    );
                })}
            </span>

        </aside>
    );
  }