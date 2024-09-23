import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { BiFileFind } from "react-icons/bi";
import { CgHomeAlt } from "react-icons/cg";
import { FaRegFolderOpen } from "react-icons/fa";
import Image from "next/image";
import { SidebarContext } from "./SidebarContext";
import { IoTrashOutline } from "react-icons/io5";
import { TiCloudStorageOutline } from "react-icons/ti";
import ProgressBar from "../ProgressBar";
import { fileSystemApi } from "@/src/apis/file-system/file-system.api";

export default function CustomSidebar() {
  const { isSidebarOpen, setSidebarOpen }: any = useContext(SidebarContext);
  const toggleSidbarMenu = () => {
    setSidebarOpen(!isSidebarOpen);
    // console.log(isSidebarOpen)
  };

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
    {
      path: "/trash",
      name: "Thùng rác",
      Icon: IoTrashOutline,
    },
    {
      path: "/storage",
      name: "Lưu trữ",
      Icon: TiCloudStorageOutline,
    },
  ];
  const [pageIndex, setPageIndex] = useState(0);
  useEffect(() => {
    const pathIndex = pages.findIndex((page) => page.path == router.pathname);
    setPageIndex(pathIndex);
  }, [router.pathname]);

  const [size, setSize] = useState(0);
  useEffect(() => {
    const getSize = async () => {
      const res = await fileSystemApi.getSize();
      setSize(Number((res.data / (1024 * 1024 * 1024))));
    };
    getSize();
  }, []);

  return (
    <aside
      className={classNames(
        "fixed px-2 inset-y-0 z-10 flex-col flex-shrink-0 w-64 max-h-screen overflow-hidden transition-all transform bg-sky-50 border-r shadow-lg lg:z-auto lg:static lg:shadow-none",
        {
          "-translate-x-full": !isSidebarOpen,
          "lg:translate-x-0": !isSidebarOpen,
          "lg:w-20": !isSidebarOpen,
        },
      )}
    >
      <div
        className={classNames(
          "flex items-center justify-between flex-shrink-0 p-4",
          // {"lg:justify-center": !isSidebarOpen}
        )}
      >
        <span className="flex-shrink-0 flex items-center font-medium text-xl text-gray-700">
          {/* <span className="p-2 text-xl font-semibold leading-8 tracking-wider uppercase whitespace-nowrap justify-center"> */}
          <Image className="w-8 h-8" src="/logo.svg" alt="logo" width={400} height={400} />
          <span className={classNames("ml-2", { "lg:hidden": !isSidebarOpen })}>
            Retrieval System
          </span>
        </span>
        <button
          onClick={() => toggleSidbarMenu()}
          className="p-2 rounded-md lg:hidden"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
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
              className={classNames(
                "flex items-center py-2 my-1 px-4 space-x-2 hover:bg-blue-100",
                {
                  "bg-blue-200": index == pageIndex,
                  "hover:bg-blue-100": index !== pageIndex,
                  "lg:justify-center": !isSidebarOpen,
                  "rounded-3xl": isSidebarOpen,
                  "rounded-md": !isSidebarOpen,
                  "mt-8": index % 3 == 0 && index / 3 > 0
                },
              )}
            >
              <page.Icon size={20} />
              <div className={classNames("ml-2", { "lg:hidden": !isSidebarOpen })}>{page.name}</div>
              {/* {page.name} */}
            </Link>
          );
        })}
      </span>

      {isSidebarOpen && <div className="py-2.5 my-1 px-4">
        <ProgressBar progress={size} max={2} />
        <p className="mt-1 text-gray-600">{size.toPrecision(1)} GB of 2GB used</p>
      </div>}
    </aside>
  );
}
