"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface CheckoutButtonProps {
  priceId: string
  planName: string
  className?: string
}

export function CheckoutButton({ priceId, planName, className }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleCheckout = async () => {
    if (!user) {
      router.push("/auth/signin")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          userEmail: user.email,
        }),
      })

      const { sessionId, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Redirect to Stripe Checkout
      const stripe = (await import("@stripe/stripe-js")).loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

      const stripeInstance = await stripe
      if (stripeInstance) {
        await stripeInstance.redirectToCheckout({ sessionId })
      }
    } catch (error) {
      console.error("Checkout error:", error)
      // TODO: Show error toast
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={isLoading} className={className}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          Subscribe to {planName}
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  )
}
