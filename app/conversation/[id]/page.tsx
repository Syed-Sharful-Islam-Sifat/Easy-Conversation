"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ConversationViewer } from "@/components/conversation/conversation-viewer"
import { Button } from "@/components/ui/button"
import { Brain, ArrowLeft, Share, Trash2 } from "lucide-react"
import Link from "next/link"
import { DatabaseService, type Conversation, type Topic } from "@/lib/database"

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const conversationId = Number.parseInt(params.id as string)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin")
      return
    }

    if (isAuthenticated && conversationId) {
      loadConversation()
    }
  }, [isAuthenticated, isLoading, conversationId])

  const loadConversation = async () => {
    try {
      setLoading(true)
      const conv = await DatabaseService.getConversationById(conversationId)

      if (!conv) {
        setError("Conversation not found")
        return
      }

      // Check if user owns this conversation
      if (conv.user_id !== user?.id) {
        setError("You don't have permission to view this conversation")
        return
      }

      const convTopics = await DatabaseService.getTopicsByConversationId(conversationId)

      setConversation(conv)
      setTopics(convTopics)
    } catch (err) {
      console.error("Error loading conversation:", err)
      setError("Failed to load conversation")
    } finally {
      setLoading(false)
    }
  }

  const handleTopicClick = (topic: Topic) => {
    console.log("Navigating to topic:", topic.title)
    // Additional topic click handling can be added here
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">TopicFlow</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>

              <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ConversationViewer
          conversation={conversation.content}
          topics={topics}
          title={conversation.title}
          onTopicClick={handleTopicClick}
        />
      </main>
    </div>
  )
}
