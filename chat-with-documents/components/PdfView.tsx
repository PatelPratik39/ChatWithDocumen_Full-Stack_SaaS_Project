'use client'

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Page, pdfjs, Document } from 'react-pdf';
import { Button } from "./ui/button";
import { Loader2Icon, RotateCw, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { useEffect, useState } from "react";

// We need to configure CORS
// gsutil cors set cors.json gs://<app-name>.appspot.com
// gsutil cors set cors.json gs://chat-with-documents-c1c39.appspot.com
// go here >>> https://console.cloud.google.com/
// create new file in editor calls cors.json
// run >>> // gsutil cors set cors.json gs://chat-with-documents-c1c39.firebasestorage.app
// https://firebase.google.com/docs/storage/web/download-files#cors_configuration


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const PdfView = ({ url }: { url: string }) => {
    const [numPages, setNumPages] = useState<number | undefined>();
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [file, setFile] = useState<Blob | null>(null);
    const [rotation, setRotation] = useState<number>(0);
    const [scale, setScale] = useState<number>(1);

    useEffect(() => {
        const fetchFile = async () => {
            const response = await fetch(url);
            const file = await response.blob();
            setFile(file);
        }
        fetchFile();
    }, [url]);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
        setNumPages(numPages);
    }
    return (
        <>
        <div className="flex flex-col items-center justify-center  ">
                <div className="sticky top-0 z-50 bg-gray-100 p-2 rounded-b-lg items-center justify-center ">
                <div className="max-w-6xl px-2 grid grid-cols-6 gap-2 text-cyan-600 ">
                    <Button variant={"outline"}
                            className="shadow-md" 
                            disabled={pageNumber === 1} onClick={() => {
                        if(pageNumber > 1) {setPageNumber(pageNumber - 1)

                        }}} >
                        Prev
                    </Button> 
                        <p className="flex items-center justify-center ">
                            {pageNumber} of {numPages}
                        </p>  
                        <Button
                            variant="outline"
                            className="shadow-md"
                            disabled={!numPages || pageNumber >= numPages}
                            onClick={() => {
                                if (numPages && pageNumber < numPages) {
                                    setPageNumber(pageNumber + 1);
                                }
                            }}
                        >
                            Next
                        </Button>
                        <Button variant="outline" className="shadow-md" onClick={() => setRotation((rotation + 90) % 360)}>
                            <RotateCw />
                        </Button>
                        <Button variant="outline" className="shadow-md" disabled={scale >= 1.5} onClick={() => setScale(scale * 1.2)}>
                            <ZoomInIcon />
                        </Button>
                        <Button variant="outline" className="shadow-md" disabled={scale <= 0.75}  onClick={() => setScale(scale / 1.2)}>
                            <ZoomOutIcon />
                        </Button>
 
                </div>
            </div>

            { !file ? (<Loader2Icon className="animate-spin h-20 w-20 text-cyan-600 mt-20" />) : (
            
            <Document loading={null} file={file} rotate={rotation} onLoadSuccess={onDocumentLoadSuccess} className="m-4 overflow-scroll">
                <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    className="shadow-lg"
                />
            </Document>
            )}

        </div>
        </>
    )
}

export default PdfView