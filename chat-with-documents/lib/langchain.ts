
/**
 * 💡 Explanation of Each Import:
        - ChatOpenAI → Used to interact with OpenAI models.
        - PDFLoader → Loads PDF documents for processing.
        - RecursiveCharacterTextSplitter → Splits text into smaller chunks.
        - OpenAIEmbeddings → Generates vector embeddings using OpenAI.
        - createStuffDocumentsChain → Combines document processing chains.
        - ChatPromptTemplate → Defines prompt structures for LLMs.
        - createRetrievalChain → Creates a chain for retrieving relevant documents.
        - createHistoryAwareRetriever → Retrieves context-aware results.
        - HumanMessage, AIMessage → Represents chat messages.
        - pineconeClient → Connection to Pinecone for vector database storage.
 */
// import pdf from "pdf-parse";
import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import pineconeClient from "./pincone";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone, Index, RecordMetadata } from "@pinecone-database/pinecone";
import { PineconeConflictError } from "@pinecone-database/pinecone/dist/errors";
import { adminDb } from "@/firebaseAdmin";
import {auth} from "@clerk/nextjs/server"
import { doc } from "firebase/firestore";


const model = new ChatOpenAI({  
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'gpt-4o',
})
console.log("✅ Loaded OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "Exists ✅" : "Missing ❌");

export const indexName = "chat-with-documents";

export async function generateDocs(docId: string) {

    const {userId } = await auth();
    if(!userId){
        throw new Error('User not found ❌');
    }
    console.log(`--- Fetching the download URL from Firebase Storage --- ✅`);

    const firebaseRef = await adminDb.collection('users').doc(userId).collection("files").doc(docId).get();
    if(!firebaseRef.exists){
        throw new Error('File not found in Firebase Storage ❌');
    }

    const firestoreData = firebaseRef.data();
    console.log("✅ Firestore Document Data:", firestoreData);
    const downloadUrl = firebaseRef.data()?.url;
    if(!downloadUrl){
        console.error("❌ Firestore document found, but no `url` field exists:", firestoreData);
        throw new Error('Download URL not found in Firebase Storage ❌');
    }

    console.log(`--- Download URL fetched Successfully: ${downloadUrl} --- ✅`);

    // Fetch the PDF from the download URL
    const response = await fetch(downloadUrl);
    if (!response.ok) {
        throw new Error('PDF not found in Firebase Storage ❌');
    }
     console.log("✅ PDF fetched successfully!");

    // Load the PDF into a PDFDocument object
    const data = await response.blob();
    const loader = new PDFLoader(data);
    const docs = await loader.load();

    // Split the PDF into smaller chunks
    console.log(`--- Splitting the PDF into smaller chunks --- ✅`);
    const splitter = new RecursiveCharacterTextSplitter();

    const splitDocs = await splitter.splitDocuments(docs);
    console.log(`--- Split PDF into ${splitDocs.length} smaller chunks --- ✅`);

  return splitDocs;

}

async function namespaceExists(index: Index<RecordMetadata>, namespace: string) {
    if(namespace === null) throw new Error('Namespace is not provided!!!!');

    const {namespaces} = await index.describeIndexStats();
    return namespaces?.[namespace] !=  undefined;

}

export async function generateEmbeddingsInPineconeVectorDatabase(docId: string) {
    const {userId} = await auth();

    if(!userId){
        throw new Error('User not found');
    }

    let pineconeVectorStore;
    console.log("--- Generate Embeddings for the split documents ---");
    
    const embeddings = new OpenAIEmbeddings();

    // need to make connection to pincone
    const index = pineconeClient.index(indexName);
    const nameSpaceAlreadyExits = await namespaceExists(index, docId);

    if(nameSpaceAlreadyExits){
        console.log(`---  ✅ Index ${indexName} already exists for namespace ${docId}. Skipping creating a new index. ✅ ---`);
        pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex: index,
            namespace: docId,
        });
        return pineconeVectorStore;
    } else {
        console.log( `--- Index ${indexName} does NOT exist for namespace ${docId}. Creating a new index. --- ❌`);
        const splitDocs = await generateDocs(docId);
        console.log(`--- Split PDF into ${splitDocs.length} smaller chunks --- ✅`);
        
        pineconeVectorStore = await PineconeStore.fromDocuments(splitDocs, embeddings,{
            pineconeIndex: index,
            namespace: docId,
        });
        return pineconeVectorStore;
    }

}



// NMA