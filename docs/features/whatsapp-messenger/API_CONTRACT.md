# WhatsApp Messenger - API Contract

**API contract defining the interface between frontend and backend. This is the only coupling point for the WhatsApp messenger feature.**

## Purpose

Deliver a browser-based WhatsApp experience powered by Twilio WhatsApp API that supports sending, receiving, history, threaded conversations, and contact aliases.

## API Base URL

-   Development: `http://localhost:8787/api`
-   Production: `https://bahasadri.com/api`

## Shared primitives

### Success response envelope

All REST responses follow this envelope so the frontend can apply shared handling logic:

```typescript
interface ApiSuccess<T> {
    success: true;
    data: T;
}
```

### Standard error response

```typescript
interface ApiError {
    success: false;
    error: string;
    code:
        | "INVALID_INPUT"
        | "NOT_FOUND"
        | "UNAUTHORIZED"
        | "INTERNAL_ERROR"
        | "TWILIO_ERROR";
}
```

| Code             | HTTP Status | When to use                                                        |
| ---------------- | ----------- | ------------------------------------------------------------------ |
| `INVALID_INPUT`  | 400         | Missing required fields, invalid phone number, malformed timestamp |
| `NOT_FOUND`      | 404         | Requested resource does not exist                                  |
| `UNAUTHORIZED`   | 403         | Twilio webhook signature is invalid                                |
| `INTERNAL_ERROR` | 500         | Unexpected server failure                                          |
| `TWILIO_ERROR`   | 502         | Twilio rejects the WhatsApp send request                           |

### Authentication & CORS

-   **Authentication**: Public endpoints have no auth, the webhook relies on Twilio signature validation.
-   **CORS**:
    -   Allowed origins: `https://bahasadri.com`
    -   Allowed methods: `GET`, `POST`, `PATCH`
    -   Allowed headers: `Content-Type`

## Data models

```typescript
type MessageDirection = "sent" | "received";

interface Message {
    id: string;
    direction: MessageDirection;
    phoneNumber: string; // the service's WhatsApp number sending/receiving the message
    counterpart: string; // the other party's E.164 phone number
    body: string;
    timestamp: number; // milliseconds since epoch
    status?: "success" | "failed" | "pending";
    errorMessage?: string;
    contactId?: string;
    unread?: boolean;
}

interface ThreadSummary {
    counterpart: string;
    lastMessagePreview: string;
    lastMessageTimestamp: number;
    lastDirection: MessageDirection;
    messageCount: number;
    unreadCount: number;
    contactId?: string;
    contactName?: string;
}

interface Contact {
    id: string;
    phoneNumber: string;
    displayName: string;
    createdAt: number;
    updatedAt: number;
}
```

## Endpoints

### `POST /api/whatsapp-messenger/send`

**Description**: Sends a WhatsApp message via Twilio from the service WhatsApp number.

**Request body**:

```typescript
interface SendWhatsAppRequest {
    phoneNumber: string; // recipient in E.164
    message: string;
    contactId?: string;
}
```

**Response**:

```typescript
interface SendWhatsAppResult {
    message: Message;
}
```

`ApiSuccess<SendWhatsAppResult>`

**Status codes**:

-   `200 OK`: message queued and stored
-   `400 Bad Request`: invalid phone number or empty message (`INVALID_INPUT`)
-   `502 Bad Gateway`: Twilio rejected the request (`TWILIO_ERROR`)

### `GET /api/whatsapp-messenger/messages`

**Description**: Retrieves a page of messages with a given counterpart.

**Query parameters**:

-   `counterpart` (required): the other party's phone number in E.164
-   `cursor` (optional): pagination cursor from the previous response
-   `limit` (optional): number of messages to return (default `50`, max `200`)

**Response**:

```typescript
interface MessagesResult {
    messages: Message[];
    cursor?: string;
    listComplete: boolean;
}
```

`ApiSuccess<MessagesResult>`

Messages are newest-first. `listComplete` is `true` when there are no older messages to page through.

**Status codes**:

-   `200 OK`
-   `400 Bad Request`: missing `counterpart` (`INVALID_INPUT`)
-   `500 Internal Server Error`

### `GET /api/whatsapp-messenger/messages-since`

**Description**: Polls for new activity since a provided timestamp and refreshes thread summaries.

**Query parameters**:

-   `since` (required): unix timestamp in milliseconds; use the `timestamp` returned by the previous call

**Response**:

```typescript
interface MessagesSinceResult {
    messages: Message[];
    threads: ThreadSummary[];
    timestamp: number; // server clock (ms) to use for the next poll
}
```

`ApiSuccess<MessagesSinceResult>`

`messages` contains newly received or sent items. `threads` contains any threads with activity since `since` so the UI can refresh previews and unread counts without a separate request. `timestamp` is the server time when the response was generated and should seed the next poll.

**Status codes**:

-   `200 OK`
-   `400 Bad Request`: invalid `since` (`INVALID_INPUT`)
-   `500 Internal Server Error`

### `GET /api/whatsapp-messenger/threads`

**Description**: Returns summaries for all conversation threads.

**Response**:

```typescript
interface ThreadListResult {
    threads: ThreadSummary[];
}
```

`ApiSuccess<ThreadListResult>`

**Status codes**:

-   `200 OK`
-   `500 Internal Server Error`

### `GET /api/whatsapp-messenger/contacts`

**Description**: Lists all saved contact aliases.

**Response**:

```typescript
interface ContactListResult {
    contacts: Contact[];
}
```

`ApiSuccess<ContactListResult>`

**Status codes**:

-   `200 OK`
-   `500 Internal Server Error`

### `POST /api/whatsapp-messenger/contacts`

**Description**: Adds a new contact alias for a phone number.

**Request body**:

```typescript
interface ContactCreatePayload {
    phoneNumber: string; // E.164 format
    displayName: string;
}
```

**Response**:

```typescript
interface ContactMutationResult {
    contact: Contact;
}
```

`ApiSuccess<ContactMutationResult>`

**Status codes**:

-   `200 OK`
-   `400 Bad Request`: invalid payload (`INVALID_INPUT`)
-   `500 Internal Server Error`

### `PATCH /api/whatsapp-messenger/contacts/[contactId]`

**Description**: Updates the display name of an existing contact.

**Path parameter**: `contactId` (string, UUID)

**Request body**:

```typescript
interface ContactUpdatePayload {
    displayName: string;
}
```

**Response**:

`ApiSuccess<ContactMutationResult>`

**Status codes**:

-   `200 OK`
-   `400 Bad Request`: invalid payload (`INVALID_INPUT`)
-   `404 Not Found`: contact does not exist (`NOT_FOUND`)
-   `500 Internal Server Error`

### `POST /api/whatsapp-messenger/webhook`

**Description**: Twilio posts incoming WhatsApp messages to this endpoint. This is backend-only; the frontend does not call it directly.

**Request**:

-   Content-Type: `application/x-www-form-urlencoded`
-   Body: Twilio webhook payload (`From`, `To`, `Body`, `MessageSid`, etc.)

**Security**: Validate the `X-Twilio-Signature` header before processing.

**Response**:

-   Content-Type: `text/xml`
-   Body: TwiML (`<Response></Response>`)

**Status codes**:

-   `200 OK`
-   `403 Forbidden`: invalid signature (`UNAUTHORIZED`)
-   `500 Internal Server Error`

---

**Note**: This document defines the frontend/backend contract. Implementation guidance is in `FRONTEND.md` and `BACKEND.md`.

