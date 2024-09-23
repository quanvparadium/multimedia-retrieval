'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
// @ts-ignore

import workerSrc from 'pdfjs-dist/build/pdf.worker.entry';
import { MdOutlineNavigateBefore, MdOutlineNavigateNext } from 'react-icons/md';

export default function PdfViewer({ url, start = 1 }: any) {
    const [numPages, setNumPages] = useState<number>(1);
    const [pageNumber, setPageNumber] = useState<number>(start);
    const goToNextPage = () => {
        setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages || prevPageNumber));
    };

    const goToPrevPage = () => {
        setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
    };
    useEffect(() => {
        const loadPdfWorker = async () => {
            // @ts-ignore
            // pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            //     'pdfjs-dist/build/pdf.worker.entry.js',
            //     import.meta.url,
            // ).toString();
            pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;
            // const PdfWorker = await import('pdfjs-dist/build/pdf.worker.min.js');
            // pdfjs.GlobalWorkerOptions.workerSrc = PdfWorker.default;
        };
        loadPdfWorker();
    }, []);

    const onDocumentLoadSuccess = ({ numPages }: any) => {
        setNumPages(numPages);
    };

    return (
        <div className='relative inline-block p-3 bg-gray-300 rounded-lg'>
            <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                className={'relative rounded-md'}
            >
                <Page pageNumber={pageNumber} className={"relative rounded-sm"} />
            </Document>
            <button
                className="absolute top-1/2 left-4 transform -translate-y-1/2 px-4 py-2 bg-gray-300 text-white rounded shadow-md hover:bg-gray-400 opacity-40 disabled:opacity-20 z-10"
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
            >
                <MdOutlineNavigateBefore size={20} />
            </button>

            <button
                className="absolute top-1/2 right-4 transform -translate-y-1/2 px-4 py-2 bg-gray-300 text-white rounded shadow-md hover:bg-gray-400 opacity-40 disabled:opacity-20 z-10"
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
            >
                <MdOutlineNavigateNext size={20} />
            </button>
        </div>
    );
};