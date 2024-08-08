'use client';
import Image from "next/image";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { FaImage } from "react-icons/fa6";
import { IFileProps } from "./File";
import { MenuContext } from "@/src/Providers/MenuProvider";
import { ModalContext } from "@/src/Providers/ModalProvider";
import { Document, Page, pdfjs } from 'react-pdf';
import dynamic from "next/dynamic";
import { baseURL } from "@/src/apis/axios-base";
import { RiFolderVideoFill } from "react-icons/ri";
// @ts-ignore


const PdfViewer = dynamic(() => import("./PdfViewer.tsx"), { ssr: false, });

export default function DocumentFile({ file }: IFileProps) {
    const { openModal, setModalComponent, closeModal }: any = useContext(ModalContext);
    const url = `${baseURL}/api/media/documents/${file._id}`;


    const thumbNailId = file.metaData.thumbNailId;
    let urlThumbNail;
    if (thumbNailId) urlThumbNail = `${baseURL}/api/thumbnails/${file.metaData.thumbNailId}`;


    const handleClick = () => {
        // Set the PDF URL dynamically here
        setModalComponent(<PdfViewer url={url} />);
        openModal();
    };

    return (
        <div className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer">
            <div className="flex p-3 pt-0 items-center ">
                <RiFolderVideoFill className="shrink-0" color="red" />
                <p className="ml-3 overflow-hidden flex-grow whitespace-nowrap ">{file.name}</p>
            </div>
            <div className="w-full aspect-square bg-black rounded-xl " onClick={handleClick}>
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
        </div>
    );
}

