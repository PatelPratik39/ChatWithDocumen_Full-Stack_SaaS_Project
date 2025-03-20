import {loadStripe, Stripe} from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

if(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === undefined){
    throw new Error('Missing Stripe Publishable Key');
}

const getStripe = (): Promise<Stripe | null> => {
    if (!stripePromise) {
        stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    }
    return stripePromise;
}
export default getStripe;