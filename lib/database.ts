// Database utility functions - ready for integration with Supabase, Neon, etc.

export interface User {
  id: number
  email: string
  name?: string
  plan?: string
  conversationsUsed?: number
  stripeCustomerId?: string
  subscriptionId?: string
  subscriptionStatus?: string
  currentPeriodEnd?: Date
  created_at: string
}

export interface Conversation {
  id: number
  user_id: number
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface Topic {
  id: number
  conversation_id: number
  title: string
  summary?: string
  position_start: number
  position_end: number
  created_at: string
}

export interface Subscription {
  id: number
  userId: number
  stripeCustomerId: string
  stripeSubscriptionId: string
  plan: string
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  createdAt: string
  updatedAt: string
}

// Mock database functions - will be replaced with real database calls
export class DatabaseService {
  // User operations
  static async createUser(email: string, passwordHash: string, name?: string): Promise<User> {
    // TODO: Implement with real database
    const user: User = {
      id: Date.now(),
      email,
      name,
      plan: "free",
      conversationsUsed: 0,
      created_at: new Date().toISOString(),
    }

    // Store in localStorage for now
    const users = this.getStoredUsers()
    users.push(user)
    localStorage.setItem("users", JSON.stringify(users))

    return user
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    // TODO: Implement with real database
    const users = this.getStoredUsers()
    return users.find((u) => u.email === email) || null
  }

  static async getUserById(id: number): Promise<User | null> {
    // TODO: Implement with real database
    const users = this.getStoredUsers()
    return users.find((u) => u.id === id) || null
  }

  static async incrementUserUsage(userId: number): Promise<void> {
    // TODO: Implement with real database
    const users = this.getStoredUsers()
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex !== -1) {
      users[userIndex].conversationsUsed = (users[userIndex].conversationsUsed || 0) + 1
      localStorage.setItem("users", JSON.stringify(users))
    }
  }

  static async updateUserSubscription(
    userId: number,
    plan: string,
    stripeCustomerId?: string,
    subscriptionId?: string,
    subscriptionStatus?: string,
    currentPeriodEnd?: Date,
  ): Promise<void> {
    // TODO: Implement with real database
    const users = this.getStoredUsers()
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex !== -1) {
      users[userIndex].plan = plan
      users[userIndex].stripeCustomerId = stripeCustomerId
      users[userIndex].subscriptionId = subscriptionId
      users[userIndex].subscriptionStatus = subscriptionStatus
      users[userIndex].currentPeriodEnd = currentPeriodEnd
      localStorage.setItem("users", JSON.stringify(users))
    }
  }

  static async resetUserUsage(userId: number): Promise<void> {
    // TODO: Implement with real database
    const users = this.getStoredUsers()
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex !== -1) {
      users[userIndex].conversationsUsed = 0
      localStorage.setItem("users", JSON.stringify(users))
    }
  }

  // Conversation operations
  static async createConversation(userId: number, title: string, content: string): Promise<Conversation> {
    // TODO: Implement with real database
    const conversation: Conversation = {
      id: Date.now(),
      user_id: userId,
      title,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const conversations = this.getStoredConversations()
    conversations.push(conversation)
    localStorage.setItem("conversations", JSON.stringify(conversations))

    return conversation
  }

  static async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    // TODO: Implement with real database
    const conversations = this.getStoredConversations()
    return conversations.filter((c) => c.user_id === userId)
  }

  static async getConversationById(id: number): Promise<Conversation | null> {
    // TODO: Implement with real database
    const conversations = this.getStoredConversations()
    return conversations.find((c) => c.id === id) || null
  }

  // Topic operations
  static async createTopics(
    conversationId: number,
    topics: Omit<Topic, "id" | "conversation_id" | "created_at">[],
  ): Promise<Topic[]> {
    // TODO: Implement with real database
    const newTopics: Topic[] = topics.map((topic) => ({
      id: Date.now() + Math.random(),
      conversation_id: conversationId,
      ...topic,
      created_at: new Date().toISOString(),
    }))

    const allTopics = this.getStoredTopics()
    allTopics.push(...newTopics)
    localStorage.setItem("topics", JSON.stringify(allTopics))

    return newTopics
  }

  static async getTopicsByConversationId(conversationId: number): Promise<Topic[]> {
    // TODO: Implement with real database
    const topics = this.getStoredTopics()
    return topics.filter((t) => t.conversation_id === conversationId)
  }

  static async createSubscription(
    subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt">,
  ): Promise<Subscription> {
    // TODO: Implement with real database
    const newSubscription: Subscription = {
      id: Date.now(),
      ...subscription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const subscriptions = this.getStoredSubscriptions()
    subscriptions.push(newSubscription)
    localStorage.setItem("subscriptions", JSON.stringify(subscriptions))

    return newSubscription
  }

  static async getSubscriptionByUserId(userId: number): Promise<Subscription | null> {
    // TODO: Implement with real database
    const subscriptions = this.getStoredSubscriptions()
    return subscriptions.find((s) => s.userId === userId) || null
  }

  static async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<void> {
    // TODO: Implement with real database
    const subscriptions = this.getStoredSubscriptions()
    const subscriptionIndex = subscriptions.findIndex((s) => s.stripeSubscriptionId === subscriptionId)

    if (subscriptionIndex !== -1) {
      subscriptions[subscriptionIndex] = {
        ...subscriptions[subscriptionIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      localStorage.setItem("subscriptions", JSON.stringify(subscriptions))
    }
  }

  // Helper methods for localStorage (temporary)
  private static getStoredUsers(): User[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem("users")
    return stored ? JSON.parse(stored) : []
  }

  private static getStoredConversations(): Conversation[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem("conversations")
    return stored ? JSON.parse(stored) : []
  }

  private static getStoredTopics(): Topic[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem("topics")
    return stored ? JSON.parse(stored) : []
  }

  private static getStoredSubscriptions(): Subscription[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem("subscriptions")
    return stored ? JSON.parse(stored) : []
  }
}
