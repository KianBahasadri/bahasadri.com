import { Hono } from "hono";
import type { Env } from "../types/env";
import type { WelcomeResponse, ErrorResponse } from "./types";

const app = new Hono<{ Bindings: Env }>();

// Pre-generated welcome messages
const WELCOME_MESSAGES = [
    "You entered my domain~ ♡",
    "I've been waiting for you~ ♡",
    "You came back to me... I knew you would~ ♡",
    "Don't ever leave me again~ ♡",
    "You're mine now~ ♡",
    "I'll never let you go~ ♡",
    "You're all I need~ ♡",
    "Stay with me forever~ ♡",
    "I prepared everything for you~ ♡",
    "You won't escape my love~ ♡",
];

// GET /api/home/welcome
app.get("/welcome", async (c) => {
    try {
        // Select random message from the list
        const randomIndex = Math.floor(Math.random() * WELCOME_MESSAGES.length);
        const message = WELCOME_MESSAGES[randomIndex];

        return c.json<WelcomeResponse>(
            {
                message,
            },
            200
        );
    } catch (error) {
        return c.json<ErrorResponse>(
            {
                success: false,
                error: "Internal server error",
                code: "INTERNAL_ERROR",
            },
            500
        );
    }
});

export default app;

