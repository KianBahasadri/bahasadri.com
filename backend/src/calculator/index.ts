import { Hono } from "hono";
import type { Env } from "../types/env";
import {
    validateExpression,
    evaluateExpression,
    ValidationError,
    DivisionByZeroError,
} from "./lib/validation";
import type { CalculateRequest, CalculateResponse, ErrorResponse } from "./types";

const app = new Hono<{ Bindings: Env }>();

// POST /api/calculator/calculate
app.post("/calculate", async (c) => {
    try {
        const body = await c.req.json<CalculateRequest>();

        // Validate expression format
        const validation = validateExpression(body.expression);
        if (!validation.ok) {
            return c.json<ErrorResponse>(
                {
                    error: validation.error ?? "Invalid expression format",
                    code: "INVALID_INPUT",
                },
                400
            );
        }

        // Evaluate expression
        const result = evaluateExpression(body.expression);

        return c.json<CalculateResponse>(
            {
                result,
                expression: body.expression,
            },
            200
        );
    } catch (error) {
        if (error instanceof ValidationError) {
            return c.json<ErrorResponse>(
                {
                    error: error.message,
                    code: "INVALID_INPUT",
                },
                400
            );
        }
        if (error instanceof DivisionByZeroError) {
            return c.json<ErrorResponse>(
                {
                    error: "Division by zero",
                    code: "DIVISION_BY_ZERO",
                },
                400
            );
        }
        return c.json<ErrorResponse>(
            {
                error: "Internal server error",
                code: "INTERNAL_ERROR",
            },
            500
        );
    }
});

export default app;

