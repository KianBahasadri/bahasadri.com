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

type Token =
    | { type: "number"; value: number }
    | { type: "operator"; value: string };

const OPERATORS = new Set(["+", "-", "*", "/"]);
const OPERATOR_PRECEDENCE: Record<string, number> = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
};

function parseNumber(
    expression: string,
    startIndex: number
): { value: number; endIndex: number } {
    let numStr = "";
    let hasDecimal = false;
    let i = startIndex;
    const len = expression.length;

    while (i < len) {
        const currentChar = expression[i];
        if (currentChar >= "0" && currentChar <= "9") {
            numStr += currentChar;
            i++;
        } else if (currentChar === "." && !hasDecimal) {
            numStr += currentChar;
            hasDecimal = true;
            i++;
        } else {
            break;
        }
    }

    if (numStr === "" || numStr === ".") {
        throw new ValidationError("Invalid number format");
    }

    const num = Number.parseFloat(numStr);
    if (Number.isNaN(num) || !Number.isFinite(num)) {
        throw new ValidationError("Invalid number");
    }

    return { value: num, endIndex: i };
}

function tokenize(expression: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    const len = expression.length;

    while (i < len) {
        const char = expression[i];

        if (char === " ") {
            i++;
            continue;
        }

        if (OPERATORS.has(char)) {
            tokens.push({ type: "operator", value: char });
            i++;
            continue;
        }

        if ((char >= "0" && char <= "9") || char === ".") {
            const { value, endIndex } = parseNumber(expression, i);
            tokens.push({ type: "number", value });
            i = endIndex;
            continue;
        }

        throw new ValidationError(`Invalid character: ${char}`);
    }

    return tokens;
}

function validateTokens(tokens: Token[]): void {
    if (tokens.length === 0) {
        throw new ValidationError("Expression must not be empty");
    }

    let expectNumber = true;

    for (const token of tokens) {
        if (expectNumber) {
            if (token.type !== "number") {
                throw new ValidationError("Expected number");
            }
            expectNumber = false;
        } else {
            if (token.type !== "operator") {
                throw new ValidationError("Expected operator");
            }
            expectNumber = true;
        }
    }

    if (expectNumber) {
        throw new ValidationError("Expression must end with a number");
    }
}

function shouldPopOperator(operators: Token[], currentOp: string): boolean {
    const lastOp = operators.at(-1);
    if (lastOp === undefined) {
        return false;
    }
    return OPERATOR_PRECEDENCE[lastOp.value] >= OPERATOR_PRECEDENCE[currentOp];
}

function infixToPostfix(tokens: Token[]): Token[] {
    const output: Token[] = [];
    const operators: Token[] = [];

    for (const token of tokens) {
        if (token.type === "number") {
            output.push(token);
        } else {
            while (shouldPopOperator(operators, token.value)) {
                const op = operators.pop();
                if (op) {
                    output.push(op);
                }
            }
            operators.push(token);
        }
    }

    while (operators.length > 0) {
        const op = operators.pop();
        if (op) {
            output.push(op);
        }
    }

    return output;
}

function applyOperator(operator: string, a: number, b: number): number {
    switch (operator) {
        case "+": {
            return a + b;
        }
        case "-": {
            return a - b;
        }
        case "*": {
            return a * b;
        }
        case "/": {
            if (b === 0) {
                throw new DivisionByZeroError();
            }
            return a / b;
        }
        default: {
            throw new ValidationError(`Unsupported operator: ${operator}`);
        }
    }
}

function evaluatePostfix(postfix: Token[]): number {
    const stack: number[] = [];

    for (const token of postfix) {
        if (token.type === "number") {
            stack.push(token.value);
        } else {
            if (stack.length < 2) {
                throw new ValidationError("Invalid expression format");
            }

            const b = stack.pop();
            const a = stack.pop();

            if (a === undefined || b === undefined) {
                throw new ValidationError("Invalid expression format");
            }

            const result = applyOperator(token.value, a, b);
            stack.push(result);
        }
    }

    if (stack.length !== 1) {
        throw new ValidationError("Invalid expression format");
    }

    const result = stack.pop();
    if (result === undefined) {
        throw new ValidationError("Invalid expression format");
    }

    return result;
}

export function validateExpression(expression: string): {
    ok: boolean;
    error?: string;
} {
    if (!expression || typeof expression !== "string") {
        return { ok: false, error: "Expression must be a non-empty string" };
    }

    if (expression.length > 1000) {
        return {
            ok: false,
            error: "Expression too long (max 1000 characters)",
        };
    }

    try {
        const tokens = tokenize(expression);
        validateTokens(tokens);
        return { ok: true };
    } catch (error) {
        if (error instanceof ValidationError) {
            return { ok: false, error: error.message };
        }
        return { ok: false, error: "Invalid expression format" };
    }
}

export function evaluateExpression(expression: string): number {
    const tokens = tokenize(expression);
    validateTokens(tokens);
    const postfix = infixToPostfix(tokens);
    return evaluatePostfix(postfix);
}
