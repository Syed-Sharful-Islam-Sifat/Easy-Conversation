import { type NextRequest, NextResponse } from "next/server"
import { SubscriptionService } from "@/lib/subscription-service"

export async function POST(request: NextRequest) {
  try {
    const { customerId, returnUrl } = await request.json()

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    const portalUrl = await SubscriptionService.createCustomerPortalSession(
      customerId,
      returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
    )

    return NextResponse.json({ url: portalUrl })
  } catch (error) {
    console.error("Error creating billing portal session:", error)
    return NextResponse.json({ error: "Failed to create billing portal session" }, { status: 500 })
  }
}
