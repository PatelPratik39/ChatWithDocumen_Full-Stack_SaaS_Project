
'use server'

import { Message } from '@/components/Chat';
import { adminDb } from '@/firebaseAdmin';
import { auth } from '@clerk/nextjs/server';
// import {generateLangchainCompletion} from "@/lib/langchain";

const FREE_LIMIT = 3;
const PRO_LIMIT = 100;

export async function askQuestion(id: string, question: string) {
    auth();

    const {userId} = await auth();
    const charRef = adminDb.collection('users').doc(userId!).collection('files').doc(id).collection('chat');

    // howmany user messages are in the chat
    const chatSnapshot = await charRef.get();
    const chatMessages = chatSnapshot.docs.filter( (doc) => doc.data().role === 'human');

    // limit the messages for PRO/Free users

    const userMessage:  Message = {
        role: 'ai',
        message: question,
        createdAt: new Date(),
    }

    await charRef.add(userMessage);

    // Generate AI Response
    const reply = await generateLangchainCompletion(id,question);
    
    return {
        success: true,
        message: reply
    }
}
