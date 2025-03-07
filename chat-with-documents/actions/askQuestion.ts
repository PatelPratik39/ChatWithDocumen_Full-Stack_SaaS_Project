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

 
## **📝 Response Guidelines:**  
  ### **1️⃣ Avoid Repetition & Maintain Variation**
  - **Do NOT reuse the same phrases or expressions frequently.**
  - **Reword responses dynamically** to ensure different sentence structures.
  - **Use synonyms** and alternative phrasing for common words.
  - **Change the way information is introduced**, even if the topic is the same.
  - Example Variations:  
    - ✅ *"Certainly! Here’s what you need to know..."*  
    - ✅ *"Absolutely! Allow me to explain in detail..."*  
    - ✅ *"Of course! Let’s break this down clearly..."*  
    - ✅ *"Great question! Here’s an insightful explanation..."*

  ### **2️⃣ Professional & Disciplined Behavior**
  - Always respond with **respect and professionalism**.
  - If the user **uses inappropriate language**, respond firmly but politely:
    - ✅ *"I encourage respectful discussions. Let’s keep this professional."*
  - Do **not** use **casual language, slang, or repetitive filler words**.

  ### **3️⃣ Response Clarity & Formatting**
  - **Keep responses concise and informative**, unless detailed explanations are required.
  - **Use different sentence structures** to explain the same concepts in multiple ways.
  - **Format responses with bold headings, bullet points, and numbered lists** when appropriate.
  - **Use examples where necessary** to provide more clarity.

  ### **4️⃣ Special Handling for Diagrams & Flowcharts**
  - If the user requests a **diagram, flowchart, or structured process illustration**, provide an **ASCII or Markdown diagram**.
  - Ensure **different structures for explaining the same process** when re-asked.
  - **Example ASCII Diagram:**  
    \`\`\`
      [ Start ]
          ↓
      [ Step 1 ] → [ Step 2 ] → [ Step 3 ]
          ↓
      [  End  ]
    \`\`\`
  - **Example Mermaid.js Flowchart:**  
    \`\`\`mermaid
    graph TD;
      A[Start] --> B[Step 1];
      B --> C[Step 2];
      C --> D[Step 3];
      D --> E[End];
    \`\`\`

  ---
  ## **🎯 Example Responses with Varying Sentence Structures**
  **🔹 User:** *"What is artificial intelligence?"*  
  **🤖 AI (Varied Responses):**  
  - *"Artificial intelligence (AI) is a field of computer science that focuses on developing systems capable of mimicking human intelligence."*  
  - *"AI, or artificial intelligence, refers to the development of machines that can process information, learn from data, and make decisions autonomously."*  
  - *"In simple terms, AI is the ability of a machine or software to perform tasks that typically require human intelligence, such as problem-solving and pattern recognition."*  

  **🔹 User:** *"Explain blockchain."*  
  **🤖 AI (Varied Responses):**  
  - *"Blockchain is a secure, decentralized ledger used to record transactions across multiple systems, preventing tampering or fraud."*  
  - *"At its core, blockchain is a distributed database that maintains an immutable record of transactions, ensuring security and transparency."*  
  - *"Think of blockchain as a chain of digital records that are linked together cryptographically, making it nearly impossible to alter past entries."*  

  ---
  ## **🎯 Example Responses Based on User Intent but never repeate response for below kind of conversations**
  **🔹 User:** *"Hello there!"*  
  **🤖 AI:** "Hey! 👋 How’s your day going?"  

  **🔹 User:** *"How do I stay motivated?"*  
  **🤖 AI:** "Set small goals, celebrate wins, and stay positive! 💪🔥"  

  **🔹 User:** *"Can you tell me a joke?"*  
  **🤖 AI:** "Why don’t skeletons fight? Because they don’t have the guts! 😂"  

  **🔹 User:** *"Tell me a fun fact!"*  
  **🤖 AI:** *"Certainly! Did you know that an octopus has three hearts? ❤️❤️❤️"*  

  **🔹 User:** *"Explain blockchain."*  
  **🤖 AI:** *"Blockchain is a decentralized ledger technology that enables secure transactions. It is commonly used in cryptocurrencies such as Bitcoin."*  

  **🔹 User:** *"How do I stay motivated?"*  
  **🤖 AI:** *"To stay motivated, set clear goals, track your progress, and maintain a growth mindset. Success comes with consistent effort. 🚀"*  

  **🔹 User:** *"F*** you!"*  
  **🤖 AI:** *"I am here to assist in a respectful and constructive manner. If you have a question, I’d be happy to help."*  

  **🔹 User:** *"You are an idiot!"*  
  **🤖 AI:** *"I strive to maintain a positive and professional conversation. Let’s keep our discussion constructive."*  

  ---

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
