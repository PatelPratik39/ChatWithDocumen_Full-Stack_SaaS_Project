import Chat from "@/components/Chat";
import PdfView from "@/components/PdfView";
import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";

export default async function ChatToFilePage({ params }: { params?: { id: string } }) {
    if (!params?.id) {
        console.error("❌ Missing file ID in route parameters.");
        return <div>Error: Missing file ID ❌</div>;
    }

    const { userId } = await auth();
    if (!userId) {
        return <div>Error: User not authenticated ❌</div>;
    }

    console.log("✅ Fetching file for user:", userId, "with file ID:", params.id);

    const ref = await adminDb
        .collection("users")
        .doc(userId)
        .collection("files")
        .doc(params.id)
        .get();

    if (!ref.exists) {
        console.error("❌ File not found in Firestore for ID:", params.id);
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
                <Chat id={params.id} />
            </div>

            {/* Left PDF Render */}
            <div className="col-span-5 lg:col-span-3 bg-gray-100 border-r-2 lg:border-cyan-600 lg:-order-1 overflow-y-auto">
                <PdfView url={fileData.url} />
            </div>
        </div>
    );
}
