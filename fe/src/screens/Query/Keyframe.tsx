import Image from "next/image";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaImage } from "react-icons/fa6";
import { baseURL } from "@/src/apis/axios-base";
import { logApi } from "@/src/apis/log/log.api";
import { ModalContext } from "@/src/Providers/ModalProvider";
import { PiTelegramLogoDuotone } from "react-icons/pi";
import { RiFolderVideoFill } from "react-icons/ri";
import { MenuContext } from "@/src/Providers/MenuProvider";
import { fileSystemApi } from "@/src/apis/file-system/file-system.api";
import { useRouter } from "next/router";

export default function Keyframe({ keyframe }: any) {
    let [isOpen, setIsOpen] = useState(false);
    const { openModal, setModalComponent, closeModal }: any = useContext(ModalContext);
    const { openMenu, closeMenu }: any = useContext(MenuContext);
    const router = useRouter();

    const name = `${keyframe.fileId}_${keyframe.frame_number}`;
    const url = `${baseURL}/api/keyframes/${keyframe.frame_number}/files/${keyframe.fileId}`;
    const handleOnClick = () => {
        openModal();
        // setModalComponent(<ImageComponent url={url} name={name} />);
        setModalComponent(<VideoComponent fileId={keyframe.fileId} name={name}  startSecond={keyframe.frame_second}/>);
    };

    const ImageComponent = ({ name, url }: any) => {
        return <>
            <div className="flex font-medium text-lg text-white items-center bg-slate-600  py-2 px-3  ">
                <FaImage className="" color="orange" />
                <p className="ml-2"> {name}</p>
            </div>
            <Image src={url} alt="" height={2000} width={2000} className="w-auto" />
        </>;
    };

    const VideoComponent = ({ fileId, name, startSecond = 0 }: any) => {
        const url = `${baseURL}/api/media/videos/${fileId}`;
        const videoRef = useRef<any>(null);

        useEffect(() => {
            if (videoRef.current) {
                // Ensure the video metadata is loaded before seeking
                const handleLoadedMetadata = () => {
                    videoRef.current.currentTime = startSecond;
                };
                videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);

                // Clean up the event listener
                return () => {
                    videoRef?.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
                };
            }
        }, [startSecond]);

        return <>
            <div className="flex font-medium text-lg text-white items-center bg-slate-600  py-2 px-3  ">
                <RiFolderVideoFill className="w-5" color="red" />
                <p className="ml-2"> {name}</p>
            </div>
            <video
                src={url}
                controls // Display native video controls
                autoPlay={true} // Set to true if you want the video to start playing automatically
                loop={false} // Set to true if you want the video to loop
                muted={false} // Set to true if you want the video to be muted
                accessKey=""
                ref={videoRef}
            />
        </>;
    };



    const handleGoto = async () => {
        try {
            const res: any = await fileSystemApi.getParent(keyframe.fileId);
            const parent = res.data;
            if (parent?.parentId) {
                router.push(`/folders/${parent._id}`);
            }
            else router.push("/my-drive");
        } catch (error) {
            console.log(error);
        }
    };

    const listTasks = [
        [{ name: "Go to", Icon: PiTelegramLogoDuotone, cb: handleGoto }],
    ];

    const handleRightClick = openMenu(listTasks);



    return (
        <div
            className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
            onContextMenu={handleRightClick} onClick={closeMenu}
        >
            <div className="flex p-3 pt-0 items-center ">
                <FaImage className="" color="orange" />
                <p className="ml-3 overflow-hidden flex-grow whitespace-nowrap ">{name}</p>
            </div>
            <div className="w-full aspect-square bg-black rounded-xl " onClick={handleOnClick}>
                <Image
                    src={url}
                    width={500}
                    height={500}
                    className="w-full h-full rounded-lg object-contain"
                    alt=""
                />
            </div>
        </div>
    );
}
;