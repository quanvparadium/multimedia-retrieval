import BreadCrumbs from "@/src/components/BreadCrumbs";
import { IFile, IFileProps } from "@/src/components/File/File";
import Files from "@/src/components/File/Files";
import { IFolder, IFolderProps } from "@/src/components/Folder/Folder";
import Folders from "@/src/components/Folder/Folders";
import { useContext, useEffect, useRef, useState } from "react";
import {
    MdOutlineCreateNewFolder,
    MdOutlineDriveFolderUpload,
    MdOutlineUploadFile,
} from "react-icons/md";
import MenuProvider, { MenuContext } from "../../Providers/MenuProvider";
import { ModalContext } from "../../Providers/ModalProvider";
import { fileSystemApi } from "@/src/apis/file-system/file-system.api";
import base64 from "base-64";
import { useRouter } from "next/router";
import { uploadApi } from "@/src/apis/upload/upload.api";
import TrashFile from "./TrashFile";



export default function TrashScreen() {
    const [fileSystems, setFileSystems] = useState<IFile[]>([]);
    const [ancestorData, setAncestorData] = useState<any>(undefined);
    const { openModal, setModalComponent, closeModal }: any = useContext(ModalContext);
    const { openMenu, closeMenu, signal, emitSignal }: any = useContext(MenuContext);
    const router = useRouter();

    const getFoldersAndFiles = async () => {
        try {
            const res: any = await fileSystemApi.getDeletedFiles();
            setFileSystems(res.data);
            // const { ancestorData, childrenData } = res.data;
            // childrenData.sort((a: any, b: any) => a._id > b._id ? 1 : -1);
            // setFileSystems(files);
        } catch (error) { }
    };



    useEffect(() => {
        getFoldersAndFiles();
    }, [signal]);




    return (
        <div className="h-full" onClick={closeMenu} >
            <div className="text-2xl/[24px] py-2">
                Trash
            </div>
            <div className="grid grid-cols-6 gap-5 mt-5 ">
                {fileSystems.map((file) => {
                    return <TrashFile file={file} />;
                })}
            </div>

        </div>
    );
}

export interface IInFolder {
    folderId?: string;
}
