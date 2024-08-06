'use client';
import Image from "next/image";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { FaImage } from "react-icons/fa6";
import { IFileProps } from "./File";
import { MenuContext } from "@/src/Providers/MenuProvider";
import { ModalContext } from "@/src/Providers/ModalProvider";
import { Document, Page, pdfjs } from 'react-pdf';
import dynamic from "next/dynamic";
// @ts-ignore


const PdfViewer = dynamic(() => import("./PdfViewer.tsx"), { ssr: false, });

export default function DocumentFile({ }) {
    let [isOpen, setIsOpen] = useState(false);
    const { openModal, setModalComponent, closeModal }: any = useContext(ModalContext);
    const { openMenu, closeMenu }: any = useContext(MenuContext);
    const url = ``;

    const [showPdf, setShowPdf] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');

    const handleClick = () => {
        // Set the PDF URL dynamically here
        setPdfUrl('/test.pdf');
        setShowPdf(true);
    };

    return (
        <div>
            <h1>Dynamic PDF Viewer</h1>
            <button onClick={handleClick}>Show PDF</button>
            {/* @ts-ignore */}
            {showPdf && pdfUrl && <PdfViewer url={pdfUrl} />}
        </div>
    );

    // return (
    //     <div
    //         className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
    //         onContextMenu={(e) => {
    //             e.stopPropagation(); // Prevent default context menu behavior
    //         }}
    //     >
    //         <div className="flex p-3 pt-0 items-center ">
    //             <FaImage className="" color="orange" />
    //             <p className="ml-3 overflow-hidden flex-grow whitespace-nowrap ">{'hello'}</p>
    //         </div>


    //     </div>
    // );
}

