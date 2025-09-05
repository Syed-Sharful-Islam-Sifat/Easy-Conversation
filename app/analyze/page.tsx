"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { ConversationInput } from "@/components/conversation/conversation-input"
import { Button } from "@/components/ui/button"
import { Brain, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DatabaseService } from "@/lib/database"

export default function AnalyzePage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin")
    }
  }, [isAuthenticated, isLoading, router])

  const handleAnalyze = async (conversation: string, title: string) => {
    if (!user) return

    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/extract-topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation,
          title,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to extract topics")
      }

      const result = await response.json()

      if (result.success) {
        const savedConversation = await DatabaseService.createConversation(user.id, result.data.title, conversation)

        // Save extracted topics
        const topicsToSave = result.data.topics.map((topic: any) => ({
          title: topic.title,
          summary: topic.summary,
          position_start: topic.position_start,
          position_end: topic.position_end,
        }))

        await DatabaseService.createTopics(savedConversation.id, topicsToSave)

        router.push(`/conversation/${savedConversation.id}`)
      } else {
        throw new Error(result.error || "Analysis failed")
      }
    } catch (error) {
      console.error("Analysis error:", error)
      // TODO: Show error message to user
      alert("Failed to analyze conversation. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
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
              <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Analyze New Conversation</h1>
            <p className="text-muted-foreground">
              Paste your AI conversation below and we'll extract topics and save it to your library
            </p>
          </div>

          <ConversationInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} isDemo={false} />
        </div>
      </main>
    </div>
  )
}
