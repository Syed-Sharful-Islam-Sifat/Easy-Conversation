import { type NextRequest, NextResponse } from "next/server"
import { DeepSeekService } from "@/lib/deepseek-service"

export async function POST(request: NextRequest) {
  try {
    const { conversation, title } = await request.json()

    if (!conversation || typeof conversation !== "string") {
      return NextResponse.json({ error: "Conversation content is required" }, { status: 400 })
    }

    if (conversation.length < 50) {
      return NextResponse.json({ error: "Conversation is too short for topic extraction" }, { status: 400 })
    }

    // Extract topics using DeepSeek API
    const result = await DeepSeekService.extractTopics(conversation)

    return NextResponse.json({
      success: true,
      data: {
        topics: result.topics,
        conversation_summary: result.conversation_summary,
        title: title || "Untitled Conversation",
        conversation_content: conversation,
      },
    })
  } catch (error) {
    console.error("Topic extraction error:", error)
    return NextResponse.json({ error: "Failed to extract topics. Please try again." }, { status: 500 })
  }
}
