import Image from "next/image";
import { LiaGreaterThanSolid } from "react-icons/lia";
import { FaSortDown } from "react-icons/fa";

export default function BreadCrumbs({ path }: IBreadCrumbs) {
  const names = path.split("/");
  return (
    <div className="flex -ml-4">
      {names.map((name, index) => {
        return (
          <div className="flex items-center">
            <div className="text-2xl/[24px] flex text-gray-700 py-2 hover:cursor-pointer hover:bg-gray-200 px-4 rounded-3xl">
              {name}
              {names.length - 1 == index && <FaSortDown size={20} className="ml-2" />}
            </div>
            {!(names.length - 1 == index) && <LiaGreaterThanSolid size={23} className="mt-1 mx-2" />}
          </div>
        );
      })}
    </div>
  );
}

export interface IBreadCrumbs {
  path: string;
}
