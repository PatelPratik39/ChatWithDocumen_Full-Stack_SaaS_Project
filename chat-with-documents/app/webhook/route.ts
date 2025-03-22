import { adminDb } from "@/firebaseAdmin";
import stripe from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Stripe } from "stripe";

export const dynamic = "force-dynamic"; // Ensure it's a dynamic API route


export async function POST(req: NextRequest){
    console.log("Webhook Hit!!✅");
    
    const headersList = await headers();
    const body = await req.text();    // important: must be req.text() and not req.json()
    console.log("🔹 Webhook Body:", body);

    const signature = headersList.get('stripe-signature');
    console.log("🔹 Stripe Signature:", signature);


    if(!signature){
        return new Response('Missing Stripe-Signature', {status: 400});
    }
    if(!process.env.STRIPE_WEBHOOK_SECRET){
        console.log("❌ STRIPE_WEBHOOK_SECRET is not set");
        return new Response('Stripe Webhook secret is not set', {status: 400});
    }
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error) {
        console.error(`Webhook Error: ${error}`);
        return new NextResponse(`Webhook Error: ${error}`, {status: 400});
    }

    const getUserDetails = async(customerId: string) => {
        const userDoc = await adminDb
        .collection('users')
        .where('stripeCustomerId', '==', customerId)
        .limit(1)
        .get();

        if(!userDoc.empty){
            return userDoc.docs[0];
        }
        // return null;
    }
    switch(event.type){
        case 'checkout.session.completed':
        case "payment_intent.succeeded": {
            // const session = event.data.object as Stripe.Checkout.Session;
            // const customerId = session.customer as string;

            const invoice = event.data.object;
            console.log("🔹 Invoice:", invoice);
            
            const customerId = invoice.customer as string;
            console.log("🔹 Customer ID:", customerId);

            const userDetails = await getUserDetails(customerId);
            if (!userDetails?.id) {
                return new NextResponse('User not found', { status: 404 });
            }
            // updaTE USER'S SUBSCRIPTION
            await adminDb.collection("users").doc(userDetails.id).update({
                hasActiveMemberShip: true,
            });
            console.log("✅ User upgraded to Pro!");
            break;

            // return new NextResponse("Webhook processed successfully", { status: 200 });
        }
        // negative outcome
        case "customer.subscription.deleted":
        case "subscription_schedule.canceled":{
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;

            const UserDetails = await getUserDetails(customerId);

            if(!UserDetails?.id){
                return new NextResponse('User not found', {status: 404})
            }

            await adminDb.collection("users").doc(UserDetails.id).update({
                hasActiveMemberShip: false,
            });
            console.log("❌ Subscription canceled. User downgraded.");
            break;
        }
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }
    return NextResponse.json({message: "Webhook received"}, {status: 200});
}