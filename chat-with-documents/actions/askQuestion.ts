"use server";

import { Message } from "@/components/Chat";
import { adminDb } from "@/firebaseAdmin";
import { generateLangchainCompletion } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";

// const FREE_LIMIT = 3;
// const PRO_LIMIT = 100;

export async function askQuestion(id: string, question: string) {
  auth();

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

  // how many user messages are in the chat
  const chatSnapshot = await chatRef.get();

  const userMessages = chatSnapshot.docs.filter(
    doc => doc.data().role === "human"
  );

  // limit the messages for PRO/Free users

  const userMessage: Message = {
    role: "human",
    message: question,
    createdAt: new Date()
  };

  await chatRef.add(userMessage);

  // ✅ 2️⃣ Classify User Query Type
  // ✅ Modify AI Prompt Based on Response Type
  let responseInstruction = "";

  if (
    question.toLowerCase().includes("diagram") ||
    question.toLowerCase().includes("flowchart")
  ) {
    responseInstruction =
      "Provide a structured analytical diagram as ASCII art or Markdown syntax. If possible, break down into numbered steps.";
  } else if (
    question.toLowerCase().includes("steps") ||
    question.toLowerCase().includes("explanation")
  ) {
    responseInstruction =
      "Provide a step-by-step numerical explanation with clear formatting.";
  } else {
    responseInstruction = "Answer concisely in a user-friendly manner.";
  }

  // ✅ 3️⃣ Modify AI Prompt Based on Response Type
  // const prompt = `
  // **User Query Type:** ${responseInstruction}
  // **User's Question:** ${question}
  // **AI Instructions:** Answer in a clear, structured, formatted way.
  // `;

    const prompt = `
    You are an AI chatbot that responds in a structured and readable format. 
        **User Query Type:** ${responseInstruction}
        - **User's Question:** ${question}
        - **Response Format:** 
        - Use **bold** for headings.
        - Use *italics* for example answers.
        - Use a **numbered list** if appropriate.
        - **AI Instructions:** Answer in a clear, structured, formatted way.

        Now generate a response based on the question.
    `;

  // Generate AI Response
  const reply = await generateLangchainCompletion(id, prompt);

  const aiMessage: Message = {
    role: "ai",
    message: reply || "I'm not sure about that.",
    createdAt: new Date()
  };

  await chatRef.add(aiMessage);

  return {
    success: true,
    message: reply
  };
}
