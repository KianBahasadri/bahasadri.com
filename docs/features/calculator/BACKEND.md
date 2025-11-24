# Calculator - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

**IMPORTANT**: This document is downstream from `API_CONTRACT.yml`. Do NOT duplicate request/response schemas, error codes, or validation rules already defined in the API contract. Reference the contract and focus on implementation-specific details only.

## Overview

Backend implementation for the calculator utility. The backend handles expression evaluation for arithmetic operations of any length (addition, subtraction, multiplication, division). It validates expressions, performs calculations with proper operator precedence, and returns results or appropriate error messages.

## Code Location

`backend/src/calculator/`

## API Contract Reference

**All request/response schemas, error codes, and validation rules are defined in:**
`docs/features/calculator/API_CONTRACT.yml`

This document focuses solely on backend implementation details not covered in the API contract.

## API Endpoints

> **Note**: Request/response schemas are defined in `API_CONTRACT.yml`. This section focuses on implementation details only.

### `POST /api/calculator/calculate`

**Handler**: `handleCalculate()`

**Description**: Evaluates an arithmetic expression of any length and returns the result

**Implementation Flow**:

1. Parse request body and extract expression (per API contract)
2. Validate expression format and structure (per API contract + business logic)
3. Parse expression into tokens (numbers and operators)
4. Validate all operands are valid numbers
5. Evaluate expression with proper operator precedence
6. Check for division by zero during evaluation
7. Format response per API contract
8. Return result with original expression

**Implementation Notes**:

-   Expression format: Supports equations of any length with multiple operations
-   Supported operators: `+`, `-`, `*`, `/`
-   Operator precedence: multiplication and division before addition and subtraction
-   Expression length limit: 1000 characters (to prevent abuse)
-   Stateless computation - no database or storage needed

**Error Handling**:

-   Invalid expression format, syntax error, invalid operands → `INVALID_INPUT` (400)
-   Attempted division by zero → `DIVISION_BY_ZERO` (400)
-   Unexpected error during evaluation → `INTERNAL_ERROR` (500)

## Data Models

> **Note**: API request/response types are defined in `API_CONTRACT.yml`. This section covers internal data models only.

### Database Schema

No database required. Calculator is stateless - each request is independent.

### Internal TypeScript Types

> Only include types NOT defined in the API contract (e.g., AST nodes, parsing utilities)

```typescript
// Expression parsing internal types
interface ExpressionNode {
    type: "number" | "operator";
    value: number | string;
    left?: ExpressionNode;
    right?: ExpressionNode;
}

type Operator = "+" | "-" | "*" | "/";
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

> Error response format is defined in `API_CONTRACT.yml`. Focus on error catching and mapping logic.

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
    // Map implementation errors to API contract error codes
    if (error instanceof ValidationError) {
        return errorResponse(400, "INVALID_INPUT", error.message);
    }
    if (error instanceof DivisionByZeroError) {
        return errorResponse(400, "DIVISION_BY_ZERO", "Division by zero");
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
function validateExpression(expression: string): {
    ok: boolean;
    error?: string;
} {
    // Basic validation (non-empty string) is in API contract
    // This adds business logic validation

    // Check input length to prevent abuse
    if (expression.length > 1000) {
        return {
            ok: false,
            error: "Expression too long (max 1000 characters)",
        };
    }

    // Validate expression syntax (must be valid arithmetic expression)
    // This should use a proper expression parser that handles operator precedence
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

> Focus on business logic rules not expressed in the API contract

-   Operator precedence must be respected: multiplication and division are evaluated before addition and subtraction
-   Division by zero is not allowed and must return a `DIVISION_BY_ZERO` error
-   Expression length limit: 1000 characters (to prevent abuse)
-   Expression parser must handle operator precedence correctly
-   No evaluation of arbitrary JavaScript code - only parsing and arithmetic operations
-   Results are returned as numbers (JavaScript number type)

## Implementation Checklist

### API Endpoints

-   [ ] POST /api/calculator/calculate endpoint
-   [ ] Error handling (per API_CONTRACT.yml)
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

> **All error codes are defined in `API_CONTRACT.yml`.** This section explains implementation-specific error mapping only.

### Error Mapping

How to map internal errors to API contract error codes:

-   Invalid expression format or syntax error → `INVALID_INPUT` (400)
-   Invalid operands → `INVALID_INPUT` (400)
-   Expression too long → `INVALID_INPUT` (400)
-   Attempted division by zero → `DIVISION_BY_ZERO` (400)
-   Unexpected error during evaluation → `INTERNAL_ERROR` (500)

## Monitoring & Logging

-   Log calculation requests (expression and result) for debugging
-   Log errors with error codes for monitoring
-   Monitor response times (should be very fast for simple calculations)
-   Track error rates (especially division by zero and invalid input)

---

**Note**: This document is downstream from `API_CONTRACT.yml` and independent of frontend implementation.

**Key principles**:

-   **DO NOT** duplicate request/response schemas from the API contract
-   **DO NOT** duplicate error codes or validation rules from the API contract
-   **DO** focus on implementation-specific details (database queries, external services, business logic)
-   **DO** reference the API contract when discussing endpoints or data structures
-   All API responses **MUST** match the contract defined in `API_CONTRACT.yml`
