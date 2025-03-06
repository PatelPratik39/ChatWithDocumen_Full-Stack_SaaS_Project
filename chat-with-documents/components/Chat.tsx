'use client'
import React, { FormEvent, startTransition, useEffect, useState, useTransition } from 'react'
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2Icon } from 'lucide-react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useUser } from '@clerk/nextjs';
// import {askQuestion, Message} from '@/actions/askQuestion';
import { ChatMessage } from '@langchain/core/messages';
import { db } from '@/firebase';
import { collection, orderBy, query } from 'firebase/firestore';


export type Message = {
    id?: string;
    role: "human" | "ai" | "placeholder";
    message: string;
    createdAt: Date;

}

const Chat = ({ id }: { id: string }) => {
    const { user } = useUser();

    const [input, setInput] = useState("");
    const [message, setMessage] = useState<Message[]>([]);
    const [isPending, setInPending] = useTransition();

    const [snapshot, loading, error] = useCollection(
        user && query(
            collection(db, "users", user.id, "files", id, "chat"),
            orderBy("createdAt", "asc")
        )
    )
    useEffect(() => {
        if (!snapshot) return;
        console.log("Updated snapshot: ", snapshot.docs);

    }, [snapshot])


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const q = input;
        setInput("");

        // Optimastic UI update
        setMessage((prev) => [
            ...prev,
            {
                role: "human",
                message: q,
                createdAt: new Date(),

            }, {
                role: "ai",
                message: "Thinking.....",
                createdAt: new Date(),

            },
        ])
        startTransition(async () => {
            const { success, message } = await askQuestion(id, q);
            if (!success) {

                // toast.error(message);
                setMessage((prev) =>
                    prev.slice(0, prev.length - 1).concat([{
                        role: "ai",
                        message: `Whoops...${message}`,
                        createdAt: new Date(),
                    }]
                ))
            }
        })

    }

    return (
        <>
            <div className='flex flex-col h-full overflow-scroll'>
                {/* Chat Contents */}
                <div className='flex-1 w-full'>
                    {/* Chat Messages */}

                </div>
                <form onSubmit={handleSubmit} className="flex sticky bottom-0 space-x-2 p-5 bg-cyan-600/75" >
                    <Input
                        className="bg-white text-black p-3 rounded-md shadow-md w-full focus:outline-none"
                        placeholder="Ask a question.....❓"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />

                    <Button type='submit' disabled={!input || isPending} >
                        {isPending ? (
                            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            "Ask"
                        )}

                    </Button>
                </form>
            </div>
        </>
    )
}

export default Chat


