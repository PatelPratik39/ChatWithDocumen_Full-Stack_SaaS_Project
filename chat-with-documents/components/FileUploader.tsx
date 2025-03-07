"use client";

import React, { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  CheckIcon,
  CircleArrowDown,
  HammerIcon,
  RocketIcon,
  SaveIcon
} from "lucide-react";
import useUpload, { StatusText } from "@/hooks/useUpload";
import { useRouter } from "next/navigation";
import { ErrorIcon } from "react-hot-toast";

const FileUploader = () => {
  const { progress, status, fileId, handleUpload } = useUpload();
  const router = useRouter();

  useEffect(() => {
    if (fileId) {
      console.log("✅ Navigating to:", `/dashboard/files/${fileId}`);

      if (!fileId || typeof fileId !== "string") {
        console.error("❌ Invalid fileId:", fileId);
        return;
      }

      router.push(`/dashboard/files/${fileId}`);

      setTimeout(() => {
        router.push(`/dashboard/files/${fileId}`);
      }, 500);
    }
  }, [fileId, router]);

  



  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Do something with the files

    if (acceptedFiles.length === 0) {
      console.warn("⚠ No file selected.");
      return;
    }
    console.log(acceptedFiles);
    const file = acceptedFiles[0];
    console.log("📂 File selected:", file);
    if (file) {
      await handleUpload(file);
      console.log("✅ Upload successful!");
    } else {
      
      // do nothting
      // toast
    }
  }, [handleUpload]);

  useEffect(() => {
    const preventDefaults = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    ["dragenter", "dragover", "dragleave", "drop"].forEach((event) =>
      document.addEventListener(event, preventDefaults, false)
    );

    return () => {
      ["dragenter", "dragover", "dragleave", "drop"].forEach((event) =>
        document.removeEventListener(event, preventDefaults, false)
      );
    };
  }, []);

  const statusIcon = {
    [StatusText.UPLOADING]: <RocketIcon className="h-20 w-20 text-cyan-600" />,
    [StatusText.UPLOADED]: <CheckIcon className="h-20 w-20 text-cyan-600" />,
    [StatusText.ERROR]: <ErrorIcon className="h-20 w-20 text-cyan-600" />,
    [StatusText.SAVING]: <SaveIcon className="h-20 w-20 text-cyan-600" />,
    [StatusText.GENERATING]: <HammerIcon className="h-20 w-20 text-cyan-600" />
    // Add more status icons as needed
  };
  const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({
    onDrop,
    // onDrop: (files) => {
    //   console.log("Dropped files:", files);
    // },
    maxFiles: 1,
    accept: {}
    // accept: {
    //   "application/pdf": [".pdf"], // Allow PDFs
    //   "application/vnd.ms-excel": [".xls"], // Allow old Excel format
    //   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"], // Allow modern Excel format
    //   "text/csv": [".csv"], // Allow CSV files
    // },
    // accept: { "application/pdf": [".pdf"] }
  });
  const uploadInProgress = progress != null && progress >= 0 && progress <= 100;
  return (
    <div className="flex flex-col gap-4 items-center max-w-7xl mx-auto ">
      {/* Loading.... */}
      {uploadInProgress && (
        <div className="mt-32 flex flex-col items-center justify-center gap-5">
          <div
            // @ts-ignore
            className={`radial-progress text-cyan-600 border-cyan-600 border-4 ${
              progress === 100 && "hidden"
            }`}
            role="progressbar"
            style={{
                // @ts-ignore
              "--value": progress,
              "--size": "12rem",
              "--thickness": "1.3rem"
            }}
          >
            {progress}%{" "}
          </div>

          {/* Render Status Icon */}
          {statusIcon[status as StatusText]}
          <p className="text-cyan-600 animate-pulse">
            {status === StatusText.UPLOADING && <span>Uploading...</span>}
          </p>

        </div>
      )}
      { !uploadInProgress && (<div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed mt-10 w-[90%] border-cyan-600 text-cyan-600 rounded-lg h-96 flex items-center justify-center ${
          isFocused || isDragActive ? "bg-cyan-300" : "bg-cyan-100"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          {isDragActive ? (
            <>
              <RocketIcon className="h-20 w-20 animate-ping" />
              <p>Drop the files here ...</p>
            </>
          ) : (
            <>
              <CircleArrowDown className="h-20 w-20 animate-bounce" />
              <p>Drag and drop some files here, or click to select files</p>
            </>
          )}
        </div>
      </div>)}
    </div>
  );
};

export default FileUploader;
