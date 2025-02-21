import { Button } from "@/components/ui/button";
import {
  BrainCogIcon,
  EyeIcon,
  GlobeIcon,
  MonitorSmartphoneIcon,
  ServerCogIcon,
  ZapIcon
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
    <main className="flex-1 bg-gradient-to-bl from-white to-cyan-600 overflow-scroll p-4 lg:p-6">
      <div className="bg-white py-16 sm:py-24 rounded-md drop-shadow-xl">

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center mx-auto max-w-5xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-base font-semibold leading-7 text-cyan-600">
              Your Interactive Documents Companion
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-800 sm:text-5xl">
              Transform your Documents into Interactive Conversations
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Introducing{" "}
              <span className="font-bold text-cyan-600">Chat with PDF.</span>
              <br />
              Upload your document, and our chatbot will answer questions, summarize content, and answer all your queries.
              Ideal for everyone, <span className="text-cyan-600">Chat with PDF</span>{" "}
              turns static documents into{" "}
              <span className="font-bold">dynamic conversations</span>, enhancing productivity 10x fold effortlessly.
            </p>
          </div>
          <Button asChild className="mt-8">
            <Link href='/dashboard'> Get Started </Link>
          </Button>
        </div>

        {/* Feature Image Section */}
        <div className="relative overflow-hidden pt-16">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            {/* Fix Image Overflow */}
            <Image
              alt="App Screenshot"
              src="https://i.imgur.com/VciRSTI.jpeg"
              width={1200}
              height={800}
              className="w-full h-auto rounded-xl shadow-2xl ring-1 ring-gray-900/10"
            />
            <div aria-hidden="true" className="relative" >
              <div className="absolute bottom-0 -inset-x-32 bg-gradient-to-t from-white/95 pt-[5%]" />
            </div>
          </div>
        </div>

        {/* <div>
          <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            {features.map((feature) => (
              <div className="relative pl-9">
                <dt  key={index } className="inline font-semibold text-gray-900">
                  <feature.icon 
                  aria-hidden="true" className="absolute h-12 w-12 text-cyan-600"/>
                </dt>
                <dd>
                  <p className="text-gray-600">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div> */}

        {/* Features Section */}
        <div className="mt-16 max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-100 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <feature.icon className="h-12 w-12 text-cyan-600 mb-4" />
                <h3 className="text-lg font-semibold">{feature.name}</h3>
                <p className="text-gray-600 text-sm mt-2">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}



// export default function Home() {
//   return (
//     <main className=" flex-1 bg-gradient-to-bl from-white to-cyan-600 overflow-hidden p-2 lg:p-5">
//       <div className="bg-white py-24 sm:py-32 rounded-md drop-shadow-xl">
//         <div className="flex flex-col items-center justify-center mx-auto max-w-7xl px-6 lg:px-8">
//           <div className="mx-auto max-w-2xl sm:text-center">
//             <h2 className="text-base font-semibold leading-7 text-cyan-600">Your Interactive Documents Companion</h2>
//             <p className="mt-2 text-3xl font-bold tracking-tight text-gray-800 sm:text-6xl"> Transform your Documents into Interactve Conversations</p>
//             <p className="mt-6 text-lg leading-8 text-gray-600">
//               Introducing{" "}
//               <span className="font-bold text-cyan-600">Chat with PDF.</span>
//               <br />
//               <br />
//               Upload your document, and our chatbot will answer questions, summarize content, and answer all your Qs. Ideal for everyone,{" "}
//               <span className="text-cyan-600">Chat with PDF</span>{" "}
//               turns static documents into{" "}
//               <span className="font-bold">dynamic conversations</span>, enhancing productivity 10x fold effortlessly.
//             </p>
//           </div>
//           <Button asChild className="mt-10">
//             <Link href='/dashboard'> Get Started </Link>
//           </Button>
//         </div>

//         <div className="relative overflow-hidden pt-16">
//           <div className="mx-auto max-w-7xl px-6 lg:px-8">
//             <Image  alt="App Screenshot"  src="https://i.imgur.com/VciRSTI.jpeg" width={2432} height={1442} className="mb-[-0%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"/>
//             <div aria-hidden="true" className="relative">
//               <div  className="absolute bg-gradient-to-t from-white/95 pt-[5%] "/>

              
//             </div>
//           </div>
//         </div>
//       </div>

//     </main>
//   );
// }
