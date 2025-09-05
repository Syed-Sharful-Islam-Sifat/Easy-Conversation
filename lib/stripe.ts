import Stripe from "stripe"

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-11-20.acacia",
    })
  : null

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
