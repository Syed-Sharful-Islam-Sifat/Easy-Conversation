// DeepSeek API service for topic extraction

export interface ExtractedTopic {
  title: string
  summary: string
  position_start: number
  position_end: number
}

export interface TopicExtractionResult {
  topics: ExtractedTopic[]
  conversation_summary: string
}

export class DeepSeekService {
  private static readonly API_URL = "https://api.deepseek.com/v1/chat/completions"

  static async extractTopics(conversation: string): Promise<TopicExtractionResult> {
    // TODO: Replace with actual DeepSeek API key when integration is added
    const apiKey = process.env.DEEPSEEK_API_KEY || "demo-key"

    if (apiKey === "demo-key") {
      // Return mock data for demo purposes
      return this.getMockTopicExtraction(conversation)
    }

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `You are an expert at analyzing conversations and extracting key topics. 
              
              Analyze the following conversation and extract the main topics discussed. For each topic:
              1. Provide a clear, concise title (max 50 characters)
              2. Write a brief summary (max 150 characters)
              3. Identify the approximate character positions where this topic starts and ends
              
              Return the result as a JSON object with this structure:
              {
                "topics": [
                  {
                    "title": "Topic Title",
                    "summary": "Brief summary of what was discussed",
                    "position_start": 0,
                    "position_end": 500
                  }
                ],
                "conversation_summary": "Overall summary of the entire conversation"
              }
              
              Focus on distinct topics and avoid overlapping sections. Ensure position_start and position_end are accurate character positions.`,
            },
            {
              role: "user",
              content: conversation,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error("No content received from DeepSeek API")
      }

      // Parse the JSON response
      const result = JSON.parse(content)
      return this.validateAndCleanResult(result, conversation)
    } catch (error) {
      console.error("DeepSeek API error:", error)
      // Fallback to mock data if API fails
      return this.getMockTopicExtraction(conversation)
    }
  }

  private static getMockTopicExtraction(conversation: string): TopicExtractionResult {
    // Generate realistic mock topics based on conversation content
    const topics: ExtractedTopic[] = []
    const conversationLength = conversation.length

    // Simple topic detection based on keywords and conversation structure
    const sections = conversation.split(/(?:User:|AI Assistant:|AI:)/i).filter((s) => s.trim())
    let currentPosition = 0

    sections.forEach((section, index) => {
      if (section.trim().length > 100) {
        const sectionStart = conversation.indexOf(section.trim(), currentPosition)
        const sectionEnd = sectionStart + section.trim().length

        // Extract potential topic from section content
        const words = section.trim().split(" ").slice(0, 20).join(" ")
        const title = this.generateTopicTitle(words)
        const summary = this.generateTopicSummary(section.trim())

        if (title && summary) {
          topics.push({
            title,
            summary,
            position_start: Math.max(0, sectionStart),
            position_end: Math.min(conversationLength, sectionEnd),
          })
        }

        currentPosition = sectionEnd
      }
    })

    // Ensure we have at least one topic
    if (topics.length === 0) {
      topics.push({
        title: "General Discussion",
        summary: "Main conversation topics and key points discussed",
        position_start: 0,
        position_end: Math.min(500, conversationLength),
      })
    }

    return {
      topics: topics.slice(0, 8), // Limit to 8 topics max
      conversation_summary: "Conversation covering multiple topics with detailed discussion and insights.",
    }
  }

  private static generateTopicTitle(text: string): string {
    // Extract key phrases for topic titles
    const keywords = ["business", "planning", "market", "research", "technical", "development", "strategy", "analysis"]
    const foundKeywords = keywords.filter((keyword) => text.toLowerCase().includes(keyword))

    if (foundKeywords.length > 0) {
      return `${foundKeywords[0].charAt(0).toUpperCase() + foundKeywords[0].slice(1)} Discussion`
    }

    // Fallback to first few words
    const words = text.split(" ").slice(0, 3).join(" ")
    return words.length > 3 ? `${words}...` : "Discussion Topic"
  }

  private static generateTopicSummary(text: string): string {
    // Generate a summary from the text
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10)
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim().slice(0, 120)
      return firstSentence.length < sentences[0].trim().length ? `${firstSentence}...` : firstSentence
    }
    return "Key discussion points and insights from this section."
  }

  private static validateAndCleanResult(result: any, conversation: string): TopicExtractionResult {
    // Validate and clean the API response
    const topics: ExtractedTopic[] = []

    if (result.topics && Array.isArray(result.topics)) {
      result.topics.forEach((topic: any) => {
        if (
          topic.title &&
          topic.summary &&
          typeof topic.position_start === "number" &&
          typeof topic.position_end === "number"
        ) {
          topics.push({
            title: topic.title.slice(0, 50),
            summary: topic.summary.slice(0, 150),
            position_start: Math.max(0, topic.position_start),
            position_end: Math.min(conversation.length, topic.position_end),
          })
        }
      })
    }

    return {
      topics: topics.length > 0 ? topics : this.getMockTopicExtraction(conversation).topics,
      conversation_summary: result.conversation_summary || "Conversation analysis completed.",
    }
  }
}
