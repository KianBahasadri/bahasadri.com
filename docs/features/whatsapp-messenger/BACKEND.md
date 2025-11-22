# WhatsApp Messenger - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

## Overview

Backend implementation for the WhatsApp Messenger utility. Handles WhatsApp message sending via Twilio WhatsApp API, message storage in KV, webhook processing, and contact management.

## Code Location

`backend/src/routes/whatsapp-messenger/`

## API Contract Reference

See `docs/features/whatsapp-messenger/API_CONTRACT.md` for the API contract this backend provides.

## API Endpoints

### `POST /api/whatsapp-messenger/send`

**Handler**: `sendWhatsApp()`

**Description**: Sends WhatsApp message via Twilio WhatsApp API and stores message in KV

**Request Body**:

```typescript
interface SendWhatsAppRequest {
    phoneNumber: string; // E.164 format
    message: string;
}
```

**Validation**:

-   Phone number: Must be valid E.164 format
-   Message: Non-empty, length limits (Twilio WhatsApp: 4096 chars)
-   Required: Both fields must be present

**Response**:

```typescript
interface SendWhatsAppResponse {
    success: boolean;
    message?: Message;
    error?: string;
}
```

**Implementation Flow**:

1. Parse and validate request body
2. Normalize phone number to E.164
3. Call Twilio WhatsApp API to send message
4. Store message in KV with key: `msg:counterpart:timestamp:id`
5. Update thread summary in KV
6. Return success response with message

**Error Handling**:

-   400: Invalid phone number or message
-   502: Twilio API error

### `GET /api/whatsapp-messenger/messages`

**Handler**: `getMessages()`

**Description**: Retrieves messages for a specific counterpart

**Request**:

-   Query: `counterpart` (required), `cursor` (optional), `limit` (optional)

**Response**:

```typescript
interface MessagesResponse {
    success: boolean;
    messages: Message[];
    cursor?: string;
    listComplete: boolean;
}
```

**Implementation Flow**:

1. Validate counterpart parameter
2. Query KV for messages with prefix `msg:counterpart:`
3. Sort by timestamp DESC
4. Apply pagination
5. Return messages and cursor

### `GET /api/whatsapp-messenger/messages-since`

**Handler**: `getMessagesSince()`

**Description**: Returns new messages since a timestamp (polling endpoint)

**Request**:

-   Query: `since` (required, Unix timestamp in ms)

**Response**:

```typescript
interface MessagesSinceResponse {
    success: boolean;
    messages: Message[];
    threads: ThreadSummary[];
    timestamp: number;
}
```

**Implementation Flow**:

1. Validate timestamp parameter
2. Query KV for all messages with timestamp > since
3. Get thread summaries
4. Return messages, threads, and current timestamp

### `GET /api/whatsapp-messenger/threads`

**Handler**: `getThreads()`

**Description**: Returns list of all conversation threads

**Request**: None

**Response**:

```typescript
interface ThreadListResponse {
    threads: ThreadSummary[];
}
```

**Implementation Flow**:

1. Query KV for thread summaries
2. Sort by last message timestamp DESC
3. Return threads

### `GET /api/whatsapp-messenger/contacts`

**Handler**: `listContacts()`

**Description**: Returns all contacts

**Request**: None

**Response**:

```typescript
interface ContactListResponse {
    contacts: Contact[];
}
```

**Implementation Flow**:

1. Query KV for contacts with prefix `contact:`
2. Return contacts list

### `POST /api/whatsapp-messenger/contacts`

**Handler**: `createContact()`

**Description**: Creates a new contact

**Request Body**:

```typescript
interface ContactCreatePayload {
    phoneNumber: string;
    displayName: string;
}
```

**Validation**:

-   Phone number: Valid E.164 format
-   Display name: Non-empty
-   Duplicate check: Phone number must be unique

**Response**:

```typescript
interface ContactMutationResult {
    success: boolean;
    contact?: Contact;
    error?: string;
}
```

**Implementation Flow**:

1. Validate input
2. Check for duplicate phone number
3. Generate contact ID (UUID)
4. Store in KV with key: `contact:{id}`
5. Return contact

### `PATCH /api/whatsapp-messenger/contacts/[contactId]`

**Handler**: `updateContact()`

**Description**: Updates an existing contact

**Request**:

-   Path: `contactId` (UUID)
-   Body: `{ displayName: string }`

**Response**:

```typescript
interface ContactMutationResult {
    success: boolean;
    contact?: Contact;
    error?: string;
}
```

**Implementation Flow**:

1. Validate contactId and input
2. Get contact from KV
3. Update display name
4. Update timestamp
5. Store back in KV
6. Return updated contact

### `POST /api/whatsapp-messenger/webhook`

**Handler**: `handleWebhook()`

**Description**: Processes incoming WhatsApp messages from Twilio webhook

**Request**:

-   Content-Type: `application/x-www-form-urlencoded`
-   Body: Twilio webhook form data

**Response**:

-   Content-Type: `text/xml`
-   Body: TwiML response

**Implementation Flow**:

1. Parse form data
2. Validate Twilio signature
3. Extract message data (From, To, Body, etc.)
4. Store incoming message in KV
5. Update thread summary
6. Return TwiML response

## Data Models

### KV Storage Structure

**Message Keys**: `msg:{counterpart}:{timestamp}:{id}`

-   Stores individual messages
-   Sorted by timestamp for efficient queries

**Thread Summary Keys**: `thread:{counterpart}`

-   Stores thread metadata
-   Updated on each message

**Contact Keys**: `contact:{id}`

-   Stores contact information
-   Indexed by phone number for lookups

### TypeScript Types

```typescript
interface Message {
    id: string;
    direction: "sent" | "received";
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
    lastDirection: "sent" | "received";
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

## Cloudflare Services

### KV Storage

**Namespace**: `WHATSAPP_MESSAGES`

**Usage**:

-   Store messages: `msg:{counterpart}:{timestamp}:{id}`
-   Store thread summaries: `thread:{counterpart}`
-   Store contacts: `contact:{id}`

**Operations**:

```typescript
// Store message
await env.WHATSAPP_MESSAGES.put(
    `msg:${counterpart}:${timestamp}:${id}`,
    JSON.stringify(message)
);

// Get messages
const list = await env.WHATSAPP_MESSAGES.list({ prefix: `msg:${counterpart}:` });

// Store thread summary
await env.WHATSAPP_MESSAGES.put(
    `thread:${counterpart}`,
    JSON.stringify(threadSummary)
);
```

### External API: Twilio WhatsApp

**Usage**:

-   Send WhatsApp messages via REST API
-   Receive WhatsApp messages via webhook
-   Validate webhook signatures

**Configuration**:

-   `TWILIO_ACCOUNT_SID`: Account identifier
-   `TWILIO_AUTH_TOKEN`: API authentication token
-   `TWILIO_WHATSAPP_NUMBER`: Sender WhatsApp number (format: `whatsapp:+1234567890`)

## Workers Logic

### Request Processing Flow

```
1. Receive request
2. Parse request (JSON or form data)
3. Validate input
4. Process business logic:
   - Send WhatsApp message (Twilio API)
   - Store in KV
   - Update thread summaries
5. Format response per API contract
6. Return response
```

### Error Handling

```typescript
try {
    // Operation
} catch (error) {
    if (error instanceof ValidationError) {
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
    if (error instanceof TwilioError) {
        return new Response(
            JSON.stringify({ success: false, error: "Twilio API error" }),
            { status: 502, headers: { "Content-Type": "application/json" } }
        );
    }
    return new Response(
        JSON.stringify({ success: false, error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
    );
}
```

## Validation

### Input Validation

```typescript
function validatePhoneNumber(phone: string): boolean {
    // E.164 format: +[country code][number]
    return /^\+[1-9]\d{1,14}$/.test(phone);
}

function validateMessage(message: string): { ok: boolean; error?: string } {
    if (!message || message.trim().length === 0) {
        return { ok: false, error: "Message cannot be empty" };
    }
    if (message.length > 4096) {
        return { ok: false, error: "Message too long" };
    }
    return { ok: true };
}
```

### Business Rules

-   Phone numbers must be E.164 format
-   Messages limited to 4096 characters (Twilio WhatsApp limit)
-   Thread summaries updated on every message
-   Contact phone numbers must be unique

## Security Considerations

### Authentication

-   None required for public endpoints
-   Twilio signature validation for webhook

### Authorization

-   None (public utility)

### Webhook Security

-   Validate Twilio signature using auth token
-   Reject invalid signatures with 403

## Performance Optimization

### Caching Strategy

-   Thread summaries cached in KV
-   Contact lookups cached
-   Message pagination to limit query size

### Edge Computing Benefits

-   Low latency message storage
-   Global distribution
-   Automatic scaling

## Implementation Checklist

### API Endpoints

-   [ ] POST /send endpoint
-   [ ] GET /messages endpoint
-   [ ] GET /messages-since endpoint
-   [ ] GET /threads endpoint
-   [ ] GET /contacts endpoint
-   [ ] POST /contacts endpoint
-   [ ] PATCH /contacts/[id] endpoint
-   [ ] POST /webhook endpoint
-   [ ] Error handling (per API_CONTRACT.md)

### Data Layer

-   [ ] KV message storage
-   [ ] KV thread summary storage
-   [ ] KV contact storage
-   [ ] Message query helpers
-   [ ] Thread summary helpers

### Business Logic

-   [ ] Twilio WhatsApp message sending
-   [ ] Message storage logic
-   [ ] Thread summary updates
-   [ ] Contact management
-   [ ] Webhook processing

### Testing

-   [ ] Unit tests for handlers
-   [ ] Integration tests with KV
-   [ ] Twilio API mocking
-   [ ] Error scenario testing

## Testing Considerations

### Unit Tests

-   Handler function testing
-   Validation logic testing
-   Error handling testing
-   KV operations testing

### Integration Tests

-   API endpoint testing (must match API_CONTRACT.md contract)
-   KV storage testing
-   Twilio API integration (mocked)
-   Webhook signature validation

## Dependencies

### Workers Libraries

-   Native Workers API
-   `@cloudflare/workers-types` for types

### External Services

-   Twilio WhatsApp REST API
-   Twilio webhook validation

## Error Codes

Must match error codes defined in API_CONTRACT.md:

| Code             | HTTP Status | When to Use                     |
| ---------------- | ----------- | ------------------------------- |
| `INVALID_INPUT`  | 400         | Invalid phone number or message |
| `NOT_FOUND`      | 404         | Contact not found               |
| `UNAUTHORIZED`   | 403         | Invalid Twilio signature        |
| `INTERNAL_ERROR` | 500         | Server error                    |
| `TWILIO_ERROR`   | 502         | Twilio API error                |

## Monitoring & Logging

-   Log all WhatsApp message sends
-   Log all incoming messages
-   Log webhook processing
-   Track Twilio API errors
-   Monitor KV storage usage

---

**Note**: This document is independent of frontend implementation. Only the API contract in API_CONTRACT.md couples frontend and backend. All API responses must match the contract defined in API_CONTRACT.md.

