export interface WelcomeResponse {
  message: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  response: string;
  conversationId: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: number;
}

export interface ConversationHistoryResponse {
  messages: ChatMessage[];
  conversationId: string;
}

