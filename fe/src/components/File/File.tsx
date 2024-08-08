import { MdDriveFileRenameOutline, MdOutlineFileDownload } from "react-icons/md";
import ImageFile from "./ImageFile";
import VideoFile from "./VideoFile";
import { fileSystemApi } from "@/src/apis/file-system/file-system.api";
import { useContext, useState } from "react";
import { MenuContext } from "@/src/Providers/MenuProvider";
import { ModalContext } from "@/src/Providers/ModalProvider";
import { LiaTrashAlt } from "react-icons/lia";
import { baseURL } from "@/src/apis/axios-base";
import DocumentFile from "./DocumentFile";

export default function File({ file }: IFileProps) {
  if (!file?.metaData?.mimetype) return;
  const type = file.metaData.mimetype.split('/')[0];
  const [name, setName] = useState(file.name);
  const { openMenu, closeMenu, emitSignal }: any = useContext(MenuContext);
  const { openModal, setModalComponent, isOpen, closeModal }: any = useContext(ModalContext);

  let Component = ImageFile;
  if (type == "video") Component = VideoFile;
  if (type == "application") Component = DocumentFile;

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
  // if (type == "video") return <VideoFile file={file} />;
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
          console.log(file.name);
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



  return <div className="" onContextMenu={handleRightClick}>
    <Component file={file} />
  </div>;
}

export interface IFileProps {
  file: IFile;
}

export interface IFile {
  type: string;
  name: string;
  _id: string;
  size: string;
  metaData: IMetaData;
}

interface IMetaData {
  storage?: string,
  location?: string,
  size?: number,
  mimetype?: string | null;
  thumbNailId: string;
}