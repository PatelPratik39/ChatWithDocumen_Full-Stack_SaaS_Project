"use client";

import { db, storage } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"; // Removed "@firebase/storage"
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

export enum StatusText {
  UPLOADING = "Uploading file...",
  UPLOADED = "File uploaded successfully",
  ERROR = "Error uploading file",
  SUCCESS = "File uploaded successfully",
  SAVING = "Saving file to database...",
  GENERATING = "Generating AI Embeddings, This will only take a few seconds...",
}

export type Status = StatusText[keyof StatusText];

const useUpload = () => {
  const [progress, setProgress] = useState<number | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const { user } = useUser();
  const router = useRouter(); 

  const handleUpload = async (file: File) => {
    if (!file || !user) return;

    // FREE / PRO Plans limitations...
    const fileIdToUploadTo = uuidv4();

    const storageRef = ref(storage, `users/${user.id}/files/${fileIdToUploadTo}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // ✅ Corrected percentage calculation
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setStatus(StatusText.UPLOADING);
        setProgress(percent);
      },
      (error) => {
        console.error("Error uploading file", error);
        setStatus(StatusText.ERROR);
      },
      async () => {
        setStatus(StatusText.UPLOADED);

        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        setStatus(StatusText.SAVING);

        // ✅ Save file metadata in Firestore
        await setDoc(doc(db, "users", user.id, "files", fileIdToUploadTo), {
          name: file.name,
          size: file.size,
          type: file.type,
          url: downloadUrl,
          ref: uploadTask.snapshot.ref.fullPath,
          createdAt: new Date(),
        });

        setStatus(StatusText.GENERATING);
        //Generating AI embeddings ... 
        setFileId(fileIdToUploadTo);
      }
    );
  };

  return { progress, status, fileId, handleUpload }; // ✅ Fixed return syntax
};

export default useUpload;
