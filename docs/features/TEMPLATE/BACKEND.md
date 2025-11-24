# [Feature Name] - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

**IMPORTANT**: This document is downstream from `API_CONTRACT.yml`. Do NOT duplicate request/response schemas, error codes, or validation rules already defined in the API contract. Reference the contract and focus on implementation-specific details only.

## Overview

Backend implementation for the [Feature Name] utility. [Brief description of what the backend handles]

## Code Location

`backend/src/routes/[feature-name]/`

## API Contract Reference

**All request/response schemas, error codes, and validation rules are defined in:**
`docs/features/[feature-name]/API_CONTRACT.yml`

This document focuses solely on backend implementation details not covered in the API contract.

## API Endpoints

> **Note**: Request/response schemas are defined in `API_CONTRACT.yml`. This section focuses on implementation details only.

### `[METHOD] /api/[feature-name]/[endpoint]`

**Handler**: `[handlerName]()`

**Description**: [What this endpoint does from an implementation perspective]

**Implementation Flow**:

1. [Step 1 - e.g., Parse and extract request data]
2. [Step 2 - e.g., Call external service/database]
3. [Step 3 - e.g., Transform and return response per API contract]
4. [Additional implementation-specific steps]

**Implementation Notes**:

-   [Any implementation-specific details not in the API contract]
-   [Database queries, external API calls, caching strategies]
-   [Business logic details beyond basic validation]

**Error Handling**:

-   [Implementation-specific error handling logic]
-   [How to map external service errors to API contract error codes]

## Data Models

> **Note**: API request/response types are defined in `API_CONTRACT.yml`. This section covers internal data models only.

### Database Schema

```sql
-- [Table description]
CREATE TABLE [table_name] (
    [column definitions]
);

-- Indexes for query performance
CREATE INDEX idx_[name] ON [table_name] ([columns]);
```

### Internal TypeScript Types

> Only include types NOT defined in the API contract (e.g., database row types, internal service types, utility types)

```typescript
// Database row type (internal representation)
interface [ModelName]Row {
    // Database-specific fields (snake_case, internal IDs, etc.)
}

// Helper types for business logic
type [HelperType] = [definition];
```

## Cloudflare Services

### [Service Name]

**Binding**: `[BINDING_NAME]`

**Usage**:

-   [How it's used]

**Operations**:

```typescript
// [Operation description]
await env.[BINDING_NAME].[operation]([params]);
```

## Workers Logic

### Request Processing Flow

```
1. Receive request
2. Parse request
3. Validate input
4. Process business logic
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
    if (error instanceof [ServiceSpecificError]) {
        return errorResponse(400, "INVALID_INPUT", error.message);
    }
    if (error instanceof [DatabaseError]) {
        return errorResponse(
            500,
            "INTERNAL_ERROR",
            "Database operation failed"
        );
    }
    // Handle other error types...
    return errorResponse(500, "INTERNAL_ERROR", "Unexpected error");
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
function validate[BusinessLogic](input: [Type]): { ok: boolean; error?: string } {
    // Example: Check if resource exists, validate business constraints, etc.
    return { ok: true };
}
```

### Business Rules

> Focus on business logic rules not expressed in the API contract

-   [Business rule 1 - e.g., "User must have completed X before doing Y"]
-   [Business rule 2 - e.g., "Resource limits per account"]
-   [Complex validation involving external services or database queries]

## Security Considerations

### Authentication

-   [Authentication requirements]

### Authorization

-   [Authorization requirements]

### Input Sanitization

-   [Input sanitization notes]

## Performance Optimization

### Caching Strategy

-   [Caching strategy]

### Edge Computing Benefits

-   [Edge computing benefits]

## Implementation Checklist

### API Endpoints

-   [ ] [METHOD] /[endpoint] endpoint
-   [ ] Error handling (per API_CONTRACT.yml)

### Data Layer

-   [ ] [Data layer tasks]

### Business Logic

-   [ ] [Business logic tasks]

## Dependencies

### Workers Libraries

-   Native Workers API
-   `@cloudflare/workers-types` for types

## Error Codes

> **All error codes are defined in `API_CONTRACT.yml`.** This section explains implementation-specific error mapping only.

### Error Mapping

How to map internal errors to API contract error codes:

-   Database errors → `INTERNAL_ERROR` (500)
-   External service errors → [Map to appropriate contract error code]
-   Validation failures → `INVALID_INPUT` (400)
-   Resource not found → `NOT_FOUND` (404)
-   [Other service-specific mappings]

## Monitoring & Logging

-   [Logging requirements]

---

**Note**: This document is downstream from `API_CONTRACT.yml` and independent of frontend implementation.

**Key principles**:

-   **DO NOT** duplicate request/response schemas from the API contract
-   **DO NOT** duplicate error codes or validation rules from the API contract
-   **DO** focus on implementation-specific details (database queries, external services, business logic)
-   **DO** reference the API contract when discussing endpoints or data structures
-   All API responses **MUST** match the contract defined in `API_CONTRACT.yml`
