import { FaImage } from "react-icons/fa";
import { MdDriveFileRenameOutline, MdOutlineFileDownload, MdPictureAsPdf } from "react-icons/md";
import { RiFolderVideoFill } from "react-icons/ri";
import byteSize from 'byte-size';
import { useContext, useState } from "react";
import { ModalContext } from "@/src/Providers/ModalProvider";
import { MenuContext } from "@/src/Providers/MenuProvider";
import { baseURL } from "@/src/apis/axios-base";
import { LiaTrashAlt } from "react-icons/lia";
import { fileSystemApi } from "@/src/apis/file-system/file-system.api";
import VideoComponent from "@/src/components/File/ImageComponent";
import dynamic from "next/dynamic";
import { iconMapper } from "@/src/components/Icon/iconMapper";

const PdfViewer = dynamic(() => import("@/src/components/File/PdfViewer"), { ssr: false, });
export default function StorageFile({ file }: any) {
    const type = file?.metaData.fileType;
    const { openModal, setModalComponent, closeModal }: any = useContext(ModalContext);
    const { openMenu, closeMenu, emitSignal }: any = useContext(MenuContext);
    const [name, setName] = useState(file.name);

    if (!type) return;

    const ICon = iconMapper[type];
    const size = byteSize(file?.metaData?.size);

    const ModalComponent = ({ name }: any) => {
        const [value, setValue] = useState(name);
        return (
            <div className="w-[360px] px-6 py-5 bg-white rounded-md flex flex-col items-start ">
                <div className="font-normal text-xl">Rename</div>
                <input
                    type="text"
                    autoFocus
                    className="outline-none mt-5 border-[1px] border-black rounded-lg py-2 px-3 focus:border-blue-400 w-full"
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                    }}
                />
                <div className="flex items-end w-full justify-end">
                    <div
                        className="mt-5 py-1 px-6 rounded-2xl bg-blue-500 hover:bg-blue-400 cursor-pointer text-white font-medium"
                        onClick={async () => {
                            try {
                                const data = await fileSystemApi.changeFileName(file._id, value);
                                setName(value);
                                file.name = value;
                                closeModal();
                            } catch (error) {
                                console.log(error);
                            }
                        }}
                    >
                        OK
                    </div>
                </div>
            </div>
        );
    };

    const listTasks = [
        [
            {
                name: "Rename",
                Icon: MdDriveFileRenameOutline,
                cb: (event: React.MouseEvent<HTMLButtonElement>) => {
                    closeMenu();
                    setModalComponent(<ModalComponent name={file.name} />);
                    openModal();
                },
            },
            {
                name: "Download",
                Icon: MdOutlineFileDownload,
                cb: async (event: React.MouseEvent<HTMLButtonElement>) => {
                    const a = document.createElement('a');
                    a.href = `${baseURL}/api/folders/${file._id}/download`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    closeMenu();
                },
            },
        ],
        [{
            name: "Move to trash", Icon: LiaTrashAlt,
            cb: async (event: React.MouseEvent<HTMLButtonElement>) => {
                closeMenu();
                await fileSystemApi.moveToTrash(file._id);
                emitSignal();
            },
        }],
    ];

    const handleRightClick = openMenu(listTasks);

    const handleDoubleClick = () => {
        if (type == "document") {
            setModalComponent(<PdfViewer url={`${baseURL}/api/media/documents/${file._id}`} start={1} />);
        }
        else if (type == "video") {
            setModalComponent(<VideoComponent file={file} />);
        }
        openModal();
    };


    return <div className="flex py-3 px-3 justify-between items-center border-t-[1px] border-gray-300 hover:bg-slate-200 cursor-pointer" onContextMenu={handleRightClick} onDoubleClick={handleDoubleClick}>
        <div className="flex items-center">
            <ICon.icon size={20} color={ICon.color} />
            <p className="ml-5">{file.name}</p>
        </div>
        <p className="w-[130px]">{size.value} {size.unit}</p>
    </div>;
}