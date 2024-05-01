import Image from "next/image";
import { Fragment, useState } from "react";
import { RiFolderVideoFill } from "react-icons/ri";
import { Dialog, Transition } from "@headlessui/react";

export default function VideoFile({ file }: IFileProps) {
  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }
  function openModal() {
    setIsOpen(true);
  }

  return (
    <div
      className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
      onContextMenu={(e) => {
        e.stopPropagation(); // Prevent default context menu behavior
      }}
    >
      <div className="flex p-3 pt-0 items-center ">
        <RiFolderVideoFill className="" color="red" />
        <p className="ml-3 overflow-hidden flex-grow whitespace-nowrap ">{file.name}</p>
      </div>
      <div className="w-full aspect-square bg-black rounded-xl " onClick={openModal}>
        <Image
          src={file.thumbnail}
          width={500}
          height={500}
          className="w-full h-full rounded-lg object-contain"
          alt=""
        />
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
                  <div className="flex font-medium text-lg text-white items-center bg-slate-600  py-2 px-3  ">
                    <RiFolderVideoFill className="" color="red" />
                    <p className="ml-2"> {file.name}</p>
                  </div>
                  <video
                    src={file.link}
                    controls // Display native video controls
                    autoPlay={true} // Set to true if you want the video to start playing automatically
                    loop={false} // Set to true if you want the video to loop
                    muted={false} // Set to true if you want the video to be muted
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export interface IFileProps {
  file: IFile;
}

export interface IFile {
  type: string;
  name: string;
  thumbnail: string;
  link: string;
  size: string;
}
