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
import {  Index, RecordMetadata } from "@pinecone-database/pinecone";
// import { PineconeConflictError } from "@pinecone-database/pinecone/dist/errors";
import { adminDb } from "@/firebaseAdmin";
import {auth} from "@clerk/nextjs/server"



const model = new ChatOpenAI({  
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'gpt-4o',
})

export const indexName = "chat-with-documents";

async function fetchMessageFromDB(docId: string) {
    const {userId} = await auth();
    if(!userId){
        throw new Error('User not found');
    }

    console.log("✅ [Step 1] Fetching the chat history from Firestore...");
    // const LIMIT = 10;
    const chats = await adminDb
    .collection(`users`)
    .doc(userId)
    .collection('files')
    .doc(docId)
    .collection('chat')
    .orderBy('createdAt', "desc")
    // .limit(LIMIT)
    .get();
    
    const chatHistory = chats.docs.map((doc) => 
        doc.data().role === 'human'
        ? new HumanMessage(doc.data().message)
        : new AIMessage(doc.data().message)
    );
    console.log(`✅ [Step 1] Fetched last ${chatHistory.length} messages from Firestore successfully`);
    // console.log(chatHistory.map((message) => message.content.toString()));
    console.log(chatHistory.map((message) => message?.content?.toString() || "[Empty Message]"));


    return chatHistory;
}

export async function generateDocs(docId: string) {

    const {userId } = await auth();
    if(!userId){
        throw new Error('User not found ❌');
    }
    console.log("✅ [Step 2] Fetching the document download URL from Firestore...");

    const firebaseRef = await adminDb.collection('users').doc(userId).collection("files").doc(docId).get();
    if(!firebaseRef.exists){
        throw new Error('File not found in Firebase Storage ❌');
    }

    const firestoreData = firebaseRef.data();
    console.log("✅ [Step 2] Firestore Document Data:", firestoreData);
    const downloadUrl = firebaseRef.data()?.url;
    if(!downloadUrl){
        console.error("❌ Firestore document found, but no `url` field exists:", firestoreData);
        throw new Error('Download URL not found in Firebase Storage ❌');
    }

    console.log(`✅ [Step 2] Download URL fetched Successfully: ${downloadUrl}`);

    // Fetch the PDF from the download URL
    const response = await fetch(downloadUrl);
    if (!response.ok) {
        throw new Error('PDF not found in Firebase Storage ❌');
    }
    console.log("✅ [Step 2] PDF fetched successfully!");

    // Load the PDF into a PDFDocument object
    const data = await response.blob();
    const loader = new PDFLoader(data);
    const docs = await loader.load();
    console.log("✅ [Step 2] PDF Loaded");

    // Split the PDF into smaller chunks
    console.log(`--- Splitting the PDF into smaller chunks --- ✅`);
    const splitter = new RecursiveCharacterTextSplitter();

    const splitDocs = await splitter.splitDocuments(docs);
   console.log(`✅ [Step 2] Split PDF into ${splitDocs.length} smaller chunks`);

  return splitDocs;

}

async function namespaceExists(index: Index<RecordMetadata>, namespace: string) {
    if(namespace === null) throw new Error('Namespace is not provided!!!!');

    console.log(`[Step 3] Checking if namespace exists: ${namespace}`);
    const {namespaces} = await index.describeIndexStats();
    return namespaces?.[namespace] !=  undefined;

}

/** STEP 4: Generate Embeddings & Store in Pinecone */
export async function generateEmbeddingsInPineconeVectorDatabase(docId: string) {
    const {userId} = await auth();

    if(!userId){
        throw new Error('User not found');
    }
    console.log("[Step 4] Generating Embeddings for the document...");
    
    const embeddings = new OpenAIEmbeddings();
    // need to make connection to pincone
    const index = pineconeClient.index(indexName);
    const nameSpaceAlreadyExits = await namespaceExists(index, docId);

    let pineconeVectorStore;
    if(nameSpaceAlreadyExits){
        console.log(`[Step 4] Index ${indexName} already exists for namespace ${docId}. Skipping creation.`);
        pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex: index,
            namespace: docId,
        });
        return pineconeVectorStore;
    } else {
        console.log(`❌ [Step 4] Namespace ${docId} does NOT exist. Creating new embeddings.`);
        const splitDocs = await generateDocs(docId);
        console.log(`--- Split PDF into ${splitDocs.length} smaller chunks --- ✅`);
        
        pineconeVectorStore = await PineconeStore.fromDocuments(splitDocs, embeddings,{
            pineconeIndex: index,
            namespace: docId,
        });
        return pineconeVectorStore;
    }
}

/** STEP 5: Generate Langchain Completion */

const generateLangchainCompletion = async (docId: string, question: string) => {
    console.log("🚀 [Step 1] Running Langchain Completion...");

    // ✅ Step 1: Generate Embeddings
    console.log("🔍 [Step 2] Generating embeddings in Pinecone...");
    const pineconeVectorStore = await generateEmbeddingsInPineconeVectorDatabase(docId);
    
    if (!pineconeVectorStore) {
        throw new Error("❌ Pinecone Vector Store not found.");
    }

    // ✅ Step 2: Create Retriever
    console.log("📚 [Step 3] Creating Retriever...");
    // const retriever = pineconeVectorStore.asRetriever();
    const retriever = pineconeVectorStore.asRetriever({
        filter: { doc_id: docId }, // ✅ Restricts search to only the document ID
    });


    // ✅ Step 3: Fetch Chat History
    console.log("📜 [Step 4] Fetching chat history...");
    const chatHistory = await fetchMessageFromDB(docId) || [];
    
    if (!Array.isArray(chatHistory)) {
        console.warn("⚠️ Chat history is invalid or missing. Defaulting to empty history.");
    }

    // ✅ Step 4: Create History-Aware Retriever
    console.log("📝 [Step 5] Creating History-Aware Retriever...");
    const historyAwarePrompt = ChatPromptTemplate.fromMessages([
        ...chatHistory,
        ["user", "{input}"],
        ["user", "Given the above conversation, generate a search query to look up in order to get relevant information."]
    ]);

    console.log("🔗 [Step 6] Creating History-Aware Retriever Chain...");
    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
        llm: model,
        retriever,
        rephrasePrompt: historyAwarePrompt,
    });

    // ✅ Step 5: Create Prompt for Answer Generation
    console.log("🛠️ [Step 7] Creating Answer Generation Prompt...");
    // const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
    //     ["system", "Answer the user's questions based on the below context:\n\n{context}"],
    //     ...chatHistory,
    //     ["user", "{input}"],
    // ]);
    const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
    ["system", 
        "You are an AI assistant that strictly answers questions using the provided document context. " +
        "If the answer is not found in the document, respond with 'I can not provide you Answer outside of the document'. " +
        "Do NOT use outside knowledge. Only use the retrieved content below:\n\n{context}"
    ],
    ...chatHistory,
    ["user", "{input}"],
]);


    // ✅ Step 6: Create Document Combining Chain
    console.log("📑 [Step 8] Creating Document Combining Chain...");
    const historyAwareCombineDocsChain = await createStuffDocumentsChain({
        llm: model,
        prompt: historyAwareRetrievalPrompt,
    });

    // ✅ Step 7: Create Conversational Retrieval Chain
    
    const retrievedDocs = await retriever.getRelevantDocuments(question);
        if (!retrievedDocs || retrievedDocs.length === 0) {
            return "I couldn't find the answer in the document. Please try rephrasing your question.";
        }
    console.log("🔗 [Step 9] Creating Conversational Retrieval Chain...");
    const conversationalRetrievalChain = await createRetrievalChain({
        retriever: historyAwareRetrieverChain,
        combineDocsChain: historyAwareCombineDocsChain,
    });

    // ✅ Step 8: Execute AI Retrieval
    console.log("💡 [Step 10] Running AI Retrieval Chain...");
    const reply = await conversationalRetrievalChain.invoke({
        chat_history: chatHistory,
        input: question,
    });

    // ✅ Handle response
    // const finalResponse = reply?.answer ?? "❌ No response generated.";
    const finalResponse = retrievedDocs.length > 0 
    ? reply.answer 
    : "I couldn't find relevant information in the document. please ask the question based on document.";

    console.log("🤖 [Step 11] AI Response: ", finalResponse);

    return finalResponse;
};
export {model, generateLangchainCompletion};

// const generateLangchainCompletion = async(docId: string, question: string) => {
//     console.log("[Step 5] Running Langchain Completion...");

//     // let pineconeVectorStore;
//     const pineconeVectorStore = await generateEmbeddingsInPineconeVectorDatabase(docId);
//     if(!pineconeVectorStore){
//         throw new Error('PineconeVectorStore is not found');
//     }
//     // create retriever
//     console.log("[Step 5] Creating Retriever...");
//     const retriever = pineconeVectorStore.asRetriever();
    
//     // Fetch the chat histpory from Firestore
//     console.log("[Step 5] Fetching chat history...");
//     const chatHistory = await fetchMessageFromDB(docId);

//     // Define a Prompt template for genrating search queries based on chat history
//     console.log("--- Define a Prompt template for genrating search queries based on chat history ---");
//     console.log("[Step 5] Creating History-Aware Retriever...");
//     const historyAwarePrompt = ChatPromptTemplate.fromMessages([
//         ...chatHistory,
//         ["user", "{input}"],
//         [
//             "user",
//             "Given the above conversation, generate a search query to look up in order to get relevant information.",
//         ],
//     ]);
//     // Create a hostory-aware retreiver chain that uses the model, retriever, and prompt
//     // console.log("--- Create a hostory-aware retreiver chain that uses the model, retriever, and prompt ---");

//     console.log("[Step 5] Creating a hostory-aware Retriever Chain...");
//     const historyAwareRetrieverChain = await createHistoryAwareRetriever({
//         llm:model,
//         retriever,
//         rephrasePrompt: historyAwarePrompt,
//     });

//     // Define Prompt template for answerring questions based on retrieved context
//     // console.log("--- Define Prompt template for answerring questions based on retrieved context ---");

//     console.log("[Step 5] Creating Prompt for Answer Generation...");
//     const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
//         ["system", "Answer the user's questions based on the below context:\n\n{context}"],
//         ...chatHistory,
//         ["user", "{input}"],
//     ]);

//     // Create a chain that uses the model, retriever, and prompt
//     console.log("[Step 5] Creating Document Combining Chain...");
//     const historyAwareCombineDocsChain = await createStuffDocumentsChain({
//         llm: model,
//         prompt: historyAwareRetrievalPrompt,
//     });
    
//     console.log("[Step 5] Creating Conversational Retrieval Chain...");
//     const conversationalRetrievalChain = await createRetrievalChain({
//         retriever: historyAwareRetrieverChain,
//         combineDocsChain: historyAwareCombineDocsChain,
//     });

//     console.log("[Step 5] Running Final Retrieval Chain...");
//     const reply = await conversationalRetrievalChain.invoke({
//         chat_history: chatHistory,
//         input: question,
//     });

//     console.log("[Step 5] 🤖 AI Response: ", reply.answer);
//     // console.log("[Step 5] 🤖 AI Response: ", reply?.answer ?? "❌ No response received from AI.");

//     return reply.answer;
    
// }
// Export the model and the run function
// export {model, generateLangchainCompletion};



