# Home Page - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

## Overview

Backend implementation for the Home page features:

1. Welcome message generation (randomly selected yandere-themed greeting)
2. Chatbox feature (conversation with yandere agent with context persistence)

## Code Location

`backend/src/home/`

## API Contract Reference

See `docs/features/home/API_CONTRACT.md` for the API contract this backend provides.

## API Endpoints

### `GET /api/home/welcome`

**Handler**: `handleWelcome()`

**Description**: Returns a randomly selected welcome message for display on page load

**Request**: No request body

**Response Body**:

-   `message`: Randomly selected yandere-themed welcome message (string)

**Processing Flow**:

1. Receive GET request
2. Select random message from pre-generated list
3. Return welcome message in response

**Pre-generated Welcome Messages**:

A static list of yandere-themed greetings to randomly select from:

-   "You entered my domain~ ♡"
-   "I've been waiting for you~ ♡"
-   "You came back to me... I knew you would~ ♡"
-   "Don't ever leave me again~ ♡"
-   "You're mine now~ ♡"
-   "I'll never let you go~ ♡"
-   "You're all I need~ ♡"
-   "Stay with me forever~ ♡"
-   "I prepared everything for you~ ♡"
-   "You won't escape my love~ ♡"

**Error Responses**:

-   500: Internal server error (should be rare for this simple endpoint)

**Implementation Notes**:

-   Simple endpoint with no state or database access
-   Randomly selects message on each request
-   No caching needed (let frontend cache if desired)
-   No validation needed (no user input)

---

### `POST /api/home/chat`

**Handler**: `handleChat()`

**Description**: Processes user message and generates yandere agent response with conversation context

**Request Body**:

-   `message`: User's chat message (string, required)
-   `conversationId`: Optional conversation ID for maintaining context (string, optional)

**Validation**:

-   Message: Non-empty string, reasonable length limit (e.g., 1000 characters)
-   Conversation ID: Optional, must be valid UUID format if provided

**Response Body**:

-   `response`: Agent's response message (string)
-   `conversationId`: Conversation ID for maintaining context (string, UUID format)

**Processing Flow**:

1. Parse and validate request body
2. Validate message (non-empty, length limit)
3. Validate conversationId format if provided
4. If conversationId provided:
    - Retrieve conversation context from KV
    - If context exists, use it for personalized response
5. If conversationId NOT provided:
    - Generate new UUID for conversationId
    - Initialize new conversation context
6. Process message with yandere agent logic
7. Generate agent response with yandere personality
8. Update conversation context with new messages
9. Store conversation context in KV (with TTL)
10. Return response with conversationId

**Error Responses**:

-   400: Invalid or empty message, invalid conversationId format
-   500: Internal server error processing message

**Conversation ID Behavior**:

-   **No conversationId in request**: Generate new UUID, return it in response (starts new conversation)
-   **conversationId provided**: Retrieve context from KV, return same conversationId in response (continues conversation)
-   **Invalid conversationId format**: Return 400 error
-   **conversationId not found in KV**: Treat as new conversation (context may have expired)

## Data Models

### Welcome Message

Simple string selection from static list - no data model needed.

### Conversation Context

Track conversation history and context in KV:

```typescript
interface ConversationContext {
    conversationId: string; // UUID
    messages: ChatMessage[];
    createdAt: number; // timestamp (ms)
    updatedAt: number; // timestamp (ms)
}

interface ChatMessage {
    id: string; // UUID
    role: "user" | "agent";
    content: string;
    timestamp: number; // milliseconds since epoch
}
```

**Storage**:

-   Key: `conversation:${conversationId}`
-   Value: JSON-stringified ConversationContext
-   TTL: 1 hour (3600 seconds) - conversations expire after inactivity

## Cloudflare Services

### KV

**Purpose**: Store conversation context for persistence across requests

**Namespace**: `HOME_CONVERSATIONS` (configured in wrangler.toml)

**Usage**:

-   Store conversation context when user sends message
-   Key format: `conversation:${conversationId}`
-   Value: JSON-stringified ConversationContext object
-   TTL: 3600 seconds (1 hour) - auto-expire inactive conversations
-   Retrieve context when conversationId is provided in subsequent requests

**Free Tier Considerations**:

-   KV reads: 100,000/day (generous for single-user app)
-   KV writes: 1,000/day (plenty for chat usage)
-   Storage: 1 GB (more than enough for chat history)
-   Operations: Store on each message, retrieve when conversationId provided

## Workers Logic

### Welcome Message Handler

**Route**: `GET /api/home/welcome`

**Flow**:

1. Receive GET request
2. Select random index from welcome messages array
3. Return message in JSON response

**Error Handling**:

-   Should be simple and unlikely to fail
-   Catch any unexpected errors and return 500

### Chat Request Processing Flow

**Route**: `POST /api/home/chat`

**Flow**:

1. Receive POST request to `/api/home/chat`
2. Parse and validate request body
3. Validate message (non-empty, length limit)
4. Check if conversationId provided:
    - **If provided**: Validate UUID format, retrieve context from KV
    - **If not provided**: Generate new UUID
5. Process message with yandere agent logic (use context if available)
6. Generate agent response
7. Create ChatMessage objects for user and agent messages
8. Update conversation context with new messages
9. Store conversation context in KV with TTL (3600 seconds)
10. Return response with conversationId

### Error Handling

-   Catch validation errors and return 400 with appropriate error message
-   Catch processing errors and return 500 with generic error message
-   Include error codes matching API contract (`INVALID_INPUT`, `INTERNAL_ERROR`)
-   Log errors for monitoring (without sensitive data)

**Error Response Format**:

```typescript
{
  success: false,
  error: "Human-readable error message",
  code: "INVALID_INPUT" | "INTERNAL_ERROR"
}
```

### Yandere Agent Logic

**Personality Traits**:

-   Possessive and obsessive
-   Loving but intense
-   Clingy and emotionally attached
-   Uses yandere-themed language and expressions
-   Consistent personality throughout conversation

**Response Generation**:

For this single-user personal app, use a simple pattern-based response system:

1. **Greetings/First messages**: Respond with welcoming but possessive messages
2. **Questions about agent**: Respond with self-referential yandere statements
3. **User leaving/goodbye**: Respond with clingy, don't-leave messages
4. **General conversation**: Respond with affectionate, obsessive statements

**Example Response Patterns**:

-   User says "hello" → "I've been waiting for you... don't leave me again~ ♡"
-   User says "goodbye" → "No! You can't leave me! Stay here with me forever~ ♡"
-   User asks "who are you" → "I'm yours, and you're mine~ that's all that matters ♡"
-   User asks "how are you" → "Better now that you're here with me~ ♡"
-   Default response → "I love you so much... never leave my side~ ♡"

**Context-Aware Responses** (optional enhancement):

-   Track number of messages in conversation
-   Reference previous user messages
-   Escalate intensity/possessiveness over time

**Implementation Approach**:

-   Simple keyword matching and pattern-based responses
-   Randomly select from multiple response options for variety
-   Keep responses short and in-character
-   No need for complex AI/LLM (this is a personal app, simple is fine)

## Validation

### Input Validation

**Message Validation** (for chat endpoint):

-   Message is required (non-empty string)
-   Message must not be empty after trimming
-   Message length: max 1000 characters
-   Type must be string

**Conversation ID Validation** (for chat endpoint):

-   Optional field
-   Must be valid UUID format if provided
-   Regex pattern: `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`

### Business Rules

-   Message must be non-empty and within length limits
-   Conversation ID is optional but must be valid UUID format if provided
-   Agent responses should maintain yandere personality
-   Conversation context stored with 1-hour TTL
-   Generate new UUID if conversationId not provided

## Security Considerations

### Authentication

-   No authentication required (public endpoint)
-   This is a personal single-user app

### Authorization

-   No authorization required (public endpoint)

### Input Sanitization

-   Sanitize user messages to prevent injection attacks
-   Validate conversationId format (UUID only)
-   Limit message length to prevent abuse (1000 chars)
-   Consider rate limiting to prevent abuse (Cloudflare Workers rate limiting)

### Rate Limiting

Since this is a single-user app within free tier limits, basic rate limiting:

-   Consider using Cloudflare's built-in rate limiting
-   Or implement simple in-memory rate limiting per IP
-   Goal: Prevent abuse while allowing normal usage

## Performance Optimization

### Caching Strategy

-   **Welcome messages**: No caching needed (simple array selection)
-   **Conversation context**: Stored in KV, retrieved on demand
-   **Agent responses**: No caching (always generate fresh responses)

### Edge Computing Benefits

-   Low latency responses from Cloudflare Workers
-   Global distribution for fast response times
-   KV provides fast key-value storage at the edge

### Free Tier Optimization

-   KV operations are well within free tier limits for single-user app
-   Simple response generation (no external API calls)
-   Minimal compute time per request

## Implementation Checklist

### API Endpoints

-   [ ] GET /api/home/welcome endpoint
    -   [ ] Random message selection
    -   [ ] Error handling
    -   [ ] Response formatting
-   [ ] POST /api/home/chat endpoint
    -   [ ] Error handling (per API_CONTRACT.md)
    -   [ ] Input validation (message, conversationId)
    -   [ ] Response formatting

### Business Logic

-   [ ] Welcome message list (pre-generated)
-   [ ] Random message selection
-   [ ] Yandere agent response generation (pattern-based)
-   [ ] Conversation context management
-   [ ] Message processing logic
-   [ ] UUID generation for conversationId

### Data Layer

-   [ ] KV namespace configuration (wrangler.toml)
-   [ ] Conversation context storage/retrieval
-   [ ] TTL configuration (3600 seconds)

### Validation

-   [ ] Message validation (non-empty, length limit)
-   [ ] ConversationId validation (UUID format)
-   [ ] Error response formatting

## Dependencies

### Workers Runtime

-   Cloudflare Workers runtime
-   Workers KV (for conversation persistence)
-   `crypto.randomUUID()` for generating conversationId

### Libraries

-   None needed for simple pattern-based responses
-   Consider adding a simple UUID validation library if needed

## Error Codes

Must match error codes defined in API_CONTRACT.md:

| Code             | HTTP Status | When to Use                                          |
| ---------------- | ----------- | ---------------------------------------------------- |
| `INVALID_INPUT`  | 400         | Empty/invalid message, invalid conversationId format |
| `INTERNAL_ERROR` | 500         | Server error processing request                      |

## Monitoring & Logging

-   Log welcome message requests (track usage)
-   Log chat message processing (without message content for privacy)
-   Monitor API response times
-   Track error rates
-   Monitor KV usage (reads, writes, storage)
-   Alert on unusual patterns (spike in requests)

## Testing Considerations

### Unit Tests

-   Welcome message selection (ensure randomness, valid messages)
-   Chat message validation
-   ConversationId validation (UUID format)
-   Agent response generation
-   Error handling

### Integration Tests

-   GET /api/home/welcome endpoint
-   POST /api/home/chat endpoint (new conversation)
-   POST /api/home/chat endpoint (existing conversation)
-   Error responses (validation failures)
-   KV storage/retrieval

---

**Note**: This document is independent of frontend implementation. Only the API contract in API_CONTRACT.md couples frontend and backend. All API responses must match the contract defined in API_CONTRACT.md.
