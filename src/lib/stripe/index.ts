import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});

export const PLANS = {
  premium: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    name: "Premium",
    price: 29,
  },
} as const;
