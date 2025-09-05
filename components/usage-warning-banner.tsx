"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Zap } from "lucide-react"
import Link from "next/link"
import type { PlanType } from "@/lib/stripe"

interface UsageWarningBannerProps {
  plan: PlanType
  usage: number
  limit: number
}

export function UsageWarningBanner({ plan, usage, limit }: UsageWarningBannerProps) {
  if (limit === -1) return null // Unlimited plan

  const usagePercentage = (usage / limit) * 100
  const isNearLimit = usagePercentage >= 80
  const isAtLimit = usage >= limit

  if (!isNearLimit) return null

  return (
    <Alert className={`mb-6 ${isAtLimit ? "border-destructive" : "border-yellow-500"}`}>
      <div className="flex items-center gap-2">
        {isAtLimit ? (
          <AlertTriangle className="h-4 w-4 text-destructive" />
        ) : (
          <Zap className="h-4 w-4 text-yellow-500" />
        )}
        <AlertDescription className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">
              {isAtLimit ? `You've reached your ${plan} plan limit` : `You're approaching your ${plan} plan limit`}
            </span>
            <span className="text-sm text-muted-foreground">
              {usage} / {limit} conversations
            </span>
          </div>
          <Progress value={Math.min(usagePercentage, 100)} className="h-2 mb-2" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {isAtLimit
                ? "Upgrade to continue saving conversations"
                : `${limit - usage} conversations remaining this month`}
            </span>
            <Button size="sm" asChild>
              <Link href="/pricing">Upgrade Plan</Link>
            </Button>
          </div>
        </AlertDescription>
      </div>
    </Alert>
  )
}
