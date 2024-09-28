import Image from "next/image";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaImage } from "react-icons/fa6";
import { IFileProps } from "./File";
import { baseURL } from "@/src/apis/axios-base";
import { logApi } from "@/src/apis/log/log.api";

export default function ImageFile({ file }: IFileProps) {
  let [isOpen, setIsOpen] = useState(false);

  const url = `${baseURL}/api/media/images/${file._id}`;

  function closeModal() {
    setIsOpen(false);
  }
  function openModal() {
    setIsOpen(true);
  }

  return (
    <div
      className=""
    >
      <div className="flex p-3 pt-0 items-center ">
        <FaImage className="" color="orange" />
        <p className="ml-3 overflow-hidden flex-grow whitespace-nowrap ">{file.name}</p>
      </div>
      <div className="w-full aspect-square bg-black rounded-xl " onClick={openModal}>
        <Image
          src={url}
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
                    <FaImage className="" color="orange" />
                    <p className="ml-2"> {file.name}</p>
                  </div>
                  <Image src={url} alt="" height={2000} width={2000} className="w-auto" />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

