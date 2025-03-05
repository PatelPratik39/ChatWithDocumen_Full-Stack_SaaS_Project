'use server'

import { generateEmbeddingsInPineconeVectorDatabase } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";

export async function generateEmbeddings(docId: string) {
    // @ts-ignore
    // auth().protect();
    const user = auth();
    if (!(await user).userId) {
        throw new Error("Unauthorized: User is not authenticated");
    }

    // turn a PDF into embeddings
    await generateEmbeddingsInPineconeVectorDatabase(docId);

    revalidatePath('/dashboard');

    return {
        completed: true
    }

}
