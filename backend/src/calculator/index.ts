import { Hono } from "hono";
import type { Env } from "../types/env";
import {
    validateExpression,
    evaluateExpression,
} from "./lib/validation";
import { handleError } from "../lib/error-handling";
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
        const { response, status } = handleError(error, {
            endpoint: "/api/calculator/calculate",
            method: "POST",
            additionalInfo: {
                hasBody: !!c.req.raw.body,
            },
        });
        return c.json<ErrorResponse>(response, status as 400 | 404 | 500);
    }
});

export default app;

