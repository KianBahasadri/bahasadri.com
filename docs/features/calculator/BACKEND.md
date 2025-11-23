# Calculator - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

## Overview

Backend implementation for the calculator utility. The backend handles expression evaluation for basic arithmetic operations (addition, subtraction, multiplication, division). It validates expressions, performs calculations, and returns results or appropriate error messages.

## Code Location

`backend/src/calculator/`

## API Contract Reference

See `docs/features/calculator/API_CONTRACT.md` for the API contract this backend provides.

## API Endpoints

### `POST /api/calculator/calculate`

**Handler**: `handleCalculate()`

**Description**: Evaluates a basic arithmetic expression and returns the result

**Request**:

-   Content-Type: `application/json`
-   Body: `{ expression: string }`
-   Expression format: `"operand1 operator operand2"` (e.g., `"2 + 3"`, `"10 - 5"`, `"4 * 7"`, `"20 / 4"`)

**Validation**:

-   Expression must be a non-empty string
-   Expression must match pattern: `number operator number` (with optional whitespace)
-   Supported operators: `+`, `-`, `*`, `/`
-   Operands must be valid numbers (integers or decimals)
-   Division by zero must be caught and rejected

**Response**:

```typescript
interface CalculateResponse {
    result: number;
    expression: string;
}
```

**Implementation Flow**:

1. Parse request body and extract expression
2. Validate expression format and structure
3. Parse operands and operator from expression
4. Validate operands are valid numbers
5. Check for division by zero
6. Perform arithmetic operation
7. Return result with original expression

**Error Handling**:

-   `INVALID_INPUT` (400): Invalid expression format, syntax error, or invalid operands
-   `DIVISION_BY_ZERO` (400): Attempted division by zero
-   `INTERNAL_ERROR` (500): Unexpected error during evaluation

## Data Models

### Database Schema

No database required. Calculator is stateless - each request is independent.

### TypeScript Types

```typescript
interface CalculateRequest {
    expression: string;
}

interface CalculateResponse {
    result: number;
    expression: string;
}

interface ErrorResponse {
    error: string;
    code: string;
}
```

## Cloudflare Services

No Cloudflare services required. Calculator performs stateless computation only.

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
    const { expression } = await request.json();

    // Validate and evaluate expression
    const result = evaluateExpression(expression);

    return new Response(JSON.stringify({ result, expression }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
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
    if (error instanceof DivisionByZeroError) {
        return new Response(
            JSON.stringify({
                error: "Division by zero",
                code: "DIVISION_BY_ZERO",
            }),
            {
                status: 400,
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
function validateExpression(expression: string): {
    ok: boolean;
    error?: string;
} {
    if (!expression || typeof expression !== "string") {
        return { ok: false, error: "Expression must be a non-empty string" };
    }

    // Match pattern: number operator number (with optional whitespace)
    const pattern = /^\s*([-+]?\d*\.?\d+)\s*([+\-*/])\s*([-+]?\d*\.?\d+)\s*$/;
    const match = expression.match(pattern);

    if (!match) {
        return { ok: false, error: "Invalid expression format" };
    }

    return { ok: true };
}

function parseExpression(expression: string): {
    operand1: number;
    operator: string;
    operand2: number;
} {
    const pattern = /^\s*([-+]?\d*\.?\d+)\s*([+\-*/])\s*([-+]?\d*\.?\d+)\s*$/;
    const match = expression.match(pattern);

    if (!match) {
        throw new ValidationError("Invalid expression format");
    }

    const operand1 = parseFloat(match[1]);
    const operator = match[2];
    const operand2 = parseFloat(match[3]);

    if (isNaN(operand1) || isNaN(operand2)) {
        throw new ValidationError("Invalid operands");
    }

    return { operand1, operator, operand2 };
}
```

### Business Rules

-   Only basic arithmetic operations are supported: addition (+), subtraction (-), multiplication (\*), division (/)
-   Operands must be valid numbers (integers or decimals)
-   Division by zero is not allowed and must return a `DIVISION_BY_ZERO` error
-   Expression must follow format: `number operator number` with optional whitespace
-   Results are returned as numbers (JavaScript number type)

### Input Sanitization

-   Expression string is validated against a strict regex pattern to prevent code injection
-   Only numeric operands and basic arithmetic operators are allowed
-   No evaluation of arbitrary JavaScript code - only parsing and arithmetic operations
-   Input length should be reasonable (e.g., max 100 characters) to prevent abuse

## Implementation Checklist

### API Endpoints

-   [ ] POST /api/calculator/calculate endpoint
-   [ ] Error handling (per API_CONTRACT.md)
-   [ ] CORS configuration

### Data Layer

-   N/A - No data layer required (stateless)

### Business Logic

-   [ ] Expression validation function
-   [ ] Expression parsing function
-   [ ] Arithmetic evaluation function
-   [ ] Division by zero detection
-   [ ] Error handling for invalid inputs

## Dependencies

### Workers Libraries

-   Native Workers API
-   `@cloudflare/workers-types` for types

## Error Codes

Must match error codes defined in API_CONTRACT.md:

| Code               | HTTP Status | When to Use                               |
| ------------------ | ----------- | ----------------------------------------- |
| `INVALID_INPUT`    | 400         | Invalid expression format or syntax error |
| `DIVISION_BY_ZERO` | 400         | Attempted division by zero                |
| `INTERNAL_ERROR`   | 500         | Server error during expression evaluation |

## Monitoring & Logging

-   Log calculation requests (expression and result) for debugging
-   Log errors with error codes for monitoring
-   Monitor response times (should be very fast for simple calculations)
-   Track error rates (especially division by zero and invalid input)

---

**Note**: This document is independent of frontend implementation. Only the API contract in API_CONTRACT.md couples frontend and backend. All API responses must match the contract defined in API_CONTRACT.md.
