"use server"
import Stripe from "stripe"

console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY)
if (process.env.STRIPE_SECRET_KEY === undefined) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
})

export const STRIPE_PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly",
  business: process.env.STRIPE_BUSINESS_PRICE_ID || "price_business_monthly",
}

export const PLANS = {
  free: {
    name: "Free",
    conversationsLimit: 3,
    priceId: null,
  },
  pro: {
    name: "Pro",
    conversationsLimit: 30,
    priceId: STRIPE_PRICE_IDS.pro,
  },
  business: {
    name: "Business",
    conversationsLimit: -1, // unlimited
    priceId: STRIPE_PRICE_IDS.business,
  },
} as const

export type PlanType = keyof typeof PLANS
