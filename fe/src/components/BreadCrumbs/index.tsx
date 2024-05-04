import Image from "next/image";
import { useRouter } from "next/router";
import { FaSortDown } from "react-icons/fa";
import { FaGreaterThan } from "react-icons/fa6";
import base64 from "base-64";
export default function BreadCrumbs({ path }: IBreadCrumbs) {
  const router = useRouter();
  const names = path.split("/");
  return (
    <div className="flex -ml-4">
      {names.map((name, index) => {
        return (
          <div className="flex items-center">
            <div
              className="text-2xl/[24px] flex text-gray-700 py-2 hover:cursor-pointer hover:bg-gray-200 px-4 rounded-3xl"
              onDoubleClick={(e) => {
                e.preventDefault();
                if (index == 0) router.push("/my-drive");
                else {
                  const nextPath = names.slice(1, index + 1).join("/");
                  const encodedPath = base64.encode(nextPath);
                  router.push(`/folders/${encodedPath}`);
                }
              }}
            >
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
