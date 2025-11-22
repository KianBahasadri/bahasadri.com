# Home Page - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

## Overview

Backend implementation for the Home page chatbox feature. Handles chat message processing, yandere agent response generation, and conversation context management.

## Code Location

`backend/src/home/`

## API Contract Reference

See `docs/features/home/API_CONTRACT.md` for the API contract this backend provides.

## API Endpoints

### `POST /api/home/chat`

**Handler**: `handleChat()`

**Description**: Processes user message and generates yandere agent response

**Request**:

```typescript
interface ChatRequest {
    message: string;
    conversationId?: string;
}
```

**Validation**:

-   Message: Non-empty string, reasonable length limit
-   Conversation ID: Optional, must be valid format if provided

**Response**:

```typescript
interface ChatResponse {
    response: string;
    conversationId: string;
}
```

**Implementation Flow**:

1. Parse and validate request body
2. Extract message and optional conversation ID
3. Process message with yandere agent logic
4. Generate agent response with yandere personality
5. Generate or reuse conversation ID
6. Return response with conversation ID

**Error Handling**:

-   400: Invalid or empty message
-   500: Internal server error processing message

## Data Models

### TypeScript Types

```typescript
interface ChatRequest {
    message: string;
    conversationId?: string;
}

interface ChatResponse {
    response: string;
    conversationId: string;
}

interface ConversationContext {
    conversationId: string;
    messages: Array<{
        role: "user" | "agent";
        content: string;
        timestamp: number;
    }>;
    createdAt: number;
    updatedAt: number;
}
```

## Cloudflare Services

### KV (Optional)

**Binding**: `HOME_CHAT_KV` (optional, for conversation persistence)

**Usage**:

-   Store conversation context if persistence is desired
-   Key format: `conversation:{conversationId}`
-   TTL: Optional, for session-based conversations

**Operations**:

```typescript
// Store conversation context (if using KV)
await env.HOME_CHAT_KV.put(
    `conversation:${conversationId}`,
    JSON.stringify(context),
    { expirationTtl: 3600 } // 1 hour TTL
);

// Retrieve conversation context (if using KV)
const contextData = await env.HOME_CHAT_KV.get(`conversation:${conversationId}`);
```

## Workers Logic

### Request Processing Flow

```
1. Receive POST request to /api/home/chat
2. Parse request body
3. Validate input (message, optional conversationId)
4. Retrieve conversation context (if conversationId provided and using KV)
5. Process message with yandere agent logic
6. Generate agent response
7. Update conversation context
8. Store conversation context (if using KV)
9. Return response with conversation ID
```

### Error Handling

```typescript
try {
    // Process chat message
} catch (error) {
    if (error instanceof ValidationError) {
        return new Response(JSON.stringify({ 
            success: false,
            error: error.message,
            code: "INVALID_INPUT"
        }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
    return new Response(JSON.stringify({ 
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR"
    }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
    });
}
```

### Yandere Agent Logic

The agent should:
-   Respond with yandere personality traits (possessive, obsessive, loving but intense)
-   Maintain conversation context if conversationId is provided
-   Generate appropriate responses based on user messages
-   Use consistent personality throughout the conversation

## Validation

### Input Validation

```typescript
function validateChatMessage(message: string): { ok: boolean; error?: string } {
    if (!message || typeof message !== "string") {
        return { ok: false, error: "Message is required" };
    }
    if (message.trim().length === 0) {
        return { ok: false, error: "Message cannot be empty" };
    }
    if (message.length > 1000) {
        return { ok: false, error: "Message is too long" };
    }
    return { ok: true };
}

function validateConversationId(conversationId?: string): { ok: boolean; error?: string } {
    if (conversationId && typeof conversationId !== "string") {
        return { ok: false, error: "Invalid conversation ID format" };
    }
    return { ok: true };
}
```

### Business Rules

-   Message must be non-empty and within length limits
-   Conversation ID is optional but must be valid format if provided
-   Agent responses should maintain yandere personality
-   Conversation context should be maintained within session (if using KV)

## Security Considerations

### Authentication

-   No authentication required (public endpoint)

### Authorization

-   No authorization required (public endpoint)

### Input Sanitization

-   Sanitize user messages to prevent injection attacks
-   Validate and sanitize conversation IDs
-   Limit message length to prevent abuse
-   Rate limiting (optional): Consider rate limiting to prevent abuse

## Performance Optimization

### Caching Strategy

-   Conversation context can be cached in KV (optional)
-   Agent responses can be cached for common queries (optional)

### Edge Computing Benefits

-   Low latency responses from Cloudflare Workers
-   Global distribution for fast response times

## Implementation Checklist

### API Endpoints

-   [ ] POST /api/home/chat endpoint
-   [ ] Error handling (per API_CONTRACT.md)
-   [ ] Input validation
-   [ ] Response formatting

### Business Logic

-   [ ] Yandere agent response generation
-   [ ] Conversation context management
-   [ ] Message processing logic

### Data Layer

-   [ ] KV integration (if using conversation persistence)
-   [ ] Conversation context storage/retrieval

### Testing

-   [ ] Unit tests for handlers
-   [ ] Integration tests
-   [ ] Error scenario testing
-   [ ] Agent response quality testing

## Testing Considerations

### Unit Tests

-   Handler function testing
-   Validation logic testing
-   Error handling testing
-   Agent response generation testing

### Integration Tests

-   API endpoint testing (must match API_CONTRACT.md contract)
-   KV integration testing (if using KV)
-   End-to-end flow testing
-   Conversation context management testing

## Dependencies

### Workers Libraries

-   Native Workers API
-   `@cloudflare/workers-types` for types
-   Optional: AI/LLM integration for agent responses (if using external service)

## Error Codes

Must match error codes defined in API_CONTRACT.md:

| Code             | HTTP Status | When to Use                    |
| ---------------- | ----------- | ------------------------------ |
| `INVALID_INPUT`  | 400         | Empty or invalid message       |
| `INTERNAL_ERROR` | 500         | Server error processing message |

## Monitoring & Logging

-   Log chat message processing (without sensitive data)
-   Monitor API response times
-   Track error rates
-   Monitor KV usage (if using KV)

---

**Note**: This document is independent of frontend implementation. Only the API contract in API_CONTRACT.md couples frontend and backend. All API responses must match the contract defined in API_CONTRACT.md.

