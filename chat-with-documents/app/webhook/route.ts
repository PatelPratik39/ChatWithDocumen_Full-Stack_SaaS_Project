// app/webhook/route.ts

import { adminDb } from "@/firebaseAdmin";
import stripe from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  console.log("🔔 Webhook Hit!");

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    console.error("❌ Missing Stripe-Signature header");
    return new Response("Missing Stripe-Signature", { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("❌ STRIPE_WEBHOOK_SECRET is not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    console.log(`✅ Received Stripe Event: ${event.type}`);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return new Response("Webhook signature error", { status: 400 });
  }

  const getUserByCustomerId = async (customerId: string) => {
    const snapshot = await adminDb
      .collection("users")
      .where("stripeCustomerId", "==", customerId)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, data: doc.data() };
    }

    console.warn("⚠️ No user found for customerId:", customerId);
    return null;
  };

  switch (event.type) {
    case "checkout.session.completed":
    case "payment_intent.succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;

      const user = await getUserByCustomerId(customerId);
      if (!user) return new Response("User not found", { status: 404 });

      await adminDb.collection("users").doc(user.id).update({
        hasActiveMemberShip: true,
      });

      console.log(`🔥 User ${user.id} upgraded to Pro (hasActiveMemberShip: true)`);
      break;
    }

    case "customer.subscription.deleted":
    case "subscription_schedule.canceled": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const user = await getUserByCustomerId(customerId);
      if (!user) return new Response("User not found", { status: 404 });

      await adminDb.collection("users").doc(user.id).update({
        hasActiveMemberShip: false,
      });

      console.log(`🛑 User ${user.id} downgraded (hasActiveMemberShip: false)`);
      break;
    }

    default:
      console.log(`🔸 Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}



// import { adminDb } from "@/firebaseAdmin";
// import stripe from "@/lib/stripe";
// import { headers } from "next/headers";
// import { NextRequest, NextResponse } from "next/server";
// import  Stripe from "stripe";

// export const dynamic = "force-dynamic"; // Ensure it's a dynamic API route

// export async function POST(req: NextRequest){
//     console.log("🔔 Webhook Hit!!");
    
//     const headersList = await headers();
//     console.log("🔹 Webhook Headers:", headersList);
    
//     const body = await req.text();    // important: must be req.text() and not req.json()
//     console.log("🔹 Webhook Body:", body);

//     const signature = headersList.get('stripe-signature');
//     console.log("🔹 Stripe Signature:", signature);

//     if(!signature){
//         console.error("❌ Missing Stripe-Signature header");
//         return new Response('Missing Stripe-Signature', {status: 400});
//     }
//     // if no Webhook secret is set
//     if(!process.env.STRIPE_WEBHOOK_SECRET){
//         console.log("❌ STRIPE_WEBHOOK_SECRET is not set");
//         return new Response('Stripe Webhook secret is not set', {status: 500});
//     }

//     let event: Stripe.Event;
//     try {
//         event = stripe.webhooks.constructEvent(
//             body,
//             signature,
//             process.env.STRIPE_WEBHOOK_SECRET
//         )
//         console.log("✅ Stripe event constructed:", event.type);
//     } catch (error) {
//         console.error("❌ Webhook signature verification failed:", error);
//         return new NextResponse(`Webhook Error: ${error}`, {status: 400});
//     }

//     const getUserDetails = async(customerId: string) => {
//         const userDoc = await adminDb
//         .collection('users')
//         .where('stripeCustomerId', '==', customerId)
//         .limit(1)
//         .get();

//         if(!userDoc.empty){
//             const doc = userDoc.docs[0];
//             return { id: doc.id, data: doc.data() };
//         }
//         console.warn("⚠️ No user found for customer ID:", customerId);
//         return null;
//     }
//     switch(event.type){
//         case "checkout.session.completed":
//         case "payment_intent.succeeded": {

//             const invoice = event.data.object;
//             console.log("🔹 Invoice:", invoice);
            
//             const customerId = invoice.customer as string;
//             console.log("🔹 Customer ID:", customerId);

//             if (!customerId) {
//                 console.warn("⚠️ Missing customer ID");
//                 break;
//             }

//             const userDetails = await getUserDetails(customerId);
//             if (!userDetails?.id) {
//                 return new NextResponse('User not found', { status: 404 });
//             }
//             // updaTE USER'S SUBSCRIPTION
//             await adminDb.collection("users").doc(userDetails.id).update({
//                 hasActiveMemberShip: true,
//             });
//             console.log("🔥 Firestore updated with hasActiveMemberShip: true");
//             // console.log("✅ User upgraded to Pro!");
//             break;

//             // return new NextResponse("Webhook processed successfully", { status: 200 });
//         }
//         // negative outcome
//         case "customer.subscription.deleted":
//         case "subscription_schedule.canceled":{
//             const subscription = event.data.object as Stripe.Subscription;
//             const customerId = subscription.customer as string;

//             const userDetails = await getUserDetails(customerId);

//             if(!userDetails?.id){
//                 return new NextResponse('User not found', {status: 404})
//             }

//             await adminDb.collection("users").doc(userDetails.id).update({
//                 hasActiveMemberShip: false,
//             });
//             console.log("🛑 Subscription canceled. Membership removed for user:", userDetails.id);
//             break;
//         }
//         default:
//             console.log(`Unhandled event type: ${event.type}`);
//     }
//     return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });
// }