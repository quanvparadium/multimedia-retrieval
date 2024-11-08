import Image from "next/image";
import Folder, { IFolder, IFolderProps } from "./Folder";
import { useContext } from "react";
import { MenuContext } from "@/src/Providers/MenuProvider";

export default function Folders({ folders }: IFoldersProps) {
  if (!folders?.length) return;
  return (
    <div className="">
      <div className="grid grid-cols-9 gap-3 mt-3">
        {folders.map((folder) => {
          return <Folder folder={folder} key={folder._id} />;
        })}
      </div>
    </div>
  );
}
export interface IFoldersProps {
  folders: IFolder[];
}
