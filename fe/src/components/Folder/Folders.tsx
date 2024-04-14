import Image from "next/image";
import Folder, { IFolder, IFolderProps } from "./Folder";
import { useContext } from "react";
import { MenuContext } from "@/src/screens/InFolder/MenuProvider";

export default function Folders({ folders }: IFoldersProps) {
  return (
    <div className="">
      <p className="font-medium text-gray-600">Folders</p>
      <div className="grid grid-cols-9 gap-3 mt-3">
        {folders.map((folder) => {
          return <Folder folder={folder} />;
        })}
      </div>
    </div>
  );
}
export interface IFoldersProps {
  folders: IFolder[];
}
