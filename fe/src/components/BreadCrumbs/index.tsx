import Image from "next/image";
import { FaSortDown } from "react-icons/fa";
import { FaGreaterThan } from "react-icons/fa6";
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
            {!(names.length - 1 == index) && (
              <FaGreaterThan size={14} className="mt-1 mx-2 font-bold" fontSize={600} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export interface IBreadCrumbs {
  path: string;
}
