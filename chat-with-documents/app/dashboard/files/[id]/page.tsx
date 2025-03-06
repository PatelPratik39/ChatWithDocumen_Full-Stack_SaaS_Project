
import Chat from "@/components/Chat";
import PdfView from "@/components/PdfView";
import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";


export default async function ChatToFilePage({ params }: { params?: { id?: string } }) {
    const id = params?.id;

    if(!id){
        console.error("❌ No ID provided");
        return <div>Error: No ID provided ❌</div>;
    }

    const { userId } = await auth();
    if (!userId) {
        return <div>Error: User not authenticated ❌</div>;
    }

    const ref = await adminDb
        .collection("users")
        .doc(userId)
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
                {id && <Chat id={id as string} />}

            </div>

            {/* Left PDF Render */}
            <div className="col-span-5 lg:col-span-3 bg-gray-100 border-r-2 lg:border-cyan-600 lg:-order-1 overflow-y-auto">
                <PdfView url={fileData.url} />
            </div>
        </div>
    );
}
