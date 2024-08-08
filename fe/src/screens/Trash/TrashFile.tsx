import Image from "next/image";
import { Fragment, useContext, useState } from "react";
import { RiFolderVideoFill } from "react-icons/ri";
import { Dialog, Transition } from "@headlessui/react";
import { baseURL } from "@/src/apis/axios-base";
import { logApi } from "@/src/apis/log/log.api";
import { FaImage } from "react-icons/fa";
import { FaFolderClosed } from "react-icons/fa6";
import { MdFolder, MdRestore } from "react-icons/md";
import { MenuContext } from "@/src/Providers/MenuProvider";
import { fileSystemApi } from "@/src/apis/file-system/file-system.api";

export default function TrashFile({ file }: any) {
    const { openMenu, closeMenu, emitSignal }: any = useContext(MenuContext);

    let type = 'folder';
    if (file?.metaData?.mimetype) {
        type = file.metaData.mimetype.split('/')[0];
    }
    const iconMapper: any = {
        video: {
            icon: RiFolderVideoFill,
            color: 'red'
        },
        image: {
            icon: FaImage,
            color: 'yellow'
        },
        folder: {
            icon: MdFolder,
            color: 'black'
        },
    };
    const Icon = iconMapper[type];
    const thumbNailId = file?.metaData?.thumbNailId;
    let urlThumbNail;
    if (thumbNailId) urlThumbNail = `${baseURL}/api/thumbnails/${file.metaData.thumbNailId}`;

    const listTasks = [
        [{
            name: "Restore", Icon: MdRestore,
            cb: async (event: React.MouseEvent<HTMLButtonElement>) => {
                closeMenu();
                await fileSystemApi.restore(file._id);
                emitSignal();
            },
        }],
    ];
    const handleRightClick = openMenu(listTasks);

    return (
        <div
            className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
            onContextMenu={handleRightClick}
        >
            <div className="flex p-3 pt-0 items-center ">
                <Icon.icon className="shrink-0" color={Icon.color} />
                <p className="ml-3 overflow-hidden flex-grow whitespace-nowrap ">{file.name}</p>
            </div>
            <div className="w-full aspect-square bg-black rounded-xl overflow-clip" >
                {urlThumbNail ?
                    <Image
                        src={urlThumbNail}
                        width={500}
                        height={500}
                        className="w-full h-full rounded-lg object-contain"
                        alt=""
                    /> : <div className="w-full h-full bg-white flex items-center justify-center">
                        <MdFolder size={60} color="gray" />
                    </div>
                }
            </div>


        </div>
    );
}

