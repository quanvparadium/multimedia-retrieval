import { MenuContext } from "@/src/Providers/MenuProvider";
import { useContext, useEffect, useState } from "react";
import { Listbox } from '@headlessui/react';
import { IoArrowDownSharp, IoArrowUpSharp, IoCaretDown } from "react-icons/io5";
import classNames from "classnames";
import { RiCloseLine, RiFolderVideoFill } from "react-icons/ri";
import ProgressBar from "@/src/components/ProgressBar";
import { fileSystemApi } from "@/src/apis/file-system/file-system.api";
import StorageFile from "./StorageFile";
// import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
const types = [
    { id: 1, name: 'Type' },
    { id: 2, name: 'Documents' },
    { id: 3, name: 'Videos' },
    { id: 4, name: 'Images' },
];

export default function StorageScreen() {
    const { openMenu, closeMenu, signal, emitSignal }: any = useContext(MenuContext);
    const [selectedPerson, setSelectedPerson] = useState(types[0]);
    const [direction, setDirection] = useState(-1);
    const [page, setPage] = useState(1);
    const [data, setData]: any = useState([]);

    useEffect(() => {
        const getTopFiles = async () => {
            const params: any = { page, ord: direction };
            if (selectedPerson.id != 1) params.fileType = selectedPerson.name.toLowerCase().slice(0, -1);
            const res = await fileSystemApi.getTopFiles(params);
            console.log(res.data);
            setData(res.data);
        };
        getTopFiles();
    }, [direction, selectedPerson]);

    const [size, setSize] = useState(0);
    useEffect(() => {
        const getSize = async () => {
            const res = await fileSystemApi.getSize();
            setSize(Number((res.data / (1024 * 1024 * 1024))));
        };
        getSize();
    }, []);

    return (<div className="h-full" onClick={closeMenu} >
        <div className="text-2xl/[24px] py-2">
            Storage
        </div>
        <div className="mt-5">
            <Listbox value={selectedPerson} onChange={setSelectedPerson}>
                <div className="flex items-stretch h-8">
                    <Listbox.Button className={classNames({
                        "relative font-medium text-slate-600 px-4 py-[4px] border-[1px] border-black rounded-xl flex items-center": true,
                        "bg-sky-100 rounded-r-none pr-2 border-none": selectedPerson.id != 1
                    })}>{selectedPerson.name}
                        <IoCaretDown size={10} className="ml-3" />
                    </Listbox.Button>
                    {
                        selectedPerson.id != 1 &&
                        <div className="flex items-center w-8 rounded-r-xl justify-center bg-sky-100 hover:bg-sky-200 cursor-pointer ml-[1px] aspect-square"
                            onClick={() => setSelectedPerson(types[0])}><RiCloseLine /></div>
                    }
                </div>
                <Listbox.Options className={"absolute bg-white max-w-40 shadow-2 py-2 mt-1 cursor-pointer rounded-xl overflow-clip"} >
                    {types.map((type) => {
                        if (type.id == 1) return <></>;
                        return <Listbox.Option key={type.id} value={type}
                            className="data-[focus]:bg-blue-100 py-2 px-3  hover:bg-slate-200">
                            {type.name}
                        </Listbox.Option>;
                    }

                    )}
                </Listbox.Options>
            </Listbox>
        </div>
        <div className="mt-7">
            <div className="mt-1 text-gray-600"><span className="text-3xl text-gray-800 tracking-wider">{size.toFixed(2)} GB</span> of 2 GB used</div>
            <div className="mt-2">
                <ProgressBar progress={size} max={2} size='big' />
            </div>
        </div>
        <div className="flex justify-between items-center mt-5 cursor-pointer" onClick={() => { setDirection(pre => -pre); }}>
            <p>Files using Retrieval System</p>
            <div className="font-medium px-2 py-1 w-[150px] flex items-center">
                <p className="mr-2">Storage used</p>
                {direction == -1 && <IoArrowDownSharp size={18} />}
                {direction == 1 && <IoArrowUpSharp size={18} />}
            </div>
        </div>
        <div className="mt-2">
            {data.map((file: any) => {
                return <StorageFile file={file} key={file.id} />;
            })}
        </div>
    </div >);
}