'use server';

import { auth } from '@clerk/nextjs/server';
import { UserDetails } from '../app/dashboard/upgrade/page';
import { adminDb } from '@/firebaseAdmin';
import stripe from '@/lib/stripe';
import getBaseUrl from '@/lib/getBaseUrl';

export async function createCheckoutSession(userDetails: UserDetails) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('❌ Clerk user ID not found');
    }

    // Firestore: get the user document
    const userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();

    let stripeCustomerId = userSnap.data()?.stripeCustomerId;

    if (!stripeCustomerId) {
      // Create a Stripe Customer
      const customer = await stripe.customers.create({
        email: userDetails.email,
        name: userDetails.name,
        metadata: {
          userId,
        },
      });

      // Save customer ID to Firestore, safely merge with existing fields
      await userRef.set(
        {
          stripeCustomerId: customer.id,
        },
        { merge: true }
      );

      stripeCustomerId = customer.id;
      console.log('✅ Created Stripe customer:', customer.id);
    } else {
      console.log('ℹ️ Existing Stripe customer found:', stripeCustomerId);
    }

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1R5WpEKH04LixpG7Q1Kho9M3', // ✅ make sure this is correct in Stripe dashboard
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer: stripeCustomerId,
      success_url: `${getBaseUrl()}/dashboard?upgrade=true`,
      cancel_url: `${getBaseUrl()}/upgrade`,
    });

    console.log('✅ Stripe Checkout session created:', session.id);
    return session.id;
  } catch (err) {
    console.error('❌ Error creating Stripe checkout session:', err);
    throw err;
  }
}



// 'use server'

// import { auth } from '@clerk/nextjs/server';
// import { UserDetails } from '../app/dashboard/upgrade/page';
// import { adminDb } from '@/firebaseAdmin';
// import stripe from '@/lib/stripe';
// import getBaseUrl from '@/lib/getBaseUrl';

// export async function createCheckoutSession(userDetails: UserDetails) {

//     try{
//     // auth();
//     const {userId} = await auth();
//     if(!userId){
//         throw new Error('User not found');
//     }

//     // first check if the user has a stripe customer id
//     let stripeCustomerId;

//     const user = await adminDb.collection('users').doc(userId).get();
//     stripeCustomerId = user.data()?.stripeCustomerId;
//     if (!user.exists) {
//         console.log(`⚠️ No Firestore user found for userId: ${userId}`);
//     }


//     // create a new customer in stripe
//     if(!stripeCustomerId){
//         const customer = await stripe.customers.create({
//             email: userDetails.email,
//             name: userDetails.name,
//             metadata:{
//                 userId, 
//             }
//         });

//         // store the customer id to database
//         await adminDb.collection('users').doc(userId).set({
//             stripeCustomerId: customer.id,
//         },{merge: true});
//         stripeCustomerId = customer.id;
//         console.log("✅ [Step 1] Created Stripe Customer:", customer.id);
        
//     }
//     //  Create Stripe Checkout session
//     const session =  await stripe.checkout.sessions.create({
//         payment_method_types: ['card'], 
//         line_items: [
//             {
//                 price: "price_1R5WpEKH04LixpG7Q1Kho9M3", 
//                 quantity: 1,
//             }
//         ],
//         mode: 'subscription',
//         customer: stripeCustomerId,
//         success_url: `${getBaseUrl()}/dashboard?upgrade=true`,
//         cancel_url: `${getBaseUrl()}/upgrade`,
//     });
//     return session.id;
//     } catch (err) {
//     console.error("❌ Error creating Stripe checkout session:", err);
//     throw err;
//   }
// }
