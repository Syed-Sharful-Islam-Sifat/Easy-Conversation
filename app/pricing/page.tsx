import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Brain, ArrowRight } from "lucide-react"
import Link from "next/link"
import { CheckoutButton } from "@/components/checkout-button"

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out TopicFlow",
    conversations: "3 conversations per month",
    features: ["AI topic extraction", "Basic conversation navigation", "3 saved conversations", "Standard support"],
    cta: "Get Started Free",
    href: "/auth/signup",
    popular: false,
    priceId: null,
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    description: "For regular AI conversation users",
    conversations: "30 conversations per month",
    features: [
      "Everything in Free",
      "Advanced topic extraction",
      "30 saved conversations",
      "Priority support",
      "Export conversations",
      "Advanced search",
    ],
    cta: "Start Pro Trial",
    href: "/auth/signup?plan=pro",
    popular: true,
    priceId: "price_pro_monthly",
  },
  {
    name: "Business",
    price: "$29",
    period: "per month",
    description: "For teams and power users",
    conversations: "Unlimited conversations",
    features: [
      "Everything in Pro",
      "Unlimited conversations",
      "Team collaboration",
      "API access",
      "Custom integrations",
      "Dedicated support",
    ],
    cta: "Start Business Trial",
    href: "/auth/signup?plan=business",
    popular: false,
    priceId: "price_business_monthly",
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">TopicFlow</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6">
              Simple, Transparent Pricing
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-balance">
              Choose the perfect plan for your
              <span className="text-primary"> conversation needs</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground text-pretty max-w-2xl mx-auto">
              Start free and upgrade as you grow. All plans include our core AI-powered topic extraction features.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-6xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {pricingTiers.map((tier) => (
                <Card
                  key={tier.name}
                  className={`relative border-border/50 ${tier.popular ? "border-primary shadow-lg scale-105" : ""}`}
                >
                  {tier.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                      <span className="text-muted-foreground">/{tier.period}</span>
                    </div>
                    <CardDescription className="mt-2">{tier.description}</CardDescription>
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium text-foreground">{tier.conversations}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center">
                          <Check className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {tier.priceId ? (
                      <CheckoutButton
                        priceId={tier.priceId}
                        planName={tier.name}
                        className={`w-full ${tier.popular ? "bg-primary hover:bg-primary/90" : ""}`}
                      />
                    ) : (
                      <Button className="w-full bg-transparent" variant="outline" asChild>
                        <Link href={tier.href}>
                          {tier.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mx-auto mt-20 max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6 text-left">
              <div>
                <h3 className="font-semibold text-foreground mb-2">What counts as a conversation?</h3>
                <p className="text-muted-foreground">
                  Each AI conversation you paste and analyze counts as one conversation, regardless of length.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Can I upgrade or downgrade anytime?</h3>
                <p className="text-muted-foreground">
                  Yes, you can change your plan at any time. Changes take effect at your next billing cycle.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">What happens if I exceed my limit?</h3>
                <p className="text-muted-foreground">
                  You'll be prompted to upgrade your plan. Your existing conversations remain accessible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <Brain className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">TopicFlow</span>
            </Link>
            <p className="text-sm text-muted-foreground">© 2024 TopicFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
