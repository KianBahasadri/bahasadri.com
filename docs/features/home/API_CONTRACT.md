# Home Page - API Contract

**API contract document defining the interface between frontend and backend. This is the ONLY coupling point between frontend and backend.**

## Purpose

The home page serves as the entry point to the application with:
1. A randomly generated welcome message displayed on page load
2. A chatbox feature that allows users to interact with a yandere agent

Both features require backend API endpoints.

## API Base URL

- Development: `http://localhost:8787/api`
- Production: `https://bahasadri.com/api`

## Endpoints

### `GET /api/home/welcome`

**Description**: Retrieves a randomly selected welcome message to display on page load

**Request**: No request body required

**Response**:

```typescript
interface WelcomeResponse {
    message: string;
}
```

**Example Success Response** (200 OK):

```json
{
    "message": "You entered my domain~ ♡"
}
```

**Status Codes**:

- `200 OK`: Welcome message returned successfully
- `500 Internal Server Error`: Server error retrieving the message

**Behavior**:
- Returns a randomly selected message from a pre-generated list of yandere-themed greetings
- Each request may return a different message
- No state is maintained between requests

---

### `POST /api/home/chat`

**Description**: Sends a user message to the yandere agent and receives a response

**Request**:

```typescript
interface ChatRequest {
    message: string;
    conversationId?: string; // Optional: for maintaining conversation context
}
```

**Response**:

```typescript
interface ChatResponse {
    response: string;
    conversationId: string;
}
```

**Example Success Response** (200 OK):

```json
{
    "response": "I've been waiting for you... ♡",
    "conversationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Status Codes**:

- `200 OK`: Message processed successfully, agent response returned
- `400 Bad Request`: Invalid or empty message
- `500 Internal Server Error`: Server error processing the message

**Conversation Context Behavior**:
- If `conversationId` is **not provided** in the request: Backend generates a new UUID and returns it in the response. This starts a new conversation.
- If `conversationId` **is provided** in the request: Backend uses it to retrieve conversation history and returns the same `conversationId` in the response.
- Frontend **must** store the `conversationId` from the first response and include it in all subsequent requests to maintain conversation continuity.
- Conversation history is stored temporarily (session-based) and may be cleared after a period of inactivity.

---

## Shared Data Models

### TypeScript Types

```typescript
// Welcome message endpoint
interface WelcomeResponse {
    message: string;
}

// Chat endpoint
interface ChatMessage {
    id: string;
    role: "user" | "agent";
    content: string;
    timestamp: number; // milliseconds since epoch
}

interface ChatRequest {
    message: string;
    conversationId?: string;
}

interface ChatResponse {
    response: string;
    conversationId: string;
}
```

## Error Handling

### Standard Error Response

All errors follow this format:

```typescript
interface ErrorResponse {
    success: false;
    error: string; // Human-readable error message
    code: "INVALID_INPUT" | "INTERNAL_ERROR";
}
```

**Example Error Response** (400 Bad Request):

```json
{
    "success": false,
    "error": "Message cannot be empty",
    "code": "INVALID_INPUT"
}
```

**Important**: Success responses (200 OK) **do not** include the `success` or `error` fields. They return only the documented response types (`WelcomeResponse` or `ChatResponse`).

### Error Codes

| Code             | HTTP Status | When to Use                      |
| ---------------- | ----------- | -------------------------------- |
| `INVALID_INPUT`  | 400         | Empty or invalid message         |
| `INTERNAL_ERROR` | 500         | Server error processing request  |

## Authentication/Authorization

- **Required**: No
- **Method**: None
- The home page endpoints are publicly accessible and require no authentication.

## CORS

### Production
- **Allowed Origins**: `https://bahasadri.com`
- **Allowed Methods**: `GET, POST`
- **Allowed Headers**: `Content-Type`

### Development
- **Allowed Origins**: `http://localhost:5173` (or any localhost port used by Vite dev server)
- **Allowed Methods**: `GET, POST`
- **Allowed Headers**: `Content-Type`

**Note**: The backend should detect the environment and configure CORS accordingly.

## Testing

### Test Endpoints

- Development: Use localhost endpoints (`http://localhost:8787/api`)
- Production: Use production API URL (`https://bahasadri.com/api`)

### Example Requests

```bash
# Get welcome message
curl -X GET "http://localhost:8787/api/home/welcome"

# Expected response:
# {"message":"You entered my domain~ ♡"}

# Send a chat message (new conversation)
curl -X POST "http://localhost:8787/api/home/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'

# Expected response:
# {"response":"I've been waiting for you... ♡","conversationId":"550e8400-e29b-41d4-a716-446655440000"}

# Send a message with conversation context
curl -X POST "http://localhost:8787/api/home/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"How are you?","conversationId":"550e8400-e29b-41d4-a716-446655440000"}'

# Expected response:
# {"response":"Better now that you're here~ ♡","conversationId":"550e8400-e29b-41d4-a716-446655440000"}
```

### Validation Testing

```bash
# Test empty message validation
curl -X POST "http://localhost:8787/api/home/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":""}'

# Expected response (400):
# {"success":false,"error":"Message cannot be empty","code":"INVALID_INPUT"}

# Test missing message field
curl -X POST "http://localhost:8787/api/home/chat" \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected response (400):
# {"success":false,"error":"Message is required","code":"INVALID_INPUT"}
```

---

**Note**: This document defines the contract between frontend and backend. Implementation details are in FRONTEND.md and BACKEND.md.
