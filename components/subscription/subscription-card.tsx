"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { PLANS, type PlanType } from "@/lib/stripe"
import { Calendar, CreditCard, Settings, Loader2 } from "lucide-react"

interface SubscriptionCardProps {
  plan: PlanType
  usage?: number
  subscriptionStatus?: string
  currentPeriodEnd?: Date
  stripeCustomerId?: string
}

export function SubscriptionCard({
  plan,
  usage = 0,
  subscriptionStatus = "active",
  currentPeriodEnd,
  stripeCustomerId,
}: SubscriptionCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const planDetails = PLANS[plan] || {
    name: "Unknown",
    conversationsLimit: 0,
    priceId: null,
  }

  const handleManageBilling = async () => {
    if (!stripeCustomerId) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/billing-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: stripeCustomerId,
          returnUrl: window.location.href,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      window.location.href = url
    } catch (error) {
      console.error("Error opening billing portal:", error)
      // TODO: Show error toast
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = () => {
    switch (subscriptionStatus) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
      case "canceled":
        return <Badge variant="destructive">Canceled</Badge>
      case "past_due":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Past Due</Badge>
      default:
        return <Badge variant="secondary">{subscriptionStatus}</Badge>
    }
  }

  const getUsageText = () => {
    if (planDetails.conversationsLimit === -1) {
      return `${usage} conversations this month`
    }
    return `${usage} / ${planDetails.conversationsLimit} conversations this month`
  }

  const getUsagePercentage = () => {
    if (planDetails.conversationsLimit === -1) return 0
    return (usage / planDetails.conversationsLimit) * 100
  }

  if (!plan || !PLANS[plan]) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invalid Plan</CardTitle>
          <CardDescription>Please contact support</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {planDetails.name} Plan
              {getStatusBadge()}
            </CardTitle>
            <CardDescription>
              {plan === "free" ? "Free forever" : `$${plan === "pro" ? "9" : "29"}/month`}
            </CardDescription>
          </div>
          <CreditCard className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Usage</span>
            <span className="font-medium">{getUsageText()}</span>
          </div>
          {planDetails.conversationsLimit !== -1 && (
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
              />
            </div>
          )}
        </div>

        {currentPeriodEnd && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {subscriptionStatus === "canceled" ? "Expires" : "Renews"} on {currentPeriodEnd.toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="flex gap-2">
          {plan !== "free" && stripeCustomerId && (
            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={isLoading}
              className="flex-1 bg-transparent"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Billing
                </>
              )}
            </Button>
          )}
          {plan === "free" && (
            <Button asChild className="flex-1">
              <a href="/pricing">Upgrade Plan</a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
