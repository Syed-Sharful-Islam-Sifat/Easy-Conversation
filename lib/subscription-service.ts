import { stripe, PLANS, type PlanType } from "@/lib/stripe"

export interface UserSubscription {
  id: string
  userId: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  plan: PlanType
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
}

export class SubscriptionService {
  static async createCustomerPortalSession(customerId: string, returnUrl: string) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      })
      return session.url
    } catch (error) {
      console.error("Error creating customer portal session:", error)
      throw new Error("Failed to create billing portal session")
    }
  }

  static async getSubscriptionByUserId(userId: string): Promise<UserSubscription | null> {
    // TODO: Implement database query when database integration is added
    // For now, return mock data or null
    console.log(`[v0] Getting subscription for user ${userId}`)
    return null
  }

  static async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })
      console.log(`[v0] Subscription ${subscriptionId} marked for cancellation`)
      return subscription
    } catch (error) {
      console.error("Error cancelling subscription:", error)
      throw new Error("Failed to cancel subscription")
    }
  }

  static async reactivateSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      })
      console.log(`[v0] Subscription ${subscriptionId} reactivated`)
      return subscription
    } catch (error) {
      console.error("Error reactivating subscription:", error)
      throw new Error("Failed to reactivate subscription")
    }
  }

  static getUserPlan(subscription: UserSubscription | null): PlanType {
    if (!subscription || subscription.status !== "active") {
      return "free"
    }
    return subscription.plan
  }

  static getConversationLimit(plan: PlanType): number {
    if (!PLANS || typeof PLANS !== "object") {
      console.warn(`[v0] PLANS object not loaded, defaulting to free plan limit`)
      return 3 // Free plan default
    }

    if (!plan || !PLANS[plan]) {
      console.warn(`[v0] Invalid plan type: ${plan}, defaulting to free plan`)
      return PLANS.free?.conversationsLimit || 3
    }
    return PLANS[plan].conversationsLimit
  }

  static canSaveConversation(plan: PlanType, currentUsage: number): boolean {
    const limit = this.getConversationLimit(plan)
    return limit === -1 || currentUsage < limit
  }
}
