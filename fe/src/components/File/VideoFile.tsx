import Image from "next/image";
import { Fragment, useState } from "react";
import { RiFolderVideoFill } from "react-icons/ri";
import { Dialog, Transition } from "@headlessui/react";
import { IFileProps } from "./File";
import { baseURL } from "@/src/apis/axios-base";
import { logApi } from "@/src/apis/log/log.api";

export default function VideoFile({ file }: IFileProps) {
  let [isOpen, setIsOpen] = useState(false);
  console.log(1);
  function closeModal() {
    setIsOpen(false);
  }
  function openModal() {
    logApi.upload('open', { fileSystemId: file._id });
    setIsOpen(true);
  }
  const url = `${baseURL}/api/media/videos/${file._id}`;
  const thumbNailId = file.metaData.thumbNailId;
  let urlThumbNail;
  if (thumbNailId) urlThumbNail = `${baseURL}/api/thumbnails/${file.metaData.thumbNailId}`;


  return (
    <div
      className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
    >
      <div className="flex p-3 pt-0 items-center ">
        <RiFolderVideoFill className="shrink-0" color="red" />
        <p className="ml-3 overflow-hidden flex-grow whitespace-nowrap ">{file.name}</p>
      </div>
      <div className="w-full aspect-square bg-black rounded-xl " onClick={openModal}>
        {urlThumbNail &&
          <Image
            src={urlThumbNail}
            width={500}
            height={500}
            className="w-full h-full rounded-lg object-contain"
            alt=""
          />
        }
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel>
                  <div className="max-w-[800px]">
                    <div className="flex font-medium text-lg text-white items-center bg-slate-600  py-2 px-3 overflow-hidden ">
                      <RiFolderVideoFill className="w-5" color="red" />
                      <p className="ml-2 overflow-hidden whitespace-nowrap"> {file.name}</p>
                    </div>
                    <video
                      src={url}
                      controls // Display native video controls
                      autoPlay={true} // Set to true if you want the video to start playing automatically
                      loop={false} // Set to true if you want the video to loop
                      muted={false} // Set to true if you want the video to be muted
                      accessKey=""
                      security=""
                    />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

