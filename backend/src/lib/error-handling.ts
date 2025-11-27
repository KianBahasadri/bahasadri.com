/**
 * Shared error handling utilities for consistent error responses and logging
 */

import type { Context } from "hono";

export interface ErrorResponse {
    error: string;
    code: string;
}

export type ErrorCode =
    | "INVALID_INPUT"
    | "NOT_FOUND"
    | "INTERNAL_ERROR"
    | "REALTIMEKIT_ERROR"
    | "DIVISION_BY_ZERO"
    | "FORBIDDEN";

type HttpStatusCode = 400 | 404 | 500 | 502;

/**
 * Check if an error is a ValidationError
 */
function isValidationError(error: unknown): boolean {
    return (
        error instanceof Error &&
        (error.name === "ValidationError" ||
            error.constructor.name === "ValidationError" ||
            error.message.includes("ValidationError"))
    );
}

/**
 * Check if an error is a DivisionByZeroError
 */
function isDivisionByZeroError(error: unknown): boolean {
    return (
        error instanceof Error &&
        (error.name === "DivisionByZeroError" ||
            error.constructor.name === "DivisionByZeroError" ||
            error.message.includes("Division by zero"))
    );
}

/**
 * Logs an error with context information
 */
function logError(
    error: unknown,
    context: {
        endpoint: string;
        method: string;
        additionalInfo?: Record<string, unknown>;
    }
): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    const logData = {
        timestamp: new Date().toISOString(),
        endpoint: context.endpoint,
        method: context.method,
        error: errorMessage,
        ...(errorStack && { stack: errorStack }),
        ...context.additionalInfo,
    };

    // Use console.error for structured logging in Cloudflare Workers
    // This will appear in Wrangler logs and Cloudflare dashboard
    console.error(JSON.stringify(logData));
}

/**
 * Creates a standardized error response with logging
 */
export function handleError(
    error: unknown,
    context: {
        endpoint: string;
        method: string;
        defaultMessage?: string;
        additionalInfo?: Record<string, unknown>;
    }
): { response: ErrorResponse; status: number } {
    // Log the error for debugging
    logError(error, {
        endpoint: context.endpoint,
        method: context.method,
        additionalInfo: context.additionalInfo,
    });

    // Extract error message
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Determine error code and status based on error type/message
    let code: ErrorCode = "INTERNAL_ERROR";
    let status: HttpStatusCode = 500;
    let userMessage = context.defaultMessage ?? "Internal server error";

    // Handle specific error types
    if (isValidationError(error)) {
        code = "INVALID_INPUT";
        status = 400;
        // For validation errors, use the actual error message if it's safe
        if (errorMessage.length < 200) {
            userMessage = errorMessage.replace("ValidationError: ", "");
        }
    } else if (isDivisionByZeroError(error)) {
        code = "DIVISION_BY_ZERO";
        status = 400;
        userMessage = "Division by zero";
    } else if (errorMessage.includes("RealtimeKit")) {
        code = "REALTIMEKIT_ERROR";
        userMessage = errorMessage.includes("does not support")
            ? errorMessage
            : "RealtimeKit API error";
    } else if (errorMessage === "NOT_FOUND") {
        code = "NOT_FOUND";
        status = 404;
        userMessage = "Meeting does not exist";
    } else if (errorMessage.startsWith("Twilio API error")) {
        status = 502;
        userMessage = context.defaultMessage ?? "External service error";
    }

    return {
        response: {
            error: userMessage,
            code,
        },
        status,
    };
}

/**
 * Wraps an async route handler with consistent error handling
 * Note: Uses `any` for Context types to work with Hono's complex type system
 */
export function withErrorHandling(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: (c: Context<any, any, any>) => Promise<Response> | Response,
    endpoint: string,
    method: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): (c: Context<any, any, any>) => Promise<Response> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async (c: Context<any, any, any>): Promise<Response> => {
        try {
            return await handler(c);
        } catch (error) {
            const { response, status } = handleError(error, {
                endpoint,
                method,
            });
            return Response.json(response, {
                status: status as HttpStatusCode,
            });
        }
    };
}
