# Calculator - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

## Overview

Backend implementation for the calculator utility. The backend handles expression evaluation for arithmetic operations of any length (addition, subtraction, multiplication, division). It validates expressions, performs calculations with proper operator precedence, and returns results or appropriate error messages.

## Code Location

`backend/src/calculator/`

## API Contract Reference

See `docs/features/calculator/API_CONTRACT.md` for the API contract this backend provides.

## API Endpoints

### `POST /api/calculator/calculate`

**Handler**: `handleCalculate()`

**Description**: Evaluates an arithmetic expression of any length and returns the result

**Request**:

-   Content-Type: `application/json`
-   Body: `{ expression: string }`
-   Expression format: Supports equations of any length with multiple operations (e.g., `"2 + 3"`, `"10 - 5"`, `"5 + 3 * 2 - 1"`, `"10 / 2 + 5 * 3 - 1"`)

**Validation**:

-   Expression must be a non-empty string
-   Expression must be a valid arithmetic expression with proper syntax
-   Supported operators: `+`, `-`, `*`, `/`
-   Operands must be valid numbers (integers or decimals)
-   Expression must respect operator precedence (multiplication and division before addition and subtraction)
-   Division by zero must be caught and rejected
-   Expression length should be reasonable (e.g., max 1000 characters) to prevent abuse

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
3. Parse expression into tokens (numbers and operators)
4. Validate all operands are valid numbers
5. Evaluate expression with proper operator precedence
6. Check for division by zero during evaluation
7. Perform arithmetic operations
8. Return result with original expression

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

    // Check input length to prevent abuse
    if (expression.length > 1000) {
        return { ok: false, error: "Expression too long (max 1000 characters)" };
    }

    // Validate expression syntax (must be valid arithmetic expression)
    // This should use a proper expression parser that handles operator precedence
    // For now, placeholder for full expression validation
    if (!isValidArithmeticExpression(expression)) {
        return { ok: false, error: "Invalid expression format" };
    }

    return { ok: true };
}

function parseExpression(expression: string): ExpressionNode {
    // Parse expression into an abstract syntax tree (AST) or token stream
    // Handle operator precedence: multiplication/division before addition/subtraction
    // This requires a proper expression parser (e.g., recursive descent, shunting yard algorithm)
    // Placeholder for full expression parsing
    return parseToAST(expression);
}

function evaluateExpression(expression: string): number {
    // Evaluate the parsed expression with proper operator precedence
    // Traverse AST or use postfix evaluation
    const ast = parseExpression(expression);
    return evaluateAST(ast);
}
```

### Business Rules

-   Arithmetic operations are supported: addition (+), subtraction (-), multiplication (\*), division (/)
-   Expressions of any length are supported (e.g., "5 + 3 * 2 - 1")
-   Operator precedence must be respected: multiplication and division are evaluated before addition and subtraction
-   Operands must be valid numbers (integers or decimals)
-   Division by zero is not allowed and must return a `DIVISION_BY_ZERO` error
-   Expression must be a valid arithmetic expression with proper syntax
-   Results are returned as numbers (JavaScript number type)

### Input Sanitization

-   Expression string is validated using a proper expression parser to prevent code injection
-   Only numeric operands and basic arithmetic operators are allowed
-   No evaluation of arbitrary JavaScript code - only parsing and arithmetic operations
-   Expression parser must handle operator precedence correctly
-   Input length should be reasonable (e.g., max 1000 characters) to prevent abuse

## Implementation Checklist

### API Endpoints

-   [ ] POST /api/calculator/calculate endpoint
-   [ ] Error handling (per API_CONTRACT.md)
-   [ ] CORS configuration

### Data Layer

-   N/A - No data layer required (stateless)

### Business Logic

-   [ ] Expression validation function (supports equations of any length)
-   [ ] Expression parsing function (handles operator precedence)
-   [ ] Arithmetic evaluation function (evaluates multi-operand expressions)
-   [ ] Operator precedence handling (multiplication/division before addition/subtraction)
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
