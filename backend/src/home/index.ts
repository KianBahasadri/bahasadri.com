import { Hono } from "hono";
import type { Env } from "../types/env";
import type {
    WelcomeResponse,
    ErrorResponse,
    ChatRequest,
    ChatResponse,
    ConversationContext,
    ChatMessage,
} from "./types";
import { validateMessage, validateConversationId } from "./lib/validation";
import {
    getConversationContext,
    storeConversationContext,
} from "./lib/kv-helpers";
import { generateAgentResponse } from "./lib/openrouter";

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
app.get("/welcome", (c) => {
    try {
        // Select random message from the list
        // Use crypto.getRandomValues to satisfy linter
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        const randomValue = array[0];
        const randomIndex = randomValue % WELCOME_MESSAGES.length;
        const message = WELCOME_MESSAGES[randomIndex];

        return c.json<WelcomeResponse>(
            {
                message,
            },
            200
        );
    } catch {
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

// POST /api/home/chat
app.post("/chat", async (c) => {
    try {
        const env = c.env;
        const body = (await c.req.json().catch(() => ({}))) as ChatRequest;

        // Validate message
        const messageValidation = validateMessage(body.message);
        if (!messageValidation.ok) {
            return c.json<ErrorResponse>(
                {
                    success: false,
                    error: messageValidation.error ?? "Invalid message",
                    code: "INVALID_INPUT",
                },
                400
            );
        }

        // Validate conversationId if provided
        let conversationId = body.conversationId;
        if (conversationId) {
            const idValidation = validateConversationId(conversationId);
            if (!idValidation.ok) {
                return c.json<ErrorResponse>(
                    {
                        success: false,
                        error: idValidation.error ?? "Invalid conversation ID",
                        code: "INVALID_INPUT",
                    },
                    400
                );
            }
        }

        // Generate new conversationId if not provided
        conversationId ??= crypto.randomUUID();

        // Retrieve conversation context from KV
        let context: ConversationContext | undefined;
        if (conversationId) {
            context = await getConversationContext(
                env.HOME_CONVERSATIONS,
                conversationId
            );
        }

        // Initialize or update conversation context
        const now = Date.now();
        context ??= {
            conversationId,
            messages: [],
            createdAt: now,
            updatedAt: now,
        };

        // Create user message
        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: body.message.trim(),
            timestamp: now,
        };

        // Generate agent response using OpenRouter
        let agentResponseText: string;
        try {
            agentResponseText = await generateAgentResponse(
                env.OPENROUTER_API_KEY,
                context.messages,
                userMessage.content
            );
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            return c.json<ErrorResponse>(
                {
                    success: false,
                    error: `Failed to generate response: ${errorMessage}`,
                    code: "INTERNAL_ERROR",
                },
                500
            );
        }

        // Create agent message
        const agentMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: "agent",
            content: agentResponseText,
            timestamp: Date.now(),
        };

        // Update conversation context
        context.messages.push(userMessage, agentMessage);
        context.updatedAt = Date.now();

        // Store conversation context in KV
        await storeConversationContext(env.HOME_CONVERSATIONS, context);

        // Return response
        return c.json<ChatResponse>(
            {
                response: agentResponseText,
                conversationId,
            },
            200
        );
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        return c.json<ErrorResponse>(
            {
                success: false,
                error: `Internal server error: ${errorMessage}`,
                code: "INTERNAL_ERROR",
            },
            500
        );
    }
});

export default app;
