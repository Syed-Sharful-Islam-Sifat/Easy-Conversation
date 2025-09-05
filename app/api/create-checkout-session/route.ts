import { type NextRequest, NextResponse } from "next/server"
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, userEmail } = await request.json()

    if (!priceId || !userId || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate price ID
    if (!Object.values(STRIPE_PRICE_IDS).includes(priceId)) {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`,
      customer_email: userEmail,
      metadata: {
        userId,
      },
      subscription_data: {
        metadata: {
          userId,
        },
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
