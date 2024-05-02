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

export default function InFolder({ path }: IInFolder) {
  const [files, setFiles] = useState<IFile[]>([]);
  const [folders, setFolders] = useState<IFolder[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [value, setValue] = useState("");
  const { openModal, setModalComponent, isOpen }: any = useContext(ModalContext);
  const { openMenu, closeMenu }: any = useContext(MenuContext);

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
          <div className="mt-5 py-1 px-6 rounded-2xl bg-blue-500 hover:bg-blue-400 cursor-pointer text-white font-medium">
            Create
          </div>
        </div>
      </div>
    );
  };
  useEffect(() => {
    setModalComponent(ModalComponent);
  }, [value]);

  const handleFileUpload = () => {
    if (!fileInputRef?.current) return;
    fileInputRef.current.click();
  };

  useEffect(() => {
    const realPath = path.split("/").slice(1).join("/");
    const getFoldersAndFiles = async () => {
      try {
        const res = await fileSystemApi.getFileSystemOfFolder(realPath);
        const { folders } = res.data;
        const newFolders: IFolder[] = folders.map((folder: any) => ({ ...folder, dir: realPath }));
        console.log(newFolders, realPath, path);
        setFolders(newFolders);
      } catch (error) {}
    };
    getFoldersAndFiles();
  }, [path]);

  const handleNewFolder = () => {
    setValue("");
    openModal();
    setModalComponent(ModalComponent);
    closeMenu();
  };

  const handleUpload = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    const target = e.target as HTMLInputElement & {
      files: FileList;
    };
    const selectedFiles = Object.values(target.files);
    console.log(selectedFiles);
    setSelectedFiles(target.files);
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
      <BreadCrumbs path={path} />
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
  //   folders: IFolderProps[];
  //   files: IFileProps[];
  path: string;
}
