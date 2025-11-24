# SMS Messenger - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

**IMPORTANT**: This document is downstream from `API_CONTRACT.yml`. Do NOT duplicate request/response schemas, error codes, or validation rules already defined in the API contract. Reference the contract and focus on implementation-specific details only.

## Overview

Backend implementation for the SMS Messenger utility. Handles SMS sending via Twilio, message storage in KV, webhook processing, and contact management.

## Code Location

`backend/src/routes/sms-messenger/`

## API Contract Reference

**All request/response schemas, error codes, and validation rules are defined in:**
`docs/features/sms-messenger/API_CONTRACT.yml`

This document focuses solely on backend implementation details not covered in the API contract.

## API Endpoints

> **Note**: Request/response schemas are defined in `API_CONTRACT.yml`. This section focuses on implementation details only.

### `POST /api/sms-messenger/send`

**Handler**: `sendSMS()`

**Description**: Sends SMS via Twilio API and stores message in KV

**Implementation Flow**:

1. Parse and validate request body (per API contract)
2. Normalize phone number to E.164 format
3. Call Twilio API to send SMS
4. Store message in KV with key: `msg:counterpart:timestamp:id`
5. Update thread summary in KV
6. Format response per API contract
7. Return success response with message

**Implementation Notes**:

-   KV key format: `msg:{counterpart}:{timestamp}:{id}`
-   Thread summary updated on each message
-   Message stored with direction "sent"

**Error Handling**:

-   Invalid phone number or message → `INVALID_INPUT` (400)
-   Twilio API error → `TWILIO_ERROR` (502)

### `GET /api/sms-messenger/messages`

**Handler**: `getMessages()`

**Description**: Retrieves messages for a specific counterpart

**Implementation Flow**:

1. Validate counterpart parameter (per API contract)
2. Query KV for messages with prefix `msg:counterpart:`
3. Sort by timestamp DESC
4. Apply pagination (cursor-based)
5. Format response per API contract
6. Return messages and cursor

**Implementation Notes**:

-   KV prefix: `msg:{counterpart}:`
-   Messages sorted by timestamp DESC (newest first)

### `GET /api/sms-messenger/messages-since`

**Handler**: `getMessagesSince()`

**Description**: Returns new messages since a timestamp (polling endpoint)

**Implementation Flow**:

1. Validate timestamp parameter (per API contract)
2. Query KV for all messages with timestamp > since
3. Get thread summaries for threads with activity
4. Format response per API contract
5. Return messages, threads, and current server timestamp

**Implementation Notes**:

-   Returns server clock time for next poll
-   Includes both new messages and updated thread summaries

### `GET /api/sms-messenger/threads`

**Handler**: `getThreads()`

**Description**: Returns list of all conversation threads

**Implementation Flow**:

1. Query KV for thread summaries with prefix `thread:`
2. Sort by last message timestamp DESC
3. Format response per API contract
4. Return threads

**Implementation Notes**:

-   KV prefix: `thread:`
-   Thread summaries include contact information if available

### `GET /api/sms-messenger/contacts`

**Handler**: `listContacts()`

**Description**: Returns all contacts

**Implementation Flow**:

1. Query KV for contacts with prefix `contact:`
2. Format response per API contract
3. Return contacts list

**Implementation Notes**:

-   KV prefix: `contact:`
-   Contacts indexed by phone number for lookups

### `POST /api/sms-messenger/contacts`

**Handler**: `createContact()`

**Description**: Creates a new contact

**Implementation Flow**:

1. Validate input (per API contract)
2. Check for duplicate phone number (business logic validation)
3. Generate contact ID (UUID)
4. Store in KV with key: `contact:{id}`
5. Format response per API contract
6. Return contact

**Implementation Notes**:

-   Phone number must be unique (business rule)
-   KV key format: `contact:{id}`

**Error Handling**:

-   Duplicate phone number → `INVALID_INPUT` (400)
-   Invalid input → `INVALID_INPUT` (400)

### `PATCH /api/sms-messenger/contacts/[contactId]`

**Handler**: `updateContact()`

**Description**: Updates an existing contact

**Implementation Flow**:

1. Validate contactId and input (per API contract)
2. Get contact from KV
3. If not found, return 404
4. Update display name
5. Update timestamp
6. Store back in KV
7. Format response per API contract
8. Return updated contact

**Implementation Notes**:

-   Only displayName can be updated
-   Updated timestamp reflects modification time

**Error Handling**:

-   Contact not found → `NOT_FOUND` (404)
-   Invalid input → `INVALID_INPUT` (400)

### `POST /api/sms-messenger/webhook`

**Handler**: `handleWebhook()`

**Description**: Processes incoming SMS from Twilio webhook (backend-only endpoint)

**Implementation Flow**:

1. Parse form data (application/x-www-form-urlencoded)
2. Validate Twilio signature (security check)
3. Extract message data (From, To, Body, MessageSid, etc.)
4. Store incoming message in KV with direction "received"
5. Update thread summary
6. Return TwiML response (text/xml)

**Implementation Notes**:

-   Frontend does not call this endpoint directly
-   Twilio signature validation required (X-Twilio-Signature header)
-   Message stored with direction "received"
-   Returns TwiML XML response

**Error Handling**:

-   Invalid Twilio signature → `UNAUTHORIZED` (403)
-   Processing errors → `INTERNAL_ERROR` (500)

## Data Models

> **Note**: API request/response types are defined in `API_CONTRACT.yml`. This section covers internal data models only.

### KV Storage Structure

**Message Keys**: `msg:{counterpart}:{timestamp}:{id}`

-   Stores individual messages
-   Sorted by timestamp for efficient queries
-   Prefix queries: `msg:{counterpart}:`

**Thread Summary Keys**: `thread:{counterpart}`

-   Stores thread metadata
-   Updated on each message
-   Includes contact information if available

**Contact Keys**: `contact:{id}`

-   Stores contact information
-   Indexed by phone number for lookups

### Internal TypeScript Types

> Only include types NOT defined in the API contract (e.g., KV storage helpers, internal utilities)

```typescript
// KV key builders (internal utilities)
type MessageKey = `msg:${string}:${number}:${string}`;
type ThreadKey = `thread:${string}`;
type ContactKey = `contact:${string}`;

// Twilio webhook payload (internal)
interface TwilioWebhookPayload {
    From: string;
    To: string;
    Body: string;
    MessageSid: string;
    // ... other Twilio fields
}
```

## Cloudflare Services

### KV Storage

**Namespace**: `SMS_MESSAGES`

**Usage**:

-   Store messages: `msg:{counterpart}:{timestamp}:{id}`
-   Store thread summaries: `thread:{counterpart}`
-   Store contacts: `contact:{id}`

**Operations**:

```typescript
// Store message
await env.SMS_MESSAGES.put(
    `msg:${counterpart}:${timestamp}:${id}`,
    JSON.stringify(message)
);

// Get messages
const list = await env.SMS_MESSAGES.list({ prefix: `msg:${counterpart}:` });

// Store thread summary
await env.SMS_MESSAGES.put(
    `thread:${counterpart}`,
    JSON.stringify(threadSummary)
);
```

### External API: Twilio

**Usage**:

-   Send SMS via REST API
-   Receive SMS via webhook
-   Validate webhook signatures

**Configuration**:

-   `TWILIO_ACCOUNT_SID`: Account identifier
-   `TWILIO_AUTH_TOKEN`: API authentication token
-   `TWILIO_PHONE_NUMBER`: Sender phone number

## Workers Logic

### Request Processing Flow

```
1. Receive request
2. Parse request (JSON or form data)
3. Validate input
4. Process business logic:
   - Send SMS (Twilio API)
   - Store in KV
   - Update thread summaries
5. Format response per API contract
6. Return response
```

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
    if (error instanceof TwilioError) {
        return errorResponse(502, "TWILIO_ERROR", "Twilio API error");
    }
    if (error instanceof NotFoundError) {
        return errorResponse(404, "NOT_FOUND", error.message);
    }
    if (error instanceof UnauthorizedError) {
        return errorResponse(403, "UNAUTHORIZED", error.message);
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

## Validation

> **Note**: Basic validation rules (required fields, types, formats) are defined in `API_CONTRACT.yml`. This section covers implementation-specific validation only.

### Implementation-Specific Validation

```typescript
// Business logic validation beyond basic schema validation
function validatePhoneNumberE164(phone: string): boolean {
    // E.164 format: +[country code][number]
    return /^\+[1-9]\d{1,14}$/.test(phone);
}

function checkDuplicateContact(phoneNumber: string): Promise<boolean> {
    // Check if contact with phone number already exists
    // This is business logic validation, not schema validation
    return checkKVForExistingContact(phoneNumber);
}
```

### Business Rules

> Focus on business logic rules not expressed in the API contract

-   Contact phone numbers must be unique (checked during creation)
-   Thread summaries updated on every message (sent or received)
-   Messages limited to 1600 characters (Twilio limit, enforced beyond schema)
-   Phone number normalization to E.164 format before storage

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
-   [ ] Error handling (per API_CONTRACT.yml)

### Data Layer

-   [ ] KV message storage
-   [ ] KV thread summary storage
-   [ ] KV contact storage
-   [ ] Message query helpers
-   [ ] Thread summary helpers

### Business Logic

-   [ ] Twilio SMS sending
-   [ ] Message storage logic
-   [ ] Thread summary updates
-   [ ] Contact management
-   [ ] Webhook processing

## Dependencies

### Workers Libraries

-   Native Workers API
-   `@cloudflare/workers-types` for types

### External Services

-   Twilio REST API
-   Twilio webhook validation

## Error Codes

> **All error codes are defined in `API_CONTRACT.yml`.** This section explains implementation-specific error mapping only.

### Error Mapping

How to map internal errors to API contract error codes:

-   Invalid phone number or message → `INVALID_INPUT` (400)
-   Duplicate contact phone number → `INVALID_INPUT` (400)
-   Contact not found → `NOT_FOUND` (404)
-   Invalid Twilio signature → `UNAUTHORIZED` (403)
-   Twilio API errors → `TWILIO_ERROR` (502)
-   KV storage errors → `INTERNAL_ERROR` (500)
-   Unexpected server errors → `INTERNAL_ERROR` (500)

## Monitoring & Logging

-   Log all SMS sends
-   Log all incoming messages
-   Log webhook processing
-   Track Twilio API errors
-   Monitor KV storage usage

---

**Note**: This document is downstream from `API_CONTRACT.yml` and independent of frontend implementation.

**Key principles**:

-   **DO NOT** duplicate request/response schemas from the API contract
-   **DO NOT** duplicate error codes or validation rules from the API contract
-   **DO** focus on implementation-specific details (database queries, external services, business logic)
-   **DO** reference the API contract when discussing endpoints or data structures
-   All API responses **MUST** match the contract defined in `API_CONTRACT.yml`
