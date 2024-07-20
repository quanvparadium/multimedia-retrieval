import { fileSystemApi } from "@/src/apis/file-system/file-system.api";
import Files from "@/src/components/File/Files";
import Folders from "@/src/components/Folder/Folders";
import { useEffect, useState } from "react";
import { FiFileText, FiFolder } from "react-icons/fi";
import { IoMdSearch } from "react-icons/io";



export default function HomeScreen() {
    const [isFocused, setIsFocused] = useState(false);
    const [type, setType] = useState('file');
    const [fileSystems, setFileSystems] = useState(undefined);
    const types = ['file', 'folder'];

    const handleType = async (type: string) => {
        setType(type);
        const res = await fileSystemApi.getRecent(type);
        setFileSystems(res.data);
    };

    useEffect(() => {
        handleType(type);
    }, []);

    return <div className="mt-2">
        <div className="flex justify-center text-2xl">
            Welcome to Retrieval System
        </div>
        <div className="flex justify-center w-full mt-4 ">
            <div className={`items-center rounded-full px-3 py-2  max-w-[700px] space-x-2 md:flex-1 md:flex ${isFocused ? "bg-white shadow-2" : "bg-slate-200"}`}>
                <IoMdSearch size={23} className="mx-2 cursor-pointer" />
                <input
                    type="text"
                    placeholder="Search In Retrieval System"
                    className=" py-1 w-full  rounded-md bg-slate-200  border-0 outline-none focus:bg-white"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
            </div>
        </div>
        <div className="flex mt-5 items-center">
            <div className="font-medium">Suggested</div>
            <div className="ml-5 flex">
                <div className={`flex items-center justify-center border-[1px] w-[110px] rounded-l-2xl border-black px-4 py-1 cursor-pointer  ${type == 'file' ? 'bg-blue-200' : 'hover:bg-slate-200'}`} onClick={() => handleType('file')}>
                    <FiFileText size={16} />
                    <p className="ml-2">File</p>
                </div>
                <div className={`flex items-center justify-center border-[1px] w-[110px] rounded-r-2xl border-l-0 border-black px-4 py-1 cursor-pointer ${type == 'folder' ? 'bg-blue-200' : 'hover:bg-slate-200'}`} onClick={() => handleType('folder')}>
                    <FiFolder size={16} />
                    <p className="ml-2">Folder</p>
                </div>
            </div>
        </div>
        {fileSystems && <div className="mt-8">
            {type == 'file' && <Files files={fileSystems} />}
            {type == 'folder' && <Folders folders={fileSystems} />}
        </div>}
    </div>;

}