
import Chat from "@/components/Chat";
import PdfView from "@/components/PdfView";
import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";


export default async function ChatToFilePage({ params }: { params: Promise<{ id: string | undefined }> }) {
    // const id = params?.id;
    const id = (await params)?.id;

    if (!id) {
        console.error("❌ No ID provided");
        return <div>Error: No ID provided ❌</div>;
    }

    const { userId } = await auth();
    if (!userId) {
        return <div>Error: User not authenticated ❌</div>;
    }

    const ref = await adminDb
        .collection("users")
        .doc(userId!)
        .collection("files")
        .doc(id as string)
        .get();

    if (!ref.exists) {
        console.error("❌ File not found in Firestore for ID:", id);
        return <div>Error: File not found ❌</div>;
    }

    const fileData = ref.data();
    console.log("✅ Firestore Document Data:", fileData);

    if (!fileData?.url) {
        console.error("❌ Firestore document found, but no `url` field exists.");
        return <div>Error: File URL not found in Firestore ❌</div>;
    }

    return (
        <div className="grid lg:grid-cols-5 h-full overflow-hidden">
            {/* Right */}
            <div className="col-span-5 lg:col-span-2 overflow-y-auto">{/* chat */}
                {/* {id && <Chat id={id as string} />} */}
                {/* <Chat id={id as string} /> */}
                <Chat id={id} />

            </div>

            {/* Left PDF Render */}
            <div className="col-span-5 lg:col-span-3 bg-gray-100 border-r-2 lg:border-cyan-600 lg:-order-1 overflow-y-auto">
                <PdfView url={fileData.url} />
            </div>
        </div>
    );
}







//  <div className='flex flex-col h-full overflow-scroll'>
{/* Chat Contents *
        //         <div className='flex-1 w-full'>
        //             {/* Chat Messages */}
//             {loading ? (
//                 <div className='flex justify-center items-center'>
//                     <Loader2Icon className='h-20 w-20 animate-spin text-cyan-600 mt-20' />
//                 </div>
//             ) : (
//                     <div className="flex flex-col space-y-2 px-4">
//                         {messages.length === 0 && (
//                             <ChatMessage
//                                 key={"placeholder"}
//                                 message={{
//                                     role: "ai",
//                                     message: "Ask me anything about this document!!",
//                                     createdAt: new Date(),
//                                 }}
//                             />
//                         )}
//                         {messages.map((message, index) => (
//                             <ChatMessage key={message.id || index} message={message} />
//                         ))}
//                         <div ref={bottomOfChatRef} />
//                     </div>
//             )}

//         </div>
//         <form onSubmit={handleSubmit} className="flex sticky bottom-0 space-x-2 p-5 bg-cyan-600/75" >
//             <Input
//                 className="bg-white text-black p-3 rounded-md shadow-md w-full focus:outline-none"
//                 placeholder="Ask a question.....❓"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//             />

//             <Button type='submit' disabled={!input || isPending} >
//                 {isPending ? (
//                     <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
//                 ) : (
//                     "Ask"
//                 )}

//             </Button>
//         </form>
//     </div >
// </>
