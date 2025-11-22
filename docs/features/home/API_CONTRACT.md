# Home Page - API Contract

**API contract document defining the interface between frontend and backend. This is the ONLY coupling point between frontend and backend.**

## Purpose

The home page serves as the entry point to the application with a chatbox feature that allows users to interact with a yandere agent. The chatbox requires backend API endpoints for message processing and agent responses.

## API Base URL

-   Development: `http://localhost:8787/api`
-   Production: `https://bahasadri.com/api`

## Endpoints

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

**Status Codes**:

-   `200 OK`: Message processed successfully, agent response returned
-   `400 Bad Request`: Invalid or empty message
-   `500 Internal Server Error`: Server error processing the message

## Shared Data Models

### TypeScript Types

```typescript
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
    error: string;
    code: "INVALID_INPUT" | "INTERNAL_ERROR";
}
```

### Error Codes

| Code             | HTTP Status | When to Use                    |
| ---------------- | ----------- | ------------------------------ |
| `INVALID_INPUT`  | 400         | Empty or invalid message       |
| `INTERNAL_ERROR` | 500         | Server error processing message |

## Authentication/Authorization

-   **Required**: No
-   **Method**: None
-   The home page and chatbox are publicly accessible and require no authentication.

## CORS

-   **Allowed Origins**: `https://bahasadri.com`
-   **Allowed Methods**: `POST`
-   **Allowed Headers**: `Content-Type`

## Testing

### Test Endpoints

-   Development: Use localhost endpoints
-   Production: Use production API URL

### Example Requests

```bash
# Send a chat message
curl -X POST "http://localhost:8787/api/home/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'

# Send a message with conversation context
curl -X POST "http://localhost:8787/api/home/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"How are you?","conversationId":"abc-123"}'
```

---

**Note**: This document defines the contract between frontend and backend. Implementation details are in FRONTEND.md and BACKEND.md.

