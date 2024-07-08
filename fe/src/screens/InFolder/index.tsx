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
import MenuProvider, { MenuContext } from "./MenuProvider";
import { ModalContext } from "./ModalProvider";
import { fileSystemApi } from "@/src/apis/file-system/file-system.api";
import base64 from "base-64";
import { useRouter } from "next/router";
import { uploadApi } from "@/src/apis/upload/upload.api";

const defaultFolder = [
  { name: "abc", dir: "" },
  { name: "Canh moi", dir: "" },
  { name: "Khoe", dir: "" },
];

const defaultFiles = [
  {
    type: "video",
    name: "nguyen bao nguyen.mob",
    link: "/video.mp4",
    size: "20.3mp",
    thumbnail: "/image.webp",
  },
  {
    type: "video",
    name: "nguyen bao nguyen.mob",
    link: "/video.mp4",
    size: "20.3mp",
    thumbnail: "/image.webp",
  },
  {
    type: "image",
    name: "xinchao",
    link: "/image.webp",
    size: "20.3mp",
    thumbnail: "/image.webp",
  },
];

export default function InFolder({ folderId }: IInFolder) {
  if (!folderId) return <></>;
  const [files, setFiles] = useState<IFile[]>([]);
  const [folders, setFolders] = useState<IFolder[]>([]);
  const [ancestorData, setAncestorData] = useState<any>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [value, setValue] = useState("");
  const { openModal, setModalComponent, closeModal }: any = useContext(ModalContext);
  const { openMenu, closeMenu }: any = useContext(MenuContext);
  const router = useRouter();

  const getFoldersAndFiles = async () => {
    try {
      const res = await fileSystemApi.getFileSystemOfFolder(folderId);
      const { ancestorData, childrenData } = res.data;
      childrenData.sort((a: any, b: any) => a._id > b._id ? 1 : -1);
      const folders = childrenData.filter((data: any) => data.type == 'folder');
      const files = childrenData.filter((data: any) => data.type == 'file');
      console.log(files);
      setAncestorData(ancestorData);
      setFolders(folders);
      setFiles(files);
    } catch (error) { }
  };

  const ModalComponent = () => {
    return (
      <div className="w-[360px] px-6 py-5 bg-white rounded-md flex flex-col items-start ">
        <div className="font-normal text-xl">New folder</div>
        <input
          type="text"
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
                const data = await fileSystemApi.createNewFolder(folderId, value);
                await getFoldersAndFiles();
                closeModal();
              } catch (error) {
                console.log(error);
              }
            }}
          >
            Create
          </div>
        </div>
      </div>
    );
  };
  useEffect(() => {
    setModalComponent(ModalComponent);
  }, [value, folderId]);

  const handleFileUpload = () => {
    if (!fileInputRef?.current) return;
    fileInputRef.current.click();
  };

  useEffect(() => {
    getFoldersAndFiles();
  }, [folderId]);

  const handleNewFolder = () => {
    setValue("");
    openModal();
    setModalComponent(ModalComponent);
    closeMenu();
  };

  const handleUpload = async (e: React.FormEvent<HTMLInputElement>) => {
    try {
      e.preventDefault();
      const target = e.target as HTMLInputElement & {
        files: FileList;
      };
      const selectedFiles = Object.values(target.files);
      const formData = new FormData();
      for (const file of selectedFiles) {
        formData.append('blobs', file);
      }
      await uploadApi.upload(folderId, formData);
      await getFoldersAndFiles();
    } catch (error) {
      console.log(error);
    }
  };

  const listTasks = [
    [{ name: "New Folder", Icon: MdOutlineCreateNewFolder, cb: handleNewFolder }],
    [
      { name: "File Upload", Icon: MdOutlineUploadFile, cb: handleFileUpload },
      { name: "Folder Upload", Icon: MdOutlineDriveFolderUpload },
    ],
  ];

  const handleRightClick = openMenu(listTasks);
  return (
    <div className="h-full" onContextMenu={handleRightClick} onClick={closeMenu}>
      <BreadCrumbs ancestorData={ancestorData} />
      <div className="mt-4">
        <Folders folders={folders} />
      </div>
      <div className="mt-4">
        <Files files={files} />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleUpload}
        multiple
        style={{ display: "none" }}
      />
    </div>
  );
}

export interface IInFolder {
  folderId?: string;
}
