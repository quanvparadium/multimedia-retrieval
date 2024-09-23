import { baseURL } from "@/src/apis/axios-base";
import Image from "next/image";
import { FaImage } from "react-icons/fa";

export default function ImageComponent({ file }: any) {
    const url = `${baseURL}/api/media/images/${file._id}`;
    console.log(url);
    return <>
        <div className="flex font-medium text-lg text-white items-center bg-slate-600  py-2 px-3  ">
            <FaImage className="" color="orange" />
            <p className="ml-2"> {file.name}</p>
        </div>
        <Image src={url} alt="" height={2000} width={2000} className="w-auto" />
    </>;
};