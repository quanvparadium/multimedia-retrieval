import BreadCrumbs from "@/src/components/BreadCrumbs";
import { IFile, IFileProps } from "@/src/components/File/File";
import Files from "@/src/components/File/Files";
import { IFolder, IFolderProps } from "@/src/components/Folder/Folder";
import Folders from "@/src/components/Folder/Folders";
import Image from "next/image";
import { useContext, useState } from "react";
import {
  MdOutlineCreateNewFolder,
  MdOutlineDriveFolderUpload,
  MdOutlineUploadFile,
} from "react-icons/md";
import { BsFileArrowUp } from "react-icons/bs";
import MenuProvider, { MenuContext } from "./MenuProvider";

const defaultFolder = [{ name: "abc" }, { name: "Canh moi" }, { name: "Khoe" }];

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
  const [files, setFiles] = useState<IFile[]>(defaultFiles);
  const [folders, setFolders] = useState<IFolder[]>(defaultFolder);
  const listTasks = [
    [{ name: "New Folder", Icon: MdOutlineCreateNewFolder }],
    [
      { name: "File Upload", Icon: MdOutlineUploadFile },
      { name: "Folder Upload", Icon: MdOutlineDriveFolderUpload },
    ],
  ];

  const { closeMenu, openMenu }: any = useContext(MenuContext);
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
    </div>
  );
}

export interface IInFolder {
  //   folders: IFolderProps[];
  //   files: IFileProps[];
  path: string;
}
