"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Upload, FileText, Sparkles } from "lucide-react"

interface ConversationInputProps {
  onAnalyze: (conversation: string, title: string) => void
  isLoading?: boolean
  isDemo?: boolean
}

export function ConversationInput({ onAnalyze, isLoading = false, isDemo = false }: ConversationInputProps) {
  const [conversation, setConversation] = useState("")
  const [title, setTitle] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!conversation.trim()) {
      setError("Please paste your conversation before analyzing")
      return
    }

    if (conversation.trim().length < 100) {
      setError("Conversation seems too short. Please paste a longer conversation for better topic extraction.")
      return
    }

    const conversationTitle = title.trim() || `Conversation ${new Date().toLocaleDateString()}`
    onAnalyze(conversation.trim(), conversationTitle)
  }

  const handleExampleLoad = () => {
    const exampleConversation = `User: I'm planning to start a new business and I'm not sure where to begin. Can you help me with the initial steps?

AI Assistant: I'd be happy to help you get started with your business planning! Here are the key initial steps you should consider:

1. **Business Idea Validation**
   - Research your target market and competitors
   - Validate that there's demand for your product or service
   - Talk to potential customers to understand their pain points

2. **Business Plan Development**
   - Define your business model and revenue streams
   - Create financial projections and budgets
   - Outline your marketing and operational strategies

3. **Legal Structure and Registration**
   - Choose the right business structure (LLC, Corporation, etc.)
   - Register your business name and get necessary licenses
   - Set up business banking and accounting systems

User: That's really helpful! Can you elaborate more on the market research part? I'm thinking of starting an online tutoring platform.

AI Assistant: Great choice! Online education is a growing market. Here's how to approach market research for your tutoring platform:

**Market Analysis:**
- Study existing platforms like Wyzant, Tutor.com, and Chegg Tutors
- Identify gaps in their services or underserved niches
- Look at pricing models and user reviews to understand pain points

**Target Audience Research:**
- Define your ideal students (age groups, subjects, learning styles)
- Survey potential users about their current tutoring experiences
- Understand their budget constraints and preferred learning formats

**Competitive Differentiation:**
- What unique value will your platform provide?
- Consider specializing in specific subjects or teaching methods
- Think about technology features that could set you apart

**Market Size and Opportunity:**
- Research the size of the online tutoring market in your region
- Look at growth trends and future projections
- Identify seasonal patterns in demand

User: This is exactly what I needed! One more question - what about the technical side? I'm not very technical myself.

AI Assistant: No worries! Many successful business owners aren't technical. Here are your options for building the platform:

**Option 1: Hire Developers**
- Find freelance developers or a development agency
- Clearly define your requirements and create detailed specifications
- Budget for ongoing maintenance and updates

**Option 2: No-Code/Low-Code Solutions**
- Use platforms like Bubble, Webflow, or Teachable
- These allow you to build functional platforms without coding
- Faster to launch but may have limitations as you scale

**Option 3: Find a Technical Co-founder**
- Partner with someone who has the technical skills
- Offer equity in exchange for their expertise
- Ensure you have clear agreements about roles and ownership

**Key Technical Considerations:**
- Video calling integration (Zoom, WebRTC)
- Payment processing (Stripe, PayPal)
- User authentication and profiles
- Scheduling and calendar systems
- Mobile responsiveness

Start with an MVP (Minimum Viable Product) to test your concept before investing heavily in complex features.`

    setConversation(exampleConversation)
    setTitle("Business Planning Discussion")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Paste Your Conversation
                {isDemo && <Badge variant="secondary">Demo Mode</Badge>}
              </CardTitle>
              <CardDescription>
                {isDemo
                  ? "Try our topic extraction without creating an account. Your analysis won't be saved."
                  : "Paste your AI conversation below and we'll extract the key topics for easy navigation."}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExampleLoad} className="shrink-0 bg-transparent">
              <Sparkles className="h-4 w-4 mr-2" />
              Load Example
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Conversation Title (Optional)</Label>
              <input
                id="title"
                type="text"
                placeholder="e.g., Business Planning Discussion, Technical Interview, etc."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conversation">Conversation Content</Label>
              <Textarea
                id="conversation"
                placeholder="Paste your AI conversation here... 

Example format:
User: Your question here
AI: The AI's response here
User: Follow-up question
AI: Another response..."
                value={conversation}
                onChange={(e) => setConversation(e.target.value)}
                className="min-h-[300px] resize-y"
                required
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{conversation.length > 0 && `${conversation.length} characters`}</span>
                <span>Minimum 100 characters recommended</span>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !conversation.trim()} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Conversation...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Extract Topics
                </>
              )}
            </Button>
          </form>

          {isDemo && (
            <Alert>
              <AlertDescription>
                <strong>Demo Mode:</strong> You can analyze conversations without signing up, but results won't be
                saved.
                <a href="/auth/signup" className="text-primary hover:underline ml-1">
                  Create an account
                </a>{" "}
                to save your analyses.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Tips for Better Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <h4 className="font-medium text-sm">Format Your Conversation</h4>
              <p className="text-sm text-muted-foreground">
                Clearly separate user messages from AI responses for better topic detection.
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-sm">Include Context</h4>
              <p className="text-sm text-muted-foreground">
                Longer conversations with more context produce more accurate topic extraction.
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-sm">Multiple Topics</h4>
              <p className="text-sm text-muted-foreground">
                Conversations covering several topics work best for our analysis engine.
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-sm">Clean Text</h4>
              <p className="text-sm text-muted-foreground">
                Remove unnecessary formatting or special characters for optimal results.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
