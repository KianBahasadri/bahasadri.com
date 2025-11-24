# Video Call - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

**IMPORTANT**: This document is downstream from `API_CONTRACT.yml`. Do NOT duplicate request/response schemas, error codes, or validation rules already defined in the API contract. Reference the contract and focus on implementation-specific details only.

## Overview

Backend implementation for the Video Call utility. Handles RealtimeKit API integration for creating meetings and generating participant tokens.

## Code Location

`backend/src/routes/video-call/`

## API Contract Reference

**All request/response schemas, error codes, and validation rules are defined in:**
`docs/features/video-call/API_CONTRACT.yml`

This document focuses solely on backend implementation details not covered in the API contract.

## API Endpoints

> **Note**: Request/response schemas are defined in `API_CONTRACT.yml`. This section focuses on implementation details only.

### `POST /api/video-call/session`

**Handler**: `createSession()`

**Description**: Creates a new meeting via RealtimeKit's REST API. This corresponds to RealtimeKit's "Create Meeting" endpoint.

**Implementation Flow**:

1. Get RealtimeKit config from environment
2. Call RealtimeKit API to create meeting
3. Extract meeting ID from response
4. Format response per API contract (return meeting_id)
5. Return response

**Implementation Notes**:

-   No local storage needed (stateless)
-   RealtimeKit handles meeting lifecycle
-   Meeting persists until all participants leave or explicitly ended

**Error Handling**:

-   RealtimeKit API errors → `REALTIMEKIT_ERROR` (500)
-   Missing config → `INTERNAL_ERROR` (500)

### `POST /api/video-call/token`

**Handler**: `generateToken()`

**Description**: Generates a participant authentication token via RealtimeKit's REST API. This corresponds to RealtimeKit's "Add Participant" endpoint.

**Implementation Flow**:

1. Validate meeting_id is present (basic validation per API contract)
2. Get RealtimeKit config from environment
3. Call RealtimeKit API to generate token
4. Extract auth token from response
5. Format response per API contract (return auth_token)
6. Return response

**Implementation Notes**:

-   Each participant needs their own token
-   Token is used to initialize RealtimeKit SDK on frontend
-   Default preset_name: "group_call_participant" if not provided

**Error Handling**:

-   Missing meeting_id → `INVALID_INPUT` (400)
-   Meeting does not exist (RealtimeKit 404) → `NOT_FOUND` (404)
-   RealtimeKit API errors → `REALTIMEKIT_ERROR` (500)
-   Missing config → `INTERNAL_ERROR` (500)

## Data Models

> **Note**: API request/response types are defined in `API_CONTRACT.yml`. This section covers internal data models only.

### Internal TypeScript Types

```typescript
// RealtimeKit configuration (from environment)
interface RealtimeKitConfig {
    accountId: string;
    appId: string;
    apiToken: string;
}

// RealtimeKit API response types (internal)
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

**Documentation**: [Cloudflare RealtimeKit Documentation](https://developers.cloudflare.com/realtime/realtimekit/)

**Usage**:

-   Create meetings via REST API
-   Generate participant tokens via REST API
-   No local storage needed (stateless)

**API Endpoints**:

-   `POST https://api.cloudflare.com/client/v4/accounts/{accountId}/realtime/kit/{appId}/meetings` - Create Meeting
-   `POST https://api.cloudflare.com/client/v4/accounts/{accountId}/realtime/kit/{appId}/meetings/{meetingId}/tokens` - Add Participant (returns authToken)

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

> Error response format is defined in `API_CONTRACT.yml`. Focus on error catching and mapping logic.

```typescript
try {
    // Business logic implementation
} catch (error) {
    // Map implementation errors to API contract error codes
    if (error instanceof ValidationError) {
        return errorResponse(400, "INVALID_INPUT", error.message);
    }
    if (error instanceof RealtimeKitError) {
        if (error.status === 404) {
            return errorResponse(404, "NOT_FOUND", "Meeting does not exist");
        }
        return errorResponse(500, "REALTIMEKIT_ERROR", "RealtimeKit API error");
    }
    return errorResponse(500, "INTERNAL_ERROR", "Internal server error");
}

// Helper function that formats errors per API contract
function errorResponse(status: number, code: string, message: string) {
    return new Response(JSON.stringify({ error: message, code }), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}
```

## Validation

> **Note**: Basic validation rules (required fields, types, formats) are defined in `API_CONTRACT.yml`. This section covers implementation-specific validation only.

### Implementation-Specific Validation

```typescript
// Business logic validation beyond basic schema validation
function validateMeetingId(meetingId: string): { ok: boolean; error?: string } {
    // Validate meeting ID format (UUID or RealtimeKit meeting ID)
    if (!meetingId || typeof meetingId !== "string") {
        return { ok: false, error: "Missing meeting_id" };
    }
    // Additional format validation if needed
    return { ok: true };
}
```

### Business Rules

-   Meeting ID must be valid UUID or RealtimeKit meeting ID format
-   Token generation requires valid meeting ID (validated via RealtimeKit API)

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

> **All error codes are defined in `API_CONTRACT.yml`.** This section explains implementation-specific error mapping only.

### Error Mapping

How to map internal errors to API contract error codes:

-   Missing required fields (meeting_id) → `INVALID_INPUT` (400)
-   RealtimeKit API returns 404 → `NOT_FOUND` (404)
-   RealtimeKit API errors → `REALTIMEKIT_ERROR` (500)
-   Missing environment config → `INTERNAL_ERROR` (500)
-   Unexpected server errors → `INTERNAL_ERROR` (500)

## Monitoring & Logging

-   Log all meeting creations
-   Log all token generations
-   Log RealtimeKit API errors
-   Track API response times

---

**Note**: This document is downstream from `API_CONTRACT.yml` and independent of frontend implementation.

**Key principles**:

-   **DO NOT** duplicate request/response schemas from the API contract
-   **DO NOT** duplicate error codes or validation rules from the API contract
-   **DO** focus on implementation-specific details (database queries, external services, business logic)
-   **DO** reference the API contract when discussing endpoints or data structures
-   All API responses **MUST** match the contract defined in `API_CONTRACT.yml`
