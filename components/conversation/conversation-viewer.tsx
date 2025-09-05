"use client"

import { useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, User, Bot } from "lucide-react"

interface Topic {
  id: number
  title: string
  summary: string
  position_start: number
  position_end: number
}

interface ConversationViewerProps {
  conversation: string
  topics: Topic[]
  title: string
  onTopicClick?: (topic: Topic) => void
}

export function ConversationViewer({ conversation, topics, title, onTopicClick }: ConversationViewerProps) {
  const conversationRef = useRef<HTMLDivElement>(null)

  const scrollToPosition = (position: number) => {
    if (!conversationRef.current) return

    // Find the element that contains the character at the given position
    const textContent = conversationRef.current.textContent || ""
    if (position > textContent.length) return

    // Calculate approximate scroll position based on character position
    const scrollPercentage = position / textContent.length
    const maxScroll = conversationRef.current.scrollHeight - conversationRef.current.clientHeight
    const targetScroll = scrollPercentage * maxScroll

    conversationRef.current.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    })
  }

  const handleTopicClick = (topic: Topic) => {
    scrollToPosition(topic.position_start)
    onTopicClick?.(topic)
  }

  const formatConversation = (text: string) => {
    // Split conversation into messages and format them
    const lines = text.split("\n").filter((line) => line.trim())
    const messages: { type: "user" | "ai" | "text"; content: string; position: number }[] = []
    let currentPosition = 0

    lines.forEach((line) => {
      const trimmedLine = line.trim()
      if (trimmedLine.toLowerCase().startsWith("user:")) {
        messages.push({
          type: "user",
          content: trimmedLine.substring(5).trim(),
          position: currentPosition,
        })
      } else if (
        trimmedLine.toLowerCase().startsWith("ai:") ||
        trimmedLine.toLowerCase().startsWith("ai assistant:") ||
        trimmedLine.toLowerCase().startsWith("assistant:")
      ) {
        const colonIndex = trimmedLine.indexOf(":")
        messages.push({
          type: "ai",
          content: trimmedLine.substring(colonIndex + 1).trim(),
          position: currentPosition,
        })
      } else if (trimmedLine.length > 0) {
        messages.push({
          type: "text",
          content: trimmedLine,
          position: currentPosition,
        })
      }
      currentPosition += line.length + 1 // +1 for newline
    })

    return messages
  }

  const messages = formatConversation(conversation)

  const getTopicForPosition = (position: number) => {
    return topics.find((topic) => position >= topic.position_start && position <= topic.position_end)
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Topic Navigation Sidebar */}
      <div className="w-80 shrink-0">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              Topics ({topics.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100%-5rem)]">
              <div className="p-4 space-y-3">
                {topics.map((topic, index) => {
                  const currentTopic = getTopicForPosition(0) // This could be enhanced to track current scroll position
                  return (
                    <div
                      key={topic.id}
                      onClick={() => handleTopicClick(topic)}
                      className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {index + 1}
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {topic.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{topic.summary}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              Pos: {topic.position_start}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Conversation Content */}
      <div className="flex-1 min-w-0">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg line-clamp-1">{title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100%-5rem)]" ref={conversationRef}>
              <div className="p-6 space-y-4">
                {messages.map((message, index) => {
                  const topic = getTopicForPosition(message.position)

                  return (
                    <div key={index} className="space-y-2">
                      {/* Topic marker */}
                      {topic && index === 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="h-px bg-border flex-1" />
                          <Badge variant="outline" className="text-xs">
                            {topic.title}
                          </Badge>
                          <div className="h-px bg-border flex-1" />
                        </div>
                      )}

                      {message.type === "user" && (
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="text-sm font-medium text-blue-600">User</div>
                            <div className="text-sm text-foreground bg-blue-50 rounded-lg p-3">{message.content}</div>
                          </div>
                        </div>
                      )}

                      {message.type === "ai" && (
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 shrink-0">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="text-sm font-medium text-green-600">AI Assistant</div>
                            <div className="text-sm text-foreground bg-green-50 rounded-lg p-3 whitespace-pre-wrap">
                              {message.content}
                            </div>
                          </div>
                        </div>
                      )}

                      {message.type === "text" && (
                        <div className="text-sm text-muted-foreground pl-11 whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
