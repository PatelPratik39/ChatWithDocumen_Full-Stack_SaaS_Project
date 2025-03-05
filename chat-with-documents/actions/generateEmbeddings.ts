'use server'

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";

export async function generateEmbeddings(docId: string) {
    // @ts-ignore
    auth().protect();

    // turn a PDF into embeddings
    await generateEmbeddingsInPineconeVectorDatabase(docId);

    revalidatePath('/dashboard');

    return {
        completed: true
    }

}
