# Video Call - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

## Overview

Backend implementation for the Video Call utility. Handles RealtimeKit API integration for creating meetings and generating participant tokens.

## Code Location

`backend/src/routes/video-call/`

## API Contract Reference

See `docs/features/video-call/API_CONTRACT.yml` for the API contract this backend provides.

## API Endpoints

### `POST /api/video-call/session`

**Handler**: `createSession()`

**Description**: Creates a new meeting via RealtimeKit's REST API. This corresponds to RealtimeKit's "Create Meeting" endpoint. Returns a meeting ID that can be used to generate participant tokens.

**Request Body**:

```typescript
interface CreateSessionRequest {
    name?: string;
}
```

**Validation**:

-   Name: Optional, string
-   No required fields

**Response**:

```typescript
interface CreateSessionResponse {
    meeting_id: string;
}
```

**Implementation Flow**:

1. Get RealtimeKit config from environment
2. Call RealtimeKit API to create meeting
3. Extract meeting ID from response
4. Return meeting ID

**Error Handling**:

-   500: RealtimeKit API error or missing config

### `POST /api/video-call/token`

**Handler**: `generateToken()`

**Description**: Generates a participant authentication token via RealtimeKit's REST API. This corresponds to RealtimeKit's "Add Participant" endpoint, which creates a participant entry for the meeting and returns an authToken. Each participant needs their own token.

**Request Body**:

```typescript
interface GenerateTokenRequest {
    meeting_id: string;
    name?: string;
    custom_participant_id?: string;
    preset_name?: string;
}
```

**Validation**:

-   meeting_id: Required, string
-   name: Optional, string
-   custom_participant_id: Optional, string
-   preset_name: Optional, string (default: "group_call_participant")

**Response**:

```typescript
interface GenerateTokenResponse {
    auth_token: string;
}
```

**Implementation Flow**:

1. Validate meeting_id is present
2. Get RealtimeKit config from environment
3. Call RealtimeKit API to generate token
4. Extract auth token from response
5. Return auth token

**Error Handling**:

-   400: Missing meeting_id (INVALID_INPUT)
-   404: Meeting does not exist (NOT_FOUND)
-   500: RealtimeKit API error (REALTIMEKIT_ERROR) or missing config (INTERNAL_ERROR)

## Data Models

### TypeScript Types

```typescript
interface RealtimeKitConfig {
    accountId: string;
    appId: string;
    apiToken: string;
}

interface RealtimeKitMeetingResponse {
    success: boolean;
    data: {
        id: string;
        title?: string;
        // ... other meeting fields
    };
    errors?: unknown[];
}

interface RealtimeKitTokenResponse {
    success: boolean;
    data: {
        token?: string;
        auth_token?: string;
        participant_id?: string;
    };
    errors?: unknown[];
}
```

## Cloudflare Services

### External API: Cloudflare RealtimeKit

**Usage**:

-   Create meetings via REST API
-   Generate participant tokens via REST API
-   No local storage needed (stateless)

**API Endpoints**:

-   `POST https://api.cloudflare.com/client/v4/accounts/{accountId}/realtime/meetings` - Create Meeting
-   `POST https://api.cloudflare.com/client/v4/accounts/{accountId}/realtime/meetings/{meetingId}/tokens` - Add Participant (returns authToken)

**Configuration**:

-   `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID
-   `CLOUDFLARE_REALTIME_APP_ID`: RealtimeKit app ID
-   `CLOUDFLARE_REALTIME_API_TOKEN`: API authentication token

## Workers Logic

### Request Processing Flow

```
1. Receive request
2. Parse request (JSON)
3. Validate input
4. Get RealtimeKit config from environment
5. Call RealtimeKit API:
   - Create meeting (POST /session)
   - Generate token (POST /token)
6. Parse RealtimeKit response
7. Format response per API contract
8. Return response
```

### Error Handling

All error responses must match the ErrorResponse schema from the API contract:

```typescript
interface ErrorResponse {
    error: string; // Human-readable error message
    code:
        | "INVALID_INPUT"
        | "NOT_FOUND"
        | "INTERNAL_ERROR"
        | "REALTIMEKIT_ERROR";
}

try {
    // Operation
} catch (error) {
    if (error instanceof ValidationError) {
        return new Response(
            JSON.stringify({
                error: error.message,
                code: "INVALID_INPUT",
            }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
    if (error instanceof RealtimeKitError) {
        if (error.status === 404) {
            return new Response(
                JSON.stringify({
                    error: "Meeting does not exist",
                    code: "NOT_FOUND",
                }),
                {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
        return new Response(
            JSON.stringify({
                error: "RealtimeKit API error",
                code: "REALTIMEKIT_ERROR",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
    return new Response(
        JSON.stringify({
            error: "Internal server error",
            code: "INTERNAL_ERROR",
        }),
        {
            status: 500,
            headers: { "Content-Type": "application/json" },
        }
    );
}
```

## Validation

### Input Validation

```typescript
function validateGenerateTokenRequest(body: unknown): {
    ok: boolean;
    error?: string;
} {
    if (!body || typeof body !== "object") {
        return { ok: false, error: "Invalid request body" };
    }

    const request = body as GenerateTokenRequest;

    if (!request.meeting_id || typeof request.meeting_id !== "string") {
        return { ok: false, error: "Missing meeting_id" };
    }

    return { ok: true };
}
```

### Business Rules

-   Meeting ID must be valid UUID or RealtimeKit meeting ID
-   Token generation requires valid meeting ID

## Security Considerations

### Authentication

-   None required for public endpoints
-   RealtimeKit API token stored in environment variables

### Authorization

-   None (public utility)
-   Tokens are meeting-specific and time-limited

### API Security

-   API tokens stored as environment secrets
-   No sensitive data exposed in responses

## Performance Optimization

### Caching Strategy

-   No caching needed (stateless API)
-   RealtimeKit handles meeting/token lifecycle

### Edge Computing Benefits

-   Low latency API calls
-   Global distribution
-   Automatic scaling

## Implementation Checklist

### API Endpoints

-   [ ] POST /session endpoint
-   [ ] POST /token endpoint
-   [ ] Error handling (per API_CONTRACT.yml)

### External Integration

-   [ ] RealtimeKit API client
-   [ ] Environment variable configuration
-   [ ] Error handling for API failures

### Business Logic

-   [ ] Meeting creation logic
-   [ ] Token generation logic
-   [ ] Config validation
-   [ ] Response formatting

## Dependencies

### Workers Libraries

-   Native Workers API
-   `@cloudflare/workers-types` for types

### External Services

-   Cloudflare RealtimeKit REST API

## Error Codes

Must match error codes defined in API_CONTRACT.yml:

| Code                | HTTP Status | When to Use             |
| ------------------- | ----------- | ----------------------- |
| `INVALID_INPUT`     | 400         | Missing required fields |
| `NOT_FOUND`         | 404         | Meeting not found       |
| `INTERNAL_ERROR`    | 500         | Server error            |
| `REALTIMEKIT_ERROR` | 500         | RealtimeKit API error   |

## Monitoring & Logging

-   Log all meeting creations
-   Log all token generations
-   Log RealtimeKit API errors
-   Track API response times

---

**Note**: This document is independent of frontend implementation. Only the API contract in API_CONTRACT.yml couples frontend and backend. All API responses must match the contract defined in API_CONTRACT.yml.
