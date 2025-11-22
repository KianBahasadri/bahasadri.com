# SMS Messenger - API Contract

**API contract document defining the interface between frontend and backend. This is the ONLY coupling point between frontend and backend.**

## Purpose

SMS messaging utility that allows sending and receiving SMS messages via Twilio. Features include message history, threaded conversations, and contact management.

## API Base URL

-   Development: `http://localhost:8787/api`
-   Production: `https://bahasadri.com/api`

## Endpoints

### `POST /api/sms-messenger/send`

**Description**: Send an SMS message via Twilio

**Request Body**:

```typescript
interface SendSMSRequest {
    phoneNumber: string; // E.164 format
    message: string;
}
```

**Response**:

```typescript
interface SendSMSResponse {
    success: boolean;
    message?: Message;
    error?: string;
}

interface Message {
    id: string;
    direction: "sent" | "received";
    phoneNumber: string;
    counterpart: string;
    body: string;
    timestamp: number;
    status?: "success" | "failed" | "pending";
    errorMessage?: string;
}
```

**Status Codes**:

-   `200 OK`: Message sent successfully
-   `400 Bad Request`: Invalid phone number or message
-   `502 Bad Gateway`: Twilio API error

### `GET /api/sms-messenger/messages`

**Description**: Get messages for a specific counterpart (phone number)

**Request**:

-   Query parameters:
    -   `counterpart` (required, string): Phone number in E.164 format
    -   `cursor` (optional, string): Pagination cursor
    -   `limit` (optional, number): Number of messages to return

**Response**:

```typescript
interface MessagesResponse {
    success: boolean;
    messages: Message[];
    cursor?: string;
    listComplete: boolean;
    error?: string;
}
```

**Status Codes**:

-   `200 OK`: Success
-   `400 Bad Request`: Missing counterpart parameter
-   `500 Internal Server Error`: Server error

### `GET /api/sms-messenger/messages-since`

**Description**: Polling endpoint to get new messages since a timestamp

**Request**:

-   Query parameters:
    -   `since` (required, number): Unix timestamp in milliseconds

**Response**:

```typescript
interface MessagesSinceResponse {
    success: boolean;
    messages: Message[];
    threads: ThreadSummary[];
    timestamp: number;
    error?: string;
}

interface ThreadSummary {
    counterpart: string;
    lastMessagePreview: string;
    lastMessageTimestamp: number;
    lastDirection: "sent" | "received";
    messageCount: number;
    contactId?: string;
    contactName?: string;
}
```

**Status Codes**:

-   `200 OK`: Success
-   `400 Bad Request`: Invalid timestamp
-   `500 Internal Server Error`: Server error

### `GET /api/sms-messenger/threads`

**Description**: Get list of all conversation threads

**Request**: None

**Response**:

```typescript
interface ThreadListResponse {
    threads: ThreadSummary[];
}
```

**Status Codes**:

-   `200 OK`: Success
-   `500 Internal Server Error`: Server error

### `GET /api/sms-messenger/contacts`

**Description**: Get list of all contacts

**Request**: None

**Response**:

```typescript
interface ContactListResponse {
    contacts: Contact[];
}

interface Contact {
    id: string;
    phoneNumber: string;
    displayName: string;
    createdAt: number;
    updatedAt: number;
}
```

**Status Codes**:

-   `200 OK`: Success
-   `500 Internal Server Error`: Server error

### `POST /api/sms-messenger/contacts`

**Description**: Create a new contact

**Request Body**:

```typescript
interface ContactCreatePayload {
    phoneNumber: string;
    displayName: string;
}
```

**Response**:

```typescript
interface ContactMutationResult {
    success: boolean;
    contact?: Contact;
    error?: string;
}
```

**Status Codes**:

-   `200 OK`: Contact created
-   `400 Bad Request`: Invalid input
-   `500 Internal Server Error`: Server error

### `PATCH /api/sms-messenger/contacts/[contactId]`

**Description**: Update an existing contact

**Request**:

-   Path parameter: `contactId` (string, UUID)
-   Body:

```typescript
interface ContactUpdatePayload {
    displayName: string;
}
```

**Response**:

```typescript
interface ContactMutationResult {
    success: boolean;
    contact?: Contact;
    error?: string;
}
```

**Status Codes**:

-   `200 OK`: Contact updated
-   `404 Not Found`: Contact not found
-   `400 Bad Request`: Invalid input
-   `500 Internal Server Error`: Server error

### `POST /api/sms-messenger/webhook`

**Description**: Twilio webhook endpoint for receiving incoming SMS messages

**Request**:

-   Content-Type: `application/x-www-form-urlencoded`
-   Body: Twilio webhook form data

**Response**:

-   Content-Type: `text/xml`
-   Body: TwiML response (`<Response></Response>`)

**Status Codes**:

-   `200 OK`: Webhook processed
-   `403 Forbidden`: Invalid Twilio signature
-   `500 Internal Server Error`: Server error

## Shared Data Models

### TypeScript Types

```typescript
type MessageDirection = "sent" | "received";

interface Message {
    id: string;
    direction: MessageDirection;
    phoneNumber: string;
    counterpart: string;
    body: string;
    timestamp: number;
    status?: "success" | "failed" | "pending";
    errorMessage?: string;
    contactId?: string;
}

interface ThreadSummary {
    counterpart: string;
    lastMessagePreview: string;
    lastMessageTimestamp: number;
    lastDirection: MessageDirection;
    messageCount: number;
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

## Error Handling

### Standard Error Response

All errors follow this format:

```typescript
interface ErrorResponse {
    success: false;
    error: string;
}
```

### Error Codes

| Code             | HTTP Status | When to Use                      |
| ---------------- | ----------- | -------------------------------- |
| `INVALID_INPUT`  | 400         | Invalid phone number or message  |
| `NOT_FOUND`      | 404         | Contact not found                |
| `UNAUTHORIZED`   | 403         | Invalid Twilio webhook signature |
| `INTERNAL_ERROR` | 500         | Server error                     |
| `TWILIO_ERROR`   | 502         | Twilio API error                 |

## Authentication/Authorization

-   **Required**: No (public utility)
-   **Method**: None
-   **Webhook Security**: Twilio signature validation for webhook endpoint

## CORS

-   **Allowed Origins**: `https://bahasadri.com`
-   **Allowed Methods**: GET, POST, PATCH
-   **Allowed Headers**: Content-Type

## Testing

### Test Endpoints

-   Development: Use localhost endpoints
-   Production: Use production API URL

### Example Requests

```bash
# Send SMS
curl -X POST "http://localhost:8787/api/sms-messenger/send" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890", "message": "Hello"}'

# Get messages
curl -X GET "http://localhost:8787/api/sms-messenger/messages?counterpart=+1234567890"

# Get threads
curl -X GET "http://localhost:8787/api/sms-messenger/threads"

# Create contact
curl -X POST "http://localhost:8787/api/sms-messenger/contacts" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890", "displayName": "John Doe"}'
```

---

**Note**: This document defines the contract between frontend and backend. Implementation details are in FRONTEND.md and BACKEND.md respectively.
