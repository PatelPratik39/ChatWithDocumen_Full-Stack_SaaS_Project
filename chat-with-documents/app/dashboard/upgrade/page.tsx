
"use client"; // ✅ Makes this a Client Component

import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { CheckIcon } from 'lucide-react';
import React, { useTransition } from 'react'
import { useUser } from '@clerk/nextjs';
import useSubscription from "@/hooks/useSubscription";
import getStripe from "@/lib/stripe-js";
import { createCheckoutSession } from "@/actions/createCheckoutSession";

export type UserDetails = {
    email: string;
    name: string;
}

const PricingPage = () => {

    const { user } = useUser();
    const router = useRouter();
    const { hasActiveMemberShip, loading } = useSubscription();
    const [isPending, startTransition] = useTransition();

    const handleUpgrade =  () => {
        if (!user) return;
        const userDetails: UserDetails = {
            email: user.primaryEmailAddress?.toString()!,
            name: user.fullName!,
        }

        startTransition( async() => {
            // Load stripe
            const stripe = await getStripe();
            if(!stripe) return;

            if(hasActiveMemberShip){
                // create Stripe portal.....
            }

            const sessionId = await createCheckoutSession(userDetails);

            await stripe?.redirectToCheckout({
                sessionId,
                
            })

        })
    }

    return (
        <>
            <div className='py-24 sm:py-32'>
                <div className='mx-auto max-w-4xl'>
                    <div>
                        <h2 className='text-base font-semibold text-center leading-7 text-cyan-600'>Pricing</h2>
                        <p className='mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl'>Supercharge your document Companion</p>
                    </div>
                    <p className='mx-auto mt-6 max-w-2xl px-10 text-center text-lg leading-8 text-gray-600'>
                        Choose an affordable plan that fits with the best features for interacting with your documents,enhancing your productivity and efficiency.
                    </p>
                    <div className='max-w-md mx-auto mt-10 grid grid-cols-1 gap-8 sm:mt-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:gap-8'>
                        {/* Free Plan */}
                        <div className='ring-1 ring-gray-200 p-8 h-fit pb-12 rounded-3xl' >
                            <h3 className='text-lg font-semibold leading-8 text-cyan-900'>Starter Plan</h3>
                            <p>Explore Core Feature at No cost</p>
                            <p className='mt-6 flex items-baseline gap-x-1'>
                                <span className='text-4xl font-bold tracking-tight text-gray-900'>Free</span>
                            </p>
                            <ul role='list' className='mt-8, space-y-3 text-sm leading-6 text-gray-600'>
                                <li className='flex gap-x-3'>
                                    <CheckIcon className='h-6 w-5 flex-none text-cyan-600' />
                                    Documents
                                </li>
                                <li className='flex gap-x-3'>
                                    <CheckIcon className='h-6 w-5 flex-none text-cyan-600' />
                                    Up to 3 message per document
                                </li>
                                <li className='flex gap-x-3'>
                                    <CheckIcon className='h-6 w-5 flex-none text-cyan-600' />
                                    Try out the AI Chat Functionality
                                </li>
                            </ul>
                        </div>
                        {/* Pro Plan */}
                        <div className='ring-2 ring-cyan-600 rounded-3xl p-8'>
                            <h3 className='text-lg font-semibold leading-8 text-cyan-900'>
                                Pro Plan
                            </h3>
                            <p className='mt-4 text-sm leading-6 text-cyan-600'> Maximize Productivity with PRO Features</p>
                            <p className='mt-6 flex items-baseline gap-x-1'>
                                <span className='text-4xl font-bold tracking-tight text-gray-900'> $5.99</span>
                                <span className='text-sm font-semibold leading-6 text-gray-600'> / month</span>
                            </p>
                            <Button className='bg-cyan-600 w-full text-white shadow-sm hover:bg-cyan-500 mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold
                            leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600'
                                disabled={loading || isPending}
                                onClick={handleUpgrade}
                            >
                                {isPending || loading ? "Loading..." : hasActiveMemberShip ? "Manage Plan" : "Upgrade to PRO"}Upgrade to PRO
                            </Button>
                            <ul role='list' className='mt-8 space-y-3 text-sm leading-6 text-gray-600'>
                                <li className='flex gap-x-3'>
                                    <CheckIcon className='h-6 w-5 flex-none text-cyan-600' />
                                    Store upto 20 Documents
                                </li>
                                <li className='flex gap-x-3'>
                                    <CheckIcon className='h-6 w-5 flex-none text-cyan-600' />
                                    Ability to Delete Documents
                                </li>
                                <li className='flex gap-x-3'>
                                    <CheckIcon className='h-6 w-5 flex-none text-cyan-600' />
                                    Up to 100 messages per document
                                </li>
                                <li className='flex gap-x-3'>
                                    <CheckIcon className='h-6 w-5 flex-none text-cyan-600' />
                                    Full Power AI Chat functionality with memory Recall
                                </li>
                                <li className='flex gap-x-3'>
                                    <CheckIcon className='h-6 w-5 flex-none text-cyan-600' />
                                    Advance Analytics
                                </li>
                                <li className='flex gap-x-3'>
                                    <CheckIcon className='h-6 w-5 flex-none text-cyan-600' />
                                    24-hours support response time
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PricingPage;