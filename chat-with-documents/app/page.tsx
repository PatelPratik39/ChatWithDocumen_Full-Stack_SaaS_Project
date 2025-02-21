import { Button } from "@/components/ui/button";
import { BrainCogIcon, EyeIcon, GlobeIcon, MonitorSmartphoneIcon, ServerCogIcon, ZapIcon } from "lucide-react";
import Link from "next/link";


const features = [
  {
    name: "Store your PDF Documents",
    description: "Keep all your important PDF files securely stored and easily accessible anytime, anywhere.",
    icon: GlobeIcon,
  },
  {
    name: "Blazing Fast Responses",
    description: "Experience lightning-fast answers to your queries, ensuring you get the information you need instantly.",
    icon: ZapIcon,
  },
  {
    name: "Chat Memorisation",
    description: "Our intelligent chatbot remembers previous interactions, providing a seamless and personalized experience.",
    icon: BrainCogIcon,
  },
  {
    name: "Interactive PDF Viewer",
    description: "Engage with your PDFs like never before using our intuitive and interactive viewer.",
    icon: EyeIcon,
  },
  {
    name: "Cloud Backup",
    description: "Rest assured knowing your documents are safely backed up on the cloud, protected from loss or damage.",
    icon: ServerCogIcon,
  },
  {
    name: "Responsive on All Devices",
    description: "Access our chatbot on any device, whether it's a computer, tablet, or smartphone.",
    icon: MonitorSmartphoneIcon,
  }
];


export default function Home() {
  return (
    <main className=" flex-1 bg-gradient-to-bl from-white to-cyan-600 overflow-scroll p-2 lg:p-5">
      <div className="bg-white py-24 sm:py-32 rounded-md drop-shadow-xl">
        <div className="flex flex-col items-center justify-center mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-base font-semibold leading-7 text-cyan-600">Your Interactive Documents Companion</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-800 sm:text-6xl"> Transform your Documents into Interactve Conversations</p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Introducing{" "}
              <span className="font-bold text-cyan-600">Chat with PDF.</span>
              <br />
              <br />
              Upload your document, and our chatbot will answer questions, summarize content, and answer all your Qs. Ideal for everyone,{" "}
              <span className="text-cyan-600">Chat with PDF</span>{" "}
              turns static documents into{" "}
              <span className="font-bold">dynamic conversations</span>, enhancing productivity 10x fold effortlessly.
            </p>
          </div>
          <Button asChild className="mt-10">
            <Link href='/dashboard'> Get Started </Link>
          </Button>
        </div>
      </div>

    </main>
  );
}
