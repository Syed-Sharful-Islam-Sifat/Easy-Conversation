"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Zap, Crown, Building } from "lucide-react"
import Link from "next/link"
import type { PlanType } from "@/lib/stripe"

interface UsageLimitModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan: PlanType
  usage: number
  limit: number
  isAtLimit: boolean
}

export function UsageLimitModal({ isOpen, onClose, currentPlan, usage, limit, isAtLimit }: UsageLimitModalProps) {
  const usagePercentage = limit === -1 ? 0 : (usage / limit) * 100

  const getUpgradeOptions = () => {
    if (currentPlan === "free") {
      return [
        {
          name: "Pro",
          price: "$9/month",
          limit: "30 conversations",
          icon: Zap,
          href: "/pricing",
        },
        {
          name: "Business",
          price: "$29/month",
          limit: "Unlimited conversations",
          icon: Building,
          href: "/pricing",
        },
      ]
    } else if (currentPlan === "pro") {
      return [
        {
          name: "Business",
          price: "$29/month",
          limit: "Unlimited conversations",
          icon: Building,
          href: "/pricing",
        },
      ]
    }
    return []
  }

  const upgradeOptions = getUpgradeOptions()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isAtLimit ? (
              <>
                <Zap className="h-5 w-5 text-yellow-500" />
                Usage Limit Reached
              </>
            ) : (
              <>
                <Crown className="h-5 w-5 text-primary" />
                Usage Warning
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isAtLimit
              ? `You've reached your ${currentPlan} plan limit of ${limit} conversations this month.`
              : `You're approaching your ${currentPlan} plan limit.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Monthly Usage</span>
              <Badge variant={isAtLimit ? "destructive" : usagePercentage > 80 ? "secondary" : "outline"}>
                {limit === -1 ? `${usage} conversations` : `${usage} / ${limit}`}
              </Badge>
            </div>
            {limit !== -1 && <Progress value={Math.min(usagePercentage, 100)} className="h-2" />}
          </div>

          {upgradeOptions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Upgrade to continue:</h4>
              {upgradeOptions.map((option) => (
                <div key={option.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <option.icon className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">{option.name}</div>
                      <div className="text-sm text-muted-foreground">{option.limit}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{option.price}</div>
                    <Button size="sm" asChild>
                      <Link href={option.href}>Upgrade</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            {upgradeOptions.length > 0 && (
              <Button asChild className="flex-1">
                <Link href="/pricing">View All Plans</Link>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
