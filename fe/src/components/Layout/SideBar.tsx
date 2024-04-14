import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BiFileFind } from "react-icons/bi";
import { CgHomeAlt } from "react-icons/cg";
import { FaRegFolderOpen } from "react-icons/fa";

export default function SideBar() {
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
    <div className="w-[300px] py-3 px-5 flex-shrink-0">
      {pages.map((page, index) => {
        return (
          <Link
            href={page.path}
            key={index}
            className={classNames("flex text-base hover:cursor-pointer items-center px-3 py-2 rounded-3xl ", {
              "bg-blue-200": index == pageIndex,
              "hover:bg-gray-200": index !== pageIndex,
            })}
          >
            <page.Icon size={20} />
            <div className="ml-2">{page.name}</div>
          </Link>
        );
      })}
    </div>
  );
}
