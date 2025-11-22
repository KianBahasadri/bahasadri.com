# Calculator - API Contract

**API contract document defining the interface between frontend and backend. This is the ONLY coupling point between frontend and backend.**

## Purpose

A calculator API that evaluates basic arithmetic expressions. The frontend handles the button-based UI and state management (on/off, display, input), while the backend performs the actual calculation when the user presses equals.

## API Base URL

-   Development: `http://localhost:8787/api`
-   Production: `https://bahasadri.com/api`

## Endpoints

### `POST /api/tools/calculator/calculate`

**Description**: Evaluates a basic arithmetic expression and returns the result

**Request**:

-   Content-Type: `application/json`
-   Body:

```typescript
interface CalculateRequest {
    expression: string;
}
```

The `expression` field contains a string representation of the calculation, e.g., `"2 + 3"`, `"10 - 5"`, `"4 * 7"`, `"20 / 4"`.

**Response**:

```typescript
interface CalculateResponse {
    result: number;
    expression: string;
}
```

**Status Codes**:

-   `200 OK`: Calculation successful
-   `400 Bad Request`: Invalid expression or division by zero
-   `500 Internal Server Error`: Server error during evaluation

## Shared Data Models

### TypeScript Types

```typescript
interface CalculateRequest {
    expression: string;
}

interface CalculateResponse {
    result: number;
    expression: string;
}
```

## Error Handling

### Standard Error Response

All errors follow this format:

```typescript
interface ErrorResponse {
    error: string;
    code: string;
}
```

The `code` field contains the specific error code that identifies the type of error, allowing the frontend to handle different error cases appropriately.

### Error Codes

| Code               | HTTP Status | When to Use                               |
| ------------------ | ----------- | ----------------------------------------- |
| `INVALID_INPUT`    | 400         | Invalid expression format or syntax error |
| `DIVISION_BY_ZERO` | 400         | Attempted division by zero                |
| `INTERNAL_ERROR`   | 500         | Server error during expression evaluation |

## Authentication/Authorization

-   **Required**: No
-   **Method**: None
-   Public calculator utility

## CORS

-   **Allowed Origins**: `https://bahasadri.com`
-   **Allowed Methods**: POST
-   **Allowed Headers**: Content-Type

## Testing

### Test Endpoints

-   Development: Use localhost endpoints
-   Production: Use production API URL

### Example Requests

```bash
# Calculate addition
curl -X POST "http://localhost:8787/api/tools/calculator/calculate" \
  -H "Content-Type: application/json" \
  -d '{"expression": "2 + 3"}'

# Calculate subtraction
curl -X POST "http://localhost:8787/api/tools/calculator/calculate" \
  -H "Content-Type: application/json" \
  -d '{"expression": "10 - 5"}'

# Calculate multiplication
curl -X POST "http://localhost:8787/api/tools/calculator/calculate" \
  -H "Content-Type: application/json" \
  -d '{"expression": "4 * 7"}'

# Calculate division
curl -X POST "http://localhost:8787/api/tools/calculator/calculate" \
  -H "Content-Type: application/json" \
  -d '{"expression": "20 / 4"}'

# Division by zero (returns error)
curl -X POST "http://localhost:8787/api/tools/calculator/calculate" \
  -H "Content-Type: application/json" \
  -d '{"expression": "10 / 0"}'
# Response: {"error": "Division by zero", "code": "DIVISION_BY_ZERO"}
```

---

**Note**: This document defines the contract between frontend and backend. Implementation details are in FRONTEND.md and BACKEND.md respectively.
