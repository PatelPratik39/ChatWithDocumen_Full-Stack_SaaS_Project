export default function ChatToFilePage({ params }: { params: { id: string } }) {
    if (!params.id) {
        console.error("❌ No ID received in page.tsx");
        return <div>Error: No ID provided.</div>;
    }

    return (
        <div>
            ChatToFilePage : {params.id}
        </div>
    );
}
