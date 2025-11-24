export interface WelcomeResponse {
    message: string;
}

export interface ErrorResponse {
    success: false;
    error: string;
    code: "INVALID_INPUT" | "INTERNAL_ERROR";
}

export interface ChatRequest {
    message: string;
}

export interface ChatResponse {
    response: string;
}

export interface ConversationHistoryResponse {
    messages: ChatMessage[];
    conversationId: string;
}

export interface ChatMessage {
    id: string;
    role: "user" | "agent";
    content: string;
    timestamp: number;
}

export interface ConversationContext {
    conversationId: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
}
