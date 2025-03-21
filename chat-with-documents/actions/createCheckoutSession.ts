'use server'

import { auth } from '@clerk/nextjs/server';
import { UserDetails } from '../app/dashboard/upgrade/page';
import { adminDb } from '@/firebaseAdmin';
import stripe from '@/lib/stripe';
import getBaseUrl from '@/lib/getBaseUrl';

export async function createCheckoutSession(UserDetails: UserDetails) {
    // auth();
    const {userId} = await auth();
    if(!userId){
        throw new Error('User not found');
    }

    // first check if the user has a stripe customer id
    let stripeCustomerId;

    const user = await adminDb.collection('users').doc(userId).get();
    stripeCustomerId = user.data()?.stripeCustomerId;

    if(!stripeCustomerId){
        // create a new customer in stripe

        const customer = await stripe.customers.create({
            email: UserDetails.email,
            name: UserDetails.name,
            metadata:{
                userId, 
            }
        });
        // store the customer id to database
        await adminDb.collection('users').doc(userId).set({
            stripeCustomerId: customer.id,
        });
        stripeCustomerId = customer.id;
    }

    const session =  await stripe.checkout.sessions.create({
        payment_method_types: ['card'], 
        line_items: [
            {
                price: process.env.STRIPE_PRICE_ID!, 
                quantity: 1,
            }
        ],
        mode: 'subscription',
        customer: stripeCustomerId,
        success_url: `${getBaseUrl()}/dashboard?upgrade=true`,
        cancel_url: `${getBaseUrl()}/upgrade`,
    });
    return session.id;
}
