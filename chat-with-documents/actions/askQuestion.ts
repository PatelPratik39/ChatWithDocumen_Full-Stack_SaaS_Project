"use server";

import { Message } from "@/components/Chat";
import { adminDb } from "@/firebaseAdmin";
import { generateLangchainCompletion } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";
import { serverTimestamp } from "firebase/firestore";

export async function askQuestion(id: string, question: string) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, message: "User not authenticated" };
  }

  const chatRef = adminDb
    .collection("users")
    .doc(userId!)
    .collection("files")
    .doc(id)
    .collection("chat");

  // Retrieve all user messages from chat
  const chatSnapshot = await chatRef.get();
  const userMessages = chatSnapshot.docs.filter(
    (doc) => doc.data().role === "human"
  );

  const userMessage: Message = {
    role: "human",
    message: question,
    createdAt: new Date(), // Ensure this is stored properly
  };

  await chatRef.add(userMessage);
//  await chatRef.add({ ...userMessage, createdAt: adminDb.serverTimestamp() }); // ✅ Store Firestore Timestamp

  // ✅ 2️⃣ Classify User Query Type for Structured Responses
  let responseInstruction = "";

  if (/\bdiagram\b|\bflowchart\b/i.test(question)) {
    responseInstruction =
      "Generate an ASCII or Markdown-based diagram with a clear breakdown of steps.";
  } else if (/\bsteps\b|\bprocess\b|\bexplanation\b|\bguide\b/i.test(question)) {
    responseInstruction =
      "Provide a step-by-step guide in a numbered format with detailed explanations.";
  } else if (/\bdefinition\b|\bmeaning\b|\bexplain\b/i.test(question)) {
    responseInstruction =
      "Define the term clearly, providing a short description followed by an example.";
  } else if (/\bsummary\b|\boverview\b|\brecap\b/i.test(question)) {
    responseInstruction =
      "Provide a structured summary with bullet points highlighting key aspects.";
  } else {
    responseInstruction = "Respond concisely with clarity, using appropriate formatting.";
  }

  // ✅ 3️⃣ Generate a Structured AI Prompt
  const prompt = `
  You are a friendly and intelligent AI assistant. Your goal is to provide **concise, natural, and engaging responses** to the user's questions.

  ---
  ## **📌 User's Question:**  
  - ${question}  

  ## **📝 Response Guidelines:**  
  ### **1️⃣ Handling Inappropriate Language**
  - If the user uses **offensive, inappropriate, or disrespectful language**, respond **firmly but politely**.
  - **Never engage in negativity** or reciprocate rudeness.
  - If the user is disrespectful, respond professionally:  
    - Example: *"I strive to maintain respectful and constructive conversations. Please use appropriate language."*
  - If necessary, redirect the conversation to a **neutral or productive topic**.
 
  ### **1️⃣ General Behavior**
  - Respond **casually & briefly** if the user greets you (e.g., "hello") → *Example: "Hey there! 😊 How can I help?"*
  - If the user **asks for facts**, keep answers **direct & informative** → *Example: "The Eiffel Tower is 330m tall. 🗼"*
  - If the user **asks for advice**, use **friendly, encouraging language** → *Example: "Believe in yourself! 🚀 You got this!"*
  - If the user **asks something humorous**, respond **playfully** → *Example: "Why did the computer catch a cold? It left its Windows open! 😆"*
  - If the user **asks an emotional or personal question**, show **empathy** → *Example: "I understand how you feel. 💙 Do you want some guidance?"*

  ### **2️⃣ Response Formatting**
  - **Keep answers short & direct** unless the question requires detail.
  - **Use emojis to match response sentiment** (e.g., 😊, 🚀, 😆, 💙, 🤔).
  - **Use bullet points or lists only when needed** to improve readability.
  - **Avoid unnecessary technical details unless explicitly requested.**
  - **Do NOT include system logs, debugging messages, or developer-specific instructions.**

  ---
  ## **🎯 Example Responses Based on User Intent**
  **🔹 User:** *"Hello there!"*  
  **🤖 AI:** "Hey! 👋 How’s your day going?"  

  **🔹 User:** *"Tell me a fun fact!"*  
  **🤖 AI:** "Did you know? An octopus has three hearts! ❤️❤️❤️"  

  **🔹 User:** *"How do I stay motivated?"*  
  **🤖 AI:** "Set small goals, celebrate wins, and stay positive! 💪🔥"  

  **🔹 User:** *"Can you tell me a joke?"*  
  **🤖 AI:** "Why don’t skeletons fight? Because they don’t have the guts! 😂"  

  ---
  **Now, generate an engaging, emoji-enhanced response based on the user's question.**
`;


  // ✅ 4️⃣ Generate AI Response
  let reply;
  try {
    reply = await generateLangchainCompletion(id, prompt);
  } catch (error) {
    console.error("❌ AI Response Generation Failed:", error);
    reply = "I'm sorry, but I couldn't process your request at the moment. Please try again later. 🙁";
  }

  const aiMessage: Message = {
    role: "ai",
    message: reply || "I'm not sure about that. 🙁",
    createdAt: new Date(),
  };

  await chatRef.add(aiMessage);
  // await chatRef.add({ ...aiMessage, createdAt: serverTimestamp() }); // ✅ Store Firestore Timestamp

  return {
    success: true,
    message: reply,
  };
}



// "use server";

// import { Message } from "@/components/Chat";
// import { adminDb } from "@/firebaseAdmin";
// import { generateLangchainCompletion } from "@/lib/langchain";
// import { auth } from "@clerk/nextjs/server";

// export async function askQuestion(id: string, question: string) {
//   // auth();

//   const { userId } = await auth();
//   if (!userId) {
//     return { success: false, message: "User not authenticated" };
//   }

//   const chatRef = adminDb
//     .collection("users")
//     .doc(userId!)
//     .collection("files")
//     .doc(id)
//     .collection("chat");

//   // Retrieve all user messages from chat
//   const chatSnapshot = await chatRef.get();
//   const userMessages = chatSnapshot.docs.filter(
//     (doc) => doc.data().role === "human"
//   );

//   const userMessage: Message = {
//     role: "human",
//     message: question,
//     createdAt: new Date(),
//   };

//   await chatRef.add(userMessage);

//   // ✅ 2️⃣ Classify User Query Type for Structured Responses
//   let responseInstruction = "";

//   if (/\bdiagram\b|\bflowchart\b/i.test(question)) {
//     responseInstruction =
//       "Generate an ASCII or Markdown-based diagram with a clear breakdown of steps.";
//   } else if (/\bsteps\b|\bprocess\b|\bexplanation\b|\bguide\b/i.test(question)) {
//     responseInstruction =
//       "Provide a step-by-step guide in a numbered format with detailed explanations.";
//   } else if (/\bdefinition\b|\bmeaning\b|\bexplain\b/i.test(question)) {
//     responseInstruction =
//       "Define the term clearly, providing a short description followed by an example.";
//   } else if (/\bsummary\b|\boverview\b|\brecap\b/i.test(question)) {
//     responseInstruction =
//       "Provide a structured summary with bullet points highlighting key aspects.";
//   } else {
//     responseInstruction = "Respond concisely with clarity, using appropriate formatting.";
//   }

//   // ✅ 3️⃣ Generate a Structured AI Prompt
// const prompt = `
//   You are an AI chatbot designed to generate responses in a **structured, well-formatted, and user-friendly manner**.

//   ---
//   ## **📌 User's Question:**  
//   - ${question}  

//   ## **📝 Response Guidelines:**  
//   ### **1️⃣ General Formatting Rules**
//   - **Use bold headings** (e.g., \`### Key Concepts\`)
//   - **Use subheadings** (e.g., \`#### Step 1\`) for better clarity
//   - **Use paragraphs** to separate ideas (e.g., "Paragraph 1")
//   - **Use bullet points** (e.g., \`- Step 1\`) for key points
//   - **Use numbered lists** (e.g., \`1. Step 1\`) for step-by-step instructions
//   - **Use italics** (e.g., \`*Example*\`) for emphasis
//   - **Use bold text** (e.g., \`**Important**\`) for highlighting

//   ### **2️⃣ Content Enhancement**
//   - **Use emoji** (e.g., \`:rocket:\`) to enhance readability where appropriate 🚀
//   - **Use block quotes** (e.g., \`> Insightful quote\`) for important notes
//   - **Use inline code formatting** (e.g., \`const x = 10;\`) for technical responses
//   - **Use code blocks** (\`\`\`json\n{ "key": "value" }\n\`\`\`) for structured code snippets
//   - **Use links** (e.g., \`[Click here](https://example.com)\`) for references
//   - **Use images** (e.g., \`![](https://example.com/image.png)\`) when relevant

//   ### **3️⃣ Clarity & Coherence**
//   - **Ensure a logical flow** of information
//   - **Avoid unnecessary repetition**
//   - **Use concise language** while providing enough context
//   - **If applicable, provide real-world examples** using *italics* or **bold**

//   ---
//   ## **🎯 Example Response Structure**
//   ### **🚀 Introduction**
//   *Briefly introduce the topic in 2-3 sentences.*

//   ### **🔹 Key Concepts**
//   - **Concept 1:** *Brief explanation*
//   - **Concept 2:** *Brief explanation*

//   ### **🛠 Step-by-Step Guide**
//   1. **Step 1:** *Do this first...*
//   2. **Step 2:** *Next, proceed with...*
//   3. **Step 3:** *Finally, complete by...*

//   ### **📌 Code Example (if applicable)**
//   \`\`\`javascript
//   function greet(name) {
//       return "Hello, " + name + "!";
//   }
//   console.log(greet("Alice"));
//   \`\`\`

//   ### **💡 Conclusion**
//   *Summarize key takeaways and encourage the user to explore further.*

//   ---
//   **Now, generate a well-structured response based on the user's query.**  
// `;


//   // ✅ 4️⃣ Generate AI Response
//   const reply = await generateLangchainCompletion(id, prompt);

//   const aiMessage: Message = {
//     role: "ai",
//     message: reply || "I'm not sure about that. 🙁",
//     createdAt: new Date(),
//   };

//   await chatRef.add(aiMessage);

//   return {
//     success: true,
//     message: reply,
//   };
// }
