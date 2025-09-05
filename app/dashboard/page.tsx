"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SubscriptionCard } from "@/components/subscription/subscription-card"
import { UsageWarningBanner } from "@/components/usage-warning-banner"
import { Brain, LogOut, Plus, MessageSquare, Calendar, Hash } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DatabaseService, type Conversation, type Topic } from "@/lib/database"

export default function DashboardPage() {
  const { user, signOut, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [conversationTopics, setConversationTopics] = useState<Record<number, Topic[]>>({})
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && isHydrated) {
      router.push("/auth/signin")
    }
  }, [isAuthenticated, isLoading, router, isHydrated])

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserConversations()
    }
  }, [isAuthenticated, user])

  const loadUserConversations = async () => {
    if (!user) return

    try {
      setLoadingConversations(true)
      const userConversations = await DatabaseService.getConversationsByUserId(user.id)
      setConversations(userConversations)

      // Load topics for each conversation
      const topicsMap: Record<number, Topic[]> = {}
      for (const conv of userConversations) {
        const topics = await DatabaseService.getTopicsByConversationId(conv.id)
        topicsMap[conv.id] = topics
      }
      setConversationTopics(topicsMap)
    } catch (error) {
      console.error("Error loading conversations:", error)
    } finally {
      setLoadingConversations(false)
    }
  }

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const handleSignOut = () => {
    signOut()
    router.push("/")
  }

  const totalTopics = Object.values(conversationTopics).reduce((sum, topics) => sum + topics.length, 0)
  const thisMonthConversations = conversations.filter((conv) => {
    const convDate = new Date(conv.created_at)
    const now = new Date()
    return convDate.getMonth() === now.getMonth() && convDate.getFullYear() === now.getFullYear()
  }).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">TopicFlow</span>
            </Link>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your AI conversations and extracted topics</p>
          </div>

          {user && (
            <UsageWarningBanner plan={user.plan} usage={user.conversationsUsed} limit={user.conversationsLimit} />
          )}

          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-4 mb-6">
              {user && (
                <SubscriptionCard
                  plan={user.plan}
                  usage={user.conversationsUsed}
                  subscriptionStatus={user.subscriptionStatus}
                  currentPeriodEnd={user.currentPeriodEnd}
                  stripeCustomerId={user.stripeCustomerId}
                />
              )}
            </div>

            {/* New Conversation Card */}
            <Card className="border-dashed border-2 border-border/50 hover:border-border transition-colors">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>New Conversation</CardTitle>
                <CardDescription>Paste a new AI conversation to extract topics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/analyze">Start Analysis</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <Badge variant="outline" className="capitalize">
                    {user?.plan || "Free"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="text-lg font-semibold">
                    {user?.conversationsUsed || 0}
                    {user?.conversationsLimit !== -1 && ` / ${user?.conversationsLimit}`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Conversations</span>
                  <span className="text-lg font-semibold">{conversations.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Topics Extracted</span>
                  <span className="text-lg font-semibold">{totalTopics}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Conversations */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Your Conversations
                  </CardTitle>
                  <CardDescription>
                    {conversations.length === 0
                      ? "You haven't saved any conversations yet"
                      : `${conversations.length} saved conversation${conversations.length === 1 ? "" : "s"}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingConversations ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        Your saved conversations will appear here once you start analyzing them.
                      </p>
                      <Button variant="outline" asChild>
                        <Link href="/analyze">Analyze Your First Conversation</Link>
                      </Button>
                    </div>
                  ) : (
                    <ScrollArea className="h-80">
                      <div className="p-4 space-y-3">
                        {conversations.map((conversation) => {
                          const topics = conversationTopics[conversation.id] || []
                          const createdDate = new Date(conversation.created_at).toLocaleDateString()

                          return (
                            <Link key={conversation.id} href={`/conversation/${conversation.id}`}>
                              <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                      {conversation.title}
                                    </h3>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                                      <Calendar className="h-3 w-3" />
                                      {createdDate}
                                    </div>
                                  </div>

                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {conversation.content.substring(0, 120)}...
                                  </p>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className="text-xs">
                                        <Hash className="h-3 w-3 mr-1" />
                                        {topics.length} topics
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {Math.ceil(conversation.content.length / 1000)}k chars
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
