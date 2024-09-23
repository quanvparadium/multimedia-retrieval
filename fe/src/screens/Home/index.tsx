import { fileSystemApi } from "@/src/apis/file-system/file-system.api";
import Files from "@/src/components/File/Files";
import Folders from "@/src/components/Folder/Folders";
import { iconMapper } from "@/src/components/Icon/iconMapper";
import SearchInput from "@/src/components/Input/SearchInput";
import { useContext, useEffect, useState } from "react";
import { FiFileText, FiFolder } from "react-icons/fi";
import { IoMdSearch } from "react-icons/io";
import { format } from 'date-fns';
import { ModalContext } from "@/src/Providers/ModalProvider";
import dynamic from "next/dynamic";
import VideoComponent from "@/src/components/File/ImageComponent";
import { baseURL } from "@/src/apis/axios-base";
import ImageComponent from "@/src/components/File/ImageComponent";
import { useRouter } from "next/router";

const testData = [{
    name: "baonguyen",
    id: 10,
    fileType: 'document',
    createdAt: Date.now(),
    type: 'file'
},
{
    name: "min ne",
    id: 10,
    createdAt: Date.now(),
    type: 'folder'
}];

const PdfViewer = dynamic(() => import("@/src/components/File/PdfViewer"), { ssr: false, });
export default function HomeScreen() {
    const router = useRouter();
    const [isFocused, setIsFocused] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [data, setData] = useState<any>([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [type, setType] = useState('file');
    const [fileSystems, setFileSystems] = useState(undefined);
    const types = ['file', 'folder'];
    const { openModal, setModalComponent, closeModal }: any = useContext(ModalContext);

    useEffect(() => {
        if (searchText.length > 0) {
            // Gửi yêu cầu lấy dữ liệu khi searchText thay đổi
            handleSearch(searchText);
        } else {
            setData([]);
        }
    }, [searchText]);

    const handleSearch = async (query: string) => {
        // Thay thế đoạn này bằng API call thật sự
        const res = await fileSystemApi.searchFiles(query);
        const filteredData: any = res.data;
        setData(filteredData);
        setIsDropdownVisible(true);
    };

    const handleType = async (type: string) => {
        setType(type);
        const res = await fileSystemApi.getRecent(type);
        setFileSystems(res.data);
    };

    useEffect(() => {
        handleType(type);
    }, []);

    const handleClick = (file: any) => {
        const type = file?.fileType ?? file?.type;
        file._id = file.id;
        if (type == "document") {
            setModalComponent(<PdfViewer url={`${baseURL}/api/media/documents/${file._id}`} start={1} />);
            openModal();
        }
        else if (type == "video") {
            setModalComponent(<VideoComponent file={file} />);
            openModal();
        }
        else if (type == "image") {
            setModalComponent(<ImageComponent file={file} />);
            openModal();
        }
        else if (type == 'folder') {
            router.push(`/folders/${file._id}`);
        }
    };

    return <div className="mt-2">
        <div className="flex justify-center text-2xl">
            Welcome to Retrieval System
        </div>
        <div className="flex justify-center w-full mt-4 relative">
            <div className={`items-center rounded-full px-3 py-2  max-w-[700px] space-x-2 md:flex-1 md:flex ${isFocused ? "bg-white shadow-2" : "bg-slate-200"}`}>
                <IoMdSearch size={23} className="mx-2 cursor-pointer" />
                <input
                    type="text"
                    placeholder="Search In Retrieval System"
                    className=" py-1 w-full  rounded-md bg-slate-200  border-0 outline-none focus:bg-white"
                    onFocus={() => {
                        setIsFocused(true);
                        setIsDropdownVisible(true);
                    }}
                    onBlur={() => {
                        setIsFocused(false);
                        // Để tránh mất dropdown khi focus sang danh sách, bạn có thể điều chỉnh với timeout hoặc kiểm tra nếu focus vẫn trong thành phần dropdown
                        setTimeout(() => setIsDropdownVisible(false), 200);
                    }}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>
            {isDropdownVisible && data.length > 0 && (
                <ul className="absolute top-14 bg-white border rounded-md mt-2 w-full max-w-[700px] z-10 shadow-2 overflow-clip"> {/* Thêm absolute và z-10 */}
                    {data.map((item: any, index: any) => {
                        const type = item.fileType ?? item.type;
                        const ICon = iconMapper[type];

                        return <div className="flex justify-between px-4 py-2 hover:bg-gray-200 cursor-pointer  items-center" onClick={(e) => handleClick(item)} key={item.id}>
                            <div className="flex items-center">
                                <ICon.icon size={20} color={ICon.color} />
                                <p className="ml-2">{item.name}</p>
                            </div>
                            <p className="text-xs"> {format(item.createdAt, 'dd/MM/yyyy')}</p>
                        </div>;
                    }
                    )}
                </ul>
            )}

        </div>
        {/* <SearchInput /> */}

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