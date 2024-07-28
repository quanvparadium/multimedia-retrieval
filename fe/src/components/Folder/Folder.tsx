import { MenuContext } from "@/src/screens/InFolder/MenuProvider";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { IconType } from "react-icons";
import { FaFolderClosed } from "react-icons/fa6";
import { MdOutlineFileDownload, MdDriveFileRenameOutline } from "react-icons/md";
import { LiaTrashAlt } from "react-icons/lia";
import { ModalContext } from "@/src/screens/InFolder/ModalProvider";
import base64 from "base-64";
import { useRouter } from "next/router";
import { fileSystemApi } from "@/src/apis/file-system/file-system.api";
import { logApi } from "@/src/apis/log/log.api";

export default function Folder({ folder }: IFolderProps) {
  const router = useRouter();
  const { openMenu, closeMenu }: any = useContext(MenuContext);
  const { openModal, setModalComponent, isOpen, closeModal }: any = useContext(ModalContext);
  const [value, setValue] = useState(folder.name);
  const [name, setName] = useState(folder.name);

  const ModalComponent = () => {
    return (
      <div className="w-[360px] px-6 py-5 bg-white rounded-md flex flex-col items-start ">
        <div className="font-normal text-xl">Rename</div>
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
              // try {
              //   const data = await fileSystemApi.rename(`${folder.dir}/${name}`, value);
              //   setName(value);
              //   closeModal();
              //   console.log(data);
              // } catch (error) {
              //   console.log(error);
              // }
            }}
          >
            OK
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    setModalComponent(ModalComponent);
  }, [value]);

  const listTasks = [
    [
      {
        name: "Search",
        Icon: MdOutlineFileDownload,
        cb: (event: React.MouseEvent<HTMLButtonElement>) => {
          router.push(`/query?fileSystemId=${folder._id}`);
        },
      },
      {
        name: "Rename",
        Icon: MdDriveFileRenameOutline,
        cb: (event: React.MouseEvent<HTMLButtonElement>) => {
          closeMenu();
          setModalComponent(ModalComponent);
          openModal();
        },
      },
    ],
    [{ name: "Move to trash", Icon: LiaTrashAlt }],
  ];
  const handleRightClick = openMenu(listTasks);

  return (
    <div
      onContextMenu={handleRightClick}
      className="flex text-gray-600 bg-slate-100 hover:bg-slate-200 py-3 px-5 items-center rounded-xl cursor-pointer font-medium"
      onDoubleClick={() => {
        logApi.upload('open', { fileSystemId: folder._id });
        router.push(`/folders/${folder._id}`);
      }}
    >
      <FaFolderClosed color="gray" />
      <div className="ml-3">{name}</div>
    </div>
  );
}
export interface IFolderProps {
  folder: IFolder;
}
export interface IFolder {
  name: string;
  _id: string;
}
