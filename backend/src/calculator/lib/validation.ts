export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

export class DivisionByZeroError extends Error {
    constructor(message = "Division by zero") {
        super(message);
        this.name = "DivisionByZeroError";
    }
}

// Simple pattern: validates structure (number-operator-number) without complex number matching
// Numbers are validated separately using parseFloat to avoid regex complexity
const EXPRESSION_PATTERN = /^\s*([^\s+\-*/]+)\s*([+\-*/])\s*([^\s+\-*/]+)\s*$/;

function isValidNumber(str: string): boolean {
    // Use parseFloat to validate - it handles integers, decimals, and scientific notation
    const num = Number.parseFloat(str);
    return !Number.isNaN(num) && Number.isFinite(num);
}

export function validateExpression(expression: string): {
    ok: boolean;
    error?: string;
} {
    if (!expression || typeof expression !== "string") {
        return { ok: false, error: "Expression must be a non-empty string" };
    }

    // Check input length to prevent abuse
    if (expression.length > 100) {
        return { ok: false, error: "Expression too long (max 100 characters)" };
    }

    // Match pattern: number operator number (with optional whitespace)
    const match = EXPRESSION_PATTERN.exec(expression);

    if (!match) {
        return { ok: false, error: "Invalid expression format" };
    }

    // Validate that the operands are valid numbers
    const operand1 = match[1];
    const operand2 = match[3];

    if (!isValidNumber(operand1) || !isValidNumber(operand2)) {
        return { ok: false, error: "Invalid operands" };
    }

    return { ok: true };
}

export function parseExpression(expression: string): {
    operand1: number;
    operator: string;
    operand2: number;
} {
    const match = EXPRESSION_PATTERN.exec(expression);

    if (!match) {
        throw new ValidationError("Invalid expression format");
    }

    const operand1Str = match[1];
    const operator = match[2];
    const operand2Str = match[3];

    const operand1 = Number.parseFloat(operand1Str);
    const operand2 = Number.parseFloat(operand2Str);

    if (Number.isNaN(operand1) || Number.isNaN(operand2)) {
        throw new ValidationError("Invalid operands");
    }

    return { operand1, operator, operand2 };
}

export function evaluateExpression(expression: string): number {
    const { operand1, operator, operand2 } = parseExpression(expression);

    // Check for division by zero
    if (operator === "/" && operand2 === 0) {
        throw new DivisionByZeroError();
    }

    // Perform arithmetic operation
    switch (operator) {
        case "+": {
            return operand1 + operand2;
        }
        case "-": {
            return operand1 - operand2;
        }
        case "*": {
            return operand1 * operand2;
        }
        case "/": {
            return operand1 / operand2;
        }
        default: {
            throw new ValidationError(`Unsupported operator: ${operator}`);
        }
    }
}

