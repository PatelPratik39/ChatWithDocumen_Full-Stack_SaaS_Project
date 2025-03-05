'use client'

import React, { useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { CircleArrowDown, RocketIcon } from 'lucide-react'
import useUpload from '@/hooks/useUpload'
import { useRouter } from 'next/router'

const FileUploader = () => {
    const { progress, status, fileId, handleUpload } = useUpload();
    const router = useRouter();

    useEffect(() => {
        if( fileId) {
            router.push(`/dahsboard/${fileId}`);
        }

    }, [fileId, router]);


    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        // Do something with the files
        console.log(acceptedFiles);
        const file = acceptedFiles[0];
        if (file) {
            await handleUpload(file);
        } else {
            // do nothting
            // toast
        }

    }, [])
    const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({ onDrop, maxFiles: 1, accept: { 'application/pdf': [".pdf"] } })
    return (
        <div className='flex flex-col gap-4 items-center max-w-7xl mx-auto'>
            {/* Loading.... */}
            <div {...getRootProps()} className={`p-10 border-2 border-dashed mt-10 w-[90%] border-cyan-600 text-cyan-600 rounded-lg h-96 flex items-center justify-center ${isFocused || isDragActive ? "bg-cyan-300" : "bg-cyan-100"}`}>
                <input {...getInputProps()} />
                <div className='flex flex-col items-center justify-center text-center'>

                    {
                        isDragActive ? (
                            <>
                                <RocketIcon className='h-20 w-20 animate-ping' />
                                <p>Drop the files here ...</p>
                            </>
                        ) : (
                            <>
                                <CircleArrowDown className='h-20 w-20 animate-bounce' />
                                <p>Drag and drop some files here, or click to select files</p>
                            </>
                        )
                    }
                </div>
            </div>
        </div >
    )
}

export default FileUploader