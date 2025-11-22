# [Feature Name] - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

## Overview

Backend implementation for the [Feature Name] utility. [Brief description of what the backend handles]

## Code Location

`backend/src/routes/[feature-name]/`

## API Contract Reference

See `docs/features/[feature-name]/API_CONTRACT.md` for the API contract this backend provides.

## API Endpoints

### `[METHOD] /api/tools/[feature-name]/[endpoint]`

**Handler**: `[handlerName]()`

**Description**: [What this endpoint does]

**Request**:

-   [Request details]

**Validation**:

-   [Validation rules]

**Response**:

```typescript
interface [ResponseName] {
    // Response fields
}
```

**Implementation Flow**:

1. [Step 1]
2. [Step 2]
3. [Step 3]

**Error Handling**:

-   [Error codes and handling]

## Data Models

### Database Schema

```sql
-- [Table description]
CREATE TABLE [table_name] (
    [column definitions]
);
```

### TypeScript Types

```typescript
interface [ModelName] {
    // Model fields
}
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

```typescript
try {
    // Operation
} catch (error) {
    if (error instanceof ValidationError) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
    return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
    });
}
```

## Validation

### Input Validation

```typescript
function validate[Input](input: [Type]): { ok: boolean; error?: string } {
    // Validation logic
    return { ok: true };
}
```

### Business Rules

-   [Business rule 1]
-   [Business rule 2]

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
-   [ ] Error handling (per API_CONTRACT.md)

### Data Layer

-   [ ] [Data layer tasks]

### Business Logic

-   [ ] [Business logic tasks]

### Testing

-   [ ] Unit tests for handlers
-   [ ] Integration tests
-   [ ] Error scenario testing

## Testing Considerations

### Unit Tests

-   Handler function testing
-   Validation logic testing
-   Error handling testing

### Integration Tests

-   API endpoint testing (must match API_CONTRACT.md contract)
-   [Service] integration testing
-   End-to-end flow testing

## Dependencies

### Workers Libraries

-   Native Workers API
-   `@cloudflare/workers-types` for types

## Error Codes

Must match error codes defined in API_CONTRACT.md:

| Code             | HTTP Status | When to Use             |
| ---------------- | ----------- | ----------------------- |
| `INVALID_INPUT`  | 400         | [Description]           |
| `NOT_FOUND`      | 404         | [Description]           |
| `INTERNAL_ERROR` | 500         | [Description]           |

## Monitoring & Logging

-   [Logging requirements]

## Future Enhancements

-   [Future enhancement ideas]

---

**Note**: This document is independent of frontend implementation. Only the API contract in API_CONTRACT.md couples frontend and backend. All API responses must match the contract defined in API_CONTRACT.md.

