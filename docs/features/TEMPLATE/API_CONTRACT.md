# [Feature Name] - API Contract

**API contract document defining the interface between frontend and backend. This is the ONLY coupling point between frontend and backend.**

## Purpose

[Brief description of what this feature does]

## API Base URL

-   Development: `http://localhost:8787/api`
-   Production: `https://bahasadri.com/api`

## Endpoints

### `[METHOD] /api/tools/[feature-name]/[endpoint]`

**Description**: [What this endpoint does]

**Request**:

-   [Request details: headers, body, query params, path params]

**Response**:

```typescript
interface [ResponseName] {
    // Response fields
}
```

**Status Codes**:

-   `200 OK`: [Success case]
-   `400 Bad Request`: [Error case]
-   `500 Internal Server Error`: [Error case]

## Shared Data Models

### TypeScript Types

```typescript
interface [ModelName] {
    // Model fields
}
```

## Error Handling

### Standard Error Response

All errors follow this format:

```typescript
interface ErrorResponse {
    error: string;
}
```

### Error Codes

| Code             | HTTP Status | When to Use   |
| ---------------- | ----------- | ------------- |
| `INVALID_INPUT`  | 400         | [Description] |
| `NOT_FOUND`      | 404         | [Description] |
| `INTERNAL_ERROR` | 500         | [Description] |

## Authentication/Authorization

-   **Required**: [Yes/No]
-   **Method**: [None/JWT/etc.]
-   [Additional auth details]

## CORS

-   **Allowed Origins**: `https://bahasadri.com`
-   **Allowed Methods**: [GET, POST, etc.]
-   **Allowed Headers**: Content-Type

## Testing

### Test Endpoints

-   Development: Use localhost endpoints
-   Production: Use production API URL

### Example Requests

```bash
# [Example curl command]
curl -X [METHOD] "http://localhost:8787/api/tools/[feature-name]/[endpoint]" \
  -H "Content-Type: application/json" \
  -d '[request body]'
```

---

**Note**: This document defines the contract between frontend and backend. Implementation details are in FRONTEND.md and BACKEND.md respectively.
