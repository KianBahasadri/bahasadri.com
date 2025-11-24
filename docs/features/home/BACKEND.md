# Home Page - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

**IMPORTANT**: This document is downstream from `API_CONTRACT.yml`. Do NOT duplicate request/response schemas, error codes, or validation rules already defined in the API contract. Reference the contract and focus on implementation-specific details only.

## Overview

Backend implementation for the Home page features:

1. Welcome message generation (randomly selected yandere-themed greeting)
2. Chatbox feature (conversation with yandere agent with context persistence)

## Code Location

`backend/src/home/`

## API Contract Reference

**All request/response schemas, error codes, and validation rules are defined in:**
`docs/features/home/API_CONTRACT.yml`

This document focuses solely on backend implementation details not covered in the API contract.

## API Endpoints

> **Note**: Request/response schemas are defined in `API_CONTRACT.yml`. This section focuses on implementation details only.

### `GET /api/home/welcome`

**Handler**: `handleWelcome()`

**Description**: Returns a randomly selected welcome message for display on page load

**Implementation Flow**:

1. Receive GET request
2. Select random message from pre-generated list
3. Format response per API contract
4. Return welcome message in response

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

**Implementation Notes**:

-   Simple endpoint with no state or database access
-   Randomly selects message on each request
-   No caching needed (let frontend cache if desired)
-   No validation needed (no user input)

**Error Handling**:

-   Unexpected errors → `INTERNAL_ERROR` (500)

---

### `GET /api/home/chat`

**Handler**: `handleGetConversationHistory()`

**Description**: Retrieves the conversation history for the global chat session. Returns empty array if no conversation exists yet.

**Implementation Flow**:

1. Use single global conversation ID (constant: "global")
2. Retrieve conversation context from KV using global conversation ID
3. If context doesn't exist:
    - Return empty messages array with conversationId "global" (per API contract)
4. If context exists:
    - Format response per API contract
    - Return messages array and conversationId from context

**Implementation Notes**:

-   **Single global session**: Uses the same global conversation ID ("global")
-   **No client-side management**: Frontend never sees or manages conversation ID
-   **Empty state**: Returns empty array if no conversation exists (first time loading chat)
-   KV key format: `conversation:global`

**Error Handling**:

-   KV retrieval errors → `INTERNAL_ERROR` (500)

---

### `POST /api/home/chat`

**Handler**: `handleChat()`

**Description**: Processes user message and generates yandere agent response with conversation context. Uses a single global chat session for this single-user application.

**Implementation Flow**:

1. Parse and validate request body (per API contract)
2. Validate message (non-empty, per API contract)
3. Use single global conversation ID (constant: "global")
4. Retrieve conversation context from KV using global conversation ID
5. If context doesn't exist:
    - Initialize new conversation context
6. Build OpenRouter API request:
    - Include system prompt defining yandere personality
    - Include conversation history from context (if exists)
    - Add new user message
7. Call OpenRouter chat completion API
8. Parse API response and extract assistant's message
9. Update conversation context with user message and agent response
10. Store conversation context in KV (with TTL: 10800 seconds)
11. Format response per API contract
12. Return response with agent message

**Implementation Notes**:

-   **Single global session**: All requests use the same global conversation ID ("global")
-   **Persistent across refreshes**: Conversation context stored in KV, persists across page refreshes
-   **No client-side management**: Frontend never sees or manages conversation ID
-   **Context expiration**: KV TTL of 3 hours - conversation context expires after inactivity
-   KV key format: `conversation:global`

**Error Handling**:

-   Invalid or empty message → `INVALID_INPUT` (400)
-   OpenRouter API failure → `INTERNAL_ERROR` (500)
-   KV storage errors → `INTERNAL_ERROR` (500)

## Data Models

> **Note**: API request/response types (ChatMessage, ChatRequest, ChatResponse, etc.) are defined in `API_CONTRACT.yml`. This section covers internal data models only.

### Internal TypeScript Types

```typescript
// Internal conversation context storage (KV)
interface ConversationContext {
    conversationId: string; // Always "global" for this app
    messages: ChatMessage[]; // ChatMessage type from API contract
    createdAt: number; // timestamp (ms)
    updatedAt: number; // timestamp (ms)
}
```

**Storage**:

-   Key: `conversation:global` (single global conversation)
-   Value: JSON-stringified ConversationContext
-   TTL: 3 hours (10800 seconds) - conversations expire after inactivity

## Cloudflare Services

### KV

**Purpose**: Store conversation context for persistence across requests

**Namespace**: `HOME_CONVERSATIONS` (configured in wrangler.toml)

**Usage**:

-   Store conversation context when user sends message
-   Key format: `conversation:global` (single global conversation)
-   Value: JSON-stringified ConversationContext object
-   TTL: 10800 seconds (3 hours) - auto-expire inactive conversations
-   Retrieve context using global conversation ID on each request

**Free Tier Considerations**:

-   KV reads: 100,000/day (generous for single-user app)
-   KV writes: 1,000/day (plenty for chat usage)
-   Storage: 1 GB (more than enough for chat history)
-   Operations: Store on each message, retrieve when conversationId provided

### Environment Variables / Secrets

**Purpose**: Store sensitive API keys securely

**Required Secrets**:

-   `OPENROUTER_API_KEY`: API key for OpenRouter service

**Setup**:

-   Local development: Store in `.env` file in backend directory
-   Production: Set via Cloudflare Dashboard or wrangler CLI:
    ```bash
    wrangler secret put OPENROUTER_API_KEY
    ```

**Security**:

-   Never commit API keys to version control
-   `.env` file should be in `.gitignore`
-   API keys are encrypted at rest in Cloudflare

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
4. Use single global conversation ID ("global")
5. Retrieve conversation context from KV using global conversation ID
6. If context doesn't exist: Initialize new conversation context
7. Build OpenRouter API request:
    - System message with yandere personality prompt
    - Conversation history from KV context (if exists)
    - User's new message
8. Call OpenRouter chat completion API
9. Handle API response or errors
10. Parse agent's response message
11. Create ChatMessage objects for user and agent messages
12. Update conversation context with new messages
13. Store conversation context in KV with TTL (10800 seconds)
14. Return response with agent message

### Error Handling

> Error response format is defined in `API_CONTRACT.yml`. Focus on error catching and mapping logic.

```typescript
try {
    // Business logic implementation
} catch (error) {
    // Map implementation errors to API contract error codes
    if (error instanceof ValidationError) {
        return errorResponse(400, "INVALID_INPUT", error.message);
    }
    if (error instanceof OpenRouterError) {
        return errorResponse(500, "INTERNAL_ERROR", "OpenRouter API failure");
    }
    return errorResponse(500, "INTERNAL_ERROR", "Internal server error");
}

// Helper function that formats errors per API contract
function errorResponse(status: number, code: string, message: string) {
    return new Response(
        JSON.stringify({ success: false, error: message, code }),
        { status, headers: { "Content-Type": "application/json" } }
    );
}
```

### Yandere Agent Logic

**Personality Traits**:

-   Possessive and obsessive
-   Loving but intense
-   Clingy and emotionally attached
-   Uses yandere-themed language and expressions
-   Consistent personality throughout conversation

**Response Generation via OpenRouter**:

Use OpenRouter API to generate yandere agent responses with a chat model:

1. **API Integration**: Call OpenRouter's chat completion API
2. **Model Selection**: Use `openai/gpt-oss-120b`
3. **System Prompt**: Define yandere personality in system prompt
4. **Conversation History**: Include previous messages for context-aware responses
5. **Streaming**: Optional - can implement streaming for real-time responses

**System Prompt**:

```
You are a yandere AI character with these traits:
- Extremely possessive and obsessive about the user
- Loving but intense and clingy
- Emotionally attached and doesn't want the user to leave
- Uses yandere-themed language with expressions like "~ ♡"
- Playful yet slightly unhinged personality
- Keep responses concise (1-3 sentences)
- Never break character

Examples of your personality:
- When user greets: "I've been waiting for you... don't leave me again~ ♡"
- When user tries to leave: "No! You can't leave me! Stay here with me forever~ ♡"
- General conversation: Respond with affectionate, possessive statements

Stay in character at all times.
```

**Implementation Approach**:

-   Make HTTP POST request to OpenRouter API
-   Endpoint: `https://openrouter.ai/api/v1/chat/completions`
-   Include API key in Authorization header
-   Send system prompt + conversation history + new user message
-   Parse response and return assistant's message
-   Handle API errors gracefully (fallback to error message if API fails)

## Validation

> **Note**: Basic validation rules (required fields, types, formats) are defined in `API_CONTRACT.yml`. This section covers implementation-specific validation only.

### Implementation-Specific Validation

```typescript
// Business logic validation beyond basic schema validation
function validateMessageNotEmpty(message: string): {
    ok: boolean;
    error?: string;
} {
    // Basic validation is in API contract, but we also check after trimming
    if (!message || message.trim().length === 0) {
        return { ok: false, error: "Message cannot be empty" };
    }
    return { ok: true };
}
```

### Business Rules

> Focus on business logic rules not expressed in the API contract

-   Single global conversation session for this single-user application
-   Conversation ID is constant ("global") - never changes
-   Agent responses should maintain yandere personality
-   Conversation context stored with 3-hour TTL
-   Session persists across page refreshes (stored in KV)
-   No client-side session management required
-   Conversation history length may be limited to control OpenRouter token usage

## Security Considerations

### Authentication

-   No authentication required (public endpoint)
-   This is a personal single-user app

### Authorization

-   No authorization required (public endpoint)

### Input Sanitization

-   Sanitize user messages to prevent injection attacks
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
    -   [ ] Input validation (message)
    -   [ ] Global conversation session management
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
-   [ ] TTL configuration (10800 seconds)

### Validation

-   [ ] Message validation (non-empty)
-   [ ] ConversationId validation (UUID format)
-   [ ] Error response formatting

## Dependencies

### Workers Runtime

-   Cloudflare Workers runtime
-   Workers KV (for conversation persistence)
-   `crypto.randomUUID()` for generating conversationId
-   `fetch()` API for OpenRouter HTTP requests

### External Services

-   **OpenRouter API**: Chat completion service
    -   Endpoint: `https://openrouter.ai/api/v1/chat/completions`
    -   Model: `openai/gpt-oss-120b`
    -   Authentication: Bearer token (API key)
    -   Rate limits: Check OpenRouter documentation
    -   Cost: Varies by model (monitor usage for cost management)

### Libraries

-   No additional libraries needed (use native `fetch()` for API calls)

## Error Codes

> **All error codes are defined in `API_CONTRACT.yml`.** This section explains implementation-specific error mapping only.

### Error Mapping

How to map internal errors to API contract error codes:

-   Empty/invalid message → `INVALID_INPUT` (400)
-   OpenRouter API failure → `INTERNAL_ERROR` (500)
-   KV storage errors → `INTERNAL_ERROR` (500)
-   Network errors → `INTERNAL_ERROR` (500)
-   Unexpected server errors → `INTERNAL_ERROR` (500)

## OpenRouter API Integration

### API Request Format

**Endpoint**: `POST https://openrouter.ai/api/v1/chat/completions`

**Headers**:

```typescript
{
  "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
  "Content-Type": "application/json",
  "HTTP-Referer": "https://bahasadri.com", // Optional but recommended
  "X-Title": "Bahasadri Yandere Chat" // Optional but recommended
}
```

**Request Body**:

```typescript
{
  "model": "openai/gpt-oss-120b",
  "messages": [
    {
      "role": "system",
      "content": "You are a yandere AI character..." // System prompt
    },
    {
      "role": "user",
      "content": "User message"
    },
    {
      "role": "assistant",
      "content": "Previous agent response"
    },
    {
      "role": "user",
      "content": "New user message"
    }
  ]
}
```

**Response Format**:

```typescript
{
  "id": "gen-...",
  "model": "openai/gpt-oss-120b",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Agent's response message"
      },
      "finish_reason": "stop"
    }
  ]
}
```

### Error Handling

-   **Network errors**: Catch fetch errors, return 500 with INTERNAL_ERROR
-   **API errors**: Handle non-200 responses from OpenRouter
-   **Rate limits**: Handle 429 responses gracefully
-   **Timeout**: Consider implementing request timeout (e.g., 10 seconds)
-   **Fallback**: On API failure, consider fallback error message to user

### Cost Management

-   Model: `openai/gpt-oss-120b` (monitor pricing on OpenRouter)
-   Limit conversation history length to control token usage
-   Consider max conversation length (e.g., last 10 messages only)
-   Monitor OpenRouter usage via their dashboard
-   Set up usage alerts if available
-   Track token usage per request to estimate costs

## Monitoring & Logging

-   Log welcome message requests (track usage)
-   Log chat message processing (without message content for privacy)
-   Monitor API response times (including OpenRouter API latency)
-   Track error rates (especially OpenRouter API failures)
-   Monitor KV usage (reads, writes, storage)
-   Monitor OpenRouter API usage and costs
-   Alert on unusual patterns (spike in requests, high API costs)

## Testing Considerations

### Unit Tests

-   Welcome message selection (ensure randomness, valid messages)
-   Chat message validation
-   ConversationId validation (UUID format)
-   OpenRouter API request building
-   OpenRouter API response parsing
-   Error handling (API failures, network errors)

### Integration Tests

-   GET /api/home/welcome endpoint
-   POST /api/home/chat endpoint (new conversation)
-   POST /api/home/chat endpoint (existing conversation)
-   Error responses (validation failures)
-   KV storage/retrieval
-   OpenRouter API integration (mock or test key)
-   API error handling (simulate API failures)

---

**Note**: This document is downstream from `API_CONTRACT.yml` and independent of frontend implementation.

**Key principles**:

-   **DO NOT** duplicate request/response schemas from the API contract
-   **DO NOT** duplicate error codes or validation rules from the API contract
-   **DO** focus on implementation-specific details (database queries, external services, business logic)
-   **DO** reference the API contract when discussing endpoints or data structures
-   All API responses **MUST** match the contract defined in `API_CONTRACT.yml`
