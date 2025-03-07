'use client'

import React, { FormEvent, useEffect, useRef, useState, useTransition } from 'react'
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2Icon } from 'lucide-react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useUser } from '@clerk/nextjs';
import { db } from '@/firebase';
import { collection, orderBy, query } from 'firebase/firestore';
import { askQuestion } from '@/actions/askQuestion';
import ChatMessage from './ChatMessage';
// import ChatMessage from './ChatMessage';


export type Message = {
    id?: string;
    role: "human" | "ai" | "placeholder";
    message: string;
    createdAt: Date;
}

const Chat = ({ id }: { id: string }) => {
    const { user } = useUser();

    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isPending, startTransition] = useTransition();

    const bottomOfChatRef = useRef<HTMLDivElement>(null);

    const [snapshot, loading, error] = useCollection(
        user && query(
            collection(db, "users", user?.id, "files", id, "chat"),
            orderBy('createdAt', 'asc')
        )
    );

    useEffect(() => {
        bottomOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
    },[messages])

    useEffect(() => {
        if (!snapshot) return;
        console.log("Updated Snapshot: ", snapshot.docs);

        // get second last message to check if the AI is thinking
        const lastMessage = messages.pop();
        if (lastMessage?.role === "ai" && lastMessage.message === "Thinking...") {
            return;
        }
        const newMessages = snapshot.docs.map(doc => {
            const { role, message, createdAt } = doc.data();
            return {
                id: doc.id,
                role,   
                message,
                createdAt: createdAt.toDate(),
            }
        });
        setMessages(newMessages);

    }, [snapshot]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const q = input.trim();  // trim leading and trailing spaces
        if(!q) return;
        setInput("");

        // Optimistic UI update
        setMessages((prev) => [
            ...prev,
            { role: "human", message: q, createdAt: new Date() },
            { role: "ai", message: "Thinking...", createdAt: new Date() },
        ]);

        startTransition(async () => {
            const { success, message } = await askQuestion(id, q);
            if (!success) {
                setMessages((prev) =>
                    prev.slice(0, prev.length - 1).concat([{
                        role: "ai",
                        message: `Whoops...${message}`,
                        createdAt: new Date(),
                    }])
                );
            }
        });
    };

return (
        <div className='flex flex-col h-full overflow-scroll'>

            {/* Chat Content */}
            <div className=' flex-1 w-full'>
                {/* chat messages */}

            
                {loading ? (
                <div className='flex justify-center items-center'>
                    <Loader2Icon className='animate-spin h-20 w-20 text-cyan-600 mt-20' />
                </div>
                    
                ):(
                <div>
                    {messages.map((message) => (
                        <div key={message.id}>
                            <p>{message.message}</p>
                        </div>
                    ))}
                       {/* { messages.length === 0 && (
                           <ChatMessage key={"placeholder"}
                           message={{
                              role: "ai",
                              message: "Ask me anything about this document",
                              createdAt: new Date(), 
                           }} />
                       )}
                       {messages.map((message,index) => (
                        <ChatMessage key={index} message={message} />
                       ))} 
                       <div ref={bottomOfChatRef} /> */}
                </div>
                )}

            </div>

            {/* Chat Input */}
            <form
                onSubmit={handleSubmit}
                className='flex sticky bottom-0 space-x-2 p-5 bg-cyan-600/75 border-t border-cyan-600'
            >
                <Input
                    placeholder='Ask a question'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className='border bg-white border-cyan-600'
                />
                <Button type='submit' disabled={!input || isPending}>
                    {isPending ? (
                        <Loader2Icon className='animate-spin h-5 w-5' />
                    ) : (
                        "Ask"
                    )}
                </Button>
            </form>

        </div>
    )
}

export default Chat

