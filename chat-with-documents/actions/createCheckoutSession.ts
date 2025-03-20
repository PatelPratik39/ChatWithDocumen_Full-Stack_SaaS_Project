'use server'

import { auth } from '@clerk/nextjs/server';
import { UserDetails } from '../app/dashboard/upgrade/page';
import { adminDb } from '@/firebaseAdmin';

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
        
    }
    
}
