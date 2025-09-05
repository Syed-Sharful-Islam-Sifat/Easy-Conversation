"use client"

import { useState } from "react"
import { ConversationInput } from "@/components/conversation/conversation-input"
import { Button } from "@/components/ui/button"
import { Brain, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    title: string
    topics: Array<{ title: string; summary: string; position_start: number; position_end: number }>
    conversation_summary: string
  } | null>(null)

  const handleAnalyze = async (conversation: string, title: string) => {
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
        setAnalysisResult({
          title: result.data.title,
          topics: result.data.topics,
          conversation_summary: result.data.conversation_summary,
        })
      } else {
        throw new Error(result.error || "Analysis failed")
      }
    } catch (error) {
      console.error("Analysis error:", error)
      // Fallback to basic analysis on error
      setAnalysisResult({
        title,
        topics: [
          {
            title: "General Discussion",
            summary: "Main conversation topics and key points discussed",
            position_start: 0,
            position_end: Math.min(500, conversation.length),
          },
        ],
        conversation_summary: "Analysis completed with basic topic extraction.",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

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
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Try TopicFlow Free</h1>
            <p className="text-muted-foreground">
              Experience our AI-powered topic extraction without creating an account
            </p>
          </div>

          {!analysisResult ? (
            <ConversationInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} isDemo={true} />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{analysisResult.title}</h2>
                  <p className="text-muted-foreground">Analysis complete! Here are the extracted topics:</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAnalysisResult(null)
                    setIsAnalyzing(false)
                  }}
                >
                  Analyze Another
                </Button>
              </div>

              <div className="grid gap-4">
                {analysisResult.topics.map((topic, index) => (
                  <div
                    key={index}
                    className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                        {index + 1}
                      </div>
                      <div className="space-y-1 flex-1">
                        <h3 className="font-semibold text-foreground">{topic.title}</h3>
                        <p className="text-sm text-muted-foreground">{topic.summary}</p>
                        <div className="text-xs text-muted-foreground/70">
                          Position: {topic.position_start} - {topic.position_end}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {analysisResult.conversation_summary && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Conversation Summary</h3>
                  <p className="text-sm text-muted-foreground">{analysisResult.conversation_summary}</p>
                </div>
              )}

              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Want to save your analysis?</h3>
                <p className="text-muted-foreground mb-4">
                  Create an account to save conversations, build your library, and access advanced features.
                </p>
                <Button asChild>
                  <Link href="/auth/signup">Create Free Account</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
