import Image from "next/image";
import { useRouter } from "next/router";
import { FaSortDown } from "react-icons/fa";
import { FaGreaterThan } from "react-icons/fa6";
import base64 from "base-64";
export default function BreadCrumbs({ ancestorData }: IBreadCrumbs) {
  const router = useRouter();
  const sortFunc = (a: any, b: any) => b.layer - a.layer;
  if (ancestorData) {
    ancestorData.sort(sortFunc);
    ancestorData[0].name = "My Drive";
  }
  console.log(ancestorData);
  return (
    <div className="flex -ml-4">
      {ancestorData && ancestorData.map((ancestor: any, index) => {
        return (
          <div className="flex items-center">
            <div
              className="text-2xl/[24px] flex text-gray-700 py-2 hover:cursor-pointer hover:bg-gray-200 px-4 rounded-3xl"
              onDoubleClick={(e) => {
                e.preventDefault();
                if (index == 0) router.push("/my-drive");
                else {
                  router.push(`/folders/${ancestor._id}`);
                }
              }}
            >
              {ancestor.name}
              {ancestorData.length - 1 == index && <FaSortDown size={20} className="ml-2" />}
            </div>
            {!(ancestorData.length - 1 == index) && (
              <FaGreaterThan size={14} className="mt-1 mx-2 font-bold" fontSize={600} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export interface IBreadCrumbs {
  ancestorData: any[];
}
