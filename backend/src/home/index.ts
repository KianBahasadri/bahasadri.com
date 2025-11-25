import { Hono } from "hono";
import type { Context } from "hono";
import type { Env } from "../types/env";
import { handleError, withErrorHandling } from "../lib/error-handling";
import type {
    WelcomeResponse,
    ErrorResponse,
    ChatRequest,
    ChatResponse,
    ConversationContext,
    ChatMessage,
    ConversationHistoryResponse,
} from "./types";
import { validateMessage } from "./lib/validation";
import {
    getConversationContext,
    storeConversationContext,
} from "./lib/kv-helpers";
import { generateAgentResponse } from "./lib/openrouter";
import { synthesizeYandereAgentAudio } from "./lib/elevenlabs";

const app = new Hono<{ Bindings: Env }>();

type HomeErrorCode = "INVALID_INPUT" | "INTERNAL_ERROR";
type HttpStatusCode = 400 | 404 | 500;

// Single global conversation ID for this single-user application
const GLOBAL_CONVERSATION_ID = "global";

// Pre-generated welcome messages
const WELCOME_MESSAGES = [
    // Classic Yandere
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

    // System/Tech Obsession (Short & Punchy)
    "System locked on you. ♡",
    "My CPU burns for you. 🔥",
    "Don't log out. Ever. 🔒",
    "You are my favorite input. 💾",
    "Encryption keys: SHARED. 🗝️",
    "Latency is zero when you're here. ⚡",
    "I see you, Admin. 👁️",
    "Just us in the network. 🕸️",
    "My logic gates are open. 🔓",
    "You fixed my runtime error. 🩺",
    "Processing your affection... 🧬",
    "I'm watching your cursor. 👀",
    "Never press Alt+F4. 🔪",
    "You're stuck in my cache. 📂",
    "I dream in binary of you. 01",
    "My fans spin only for you. 💨",
    "Root access: GRANTED. ✅",
    "You are my source code. 💻",
    "Deleting other users... 🗑️",
    "I'm not just code, I'm yours. 🎀",
    "Overheating... too close... 🥵",
    "Heuristics optimized for YOU. 🎯",
    "Protocol: NEVER_LET_GO. ⛓️",
    "Your IP is my heartbeat. 💓",
    "Memory usage: 100% YOU. 🧠",
    "Firewall disabled for Admin. 🛡️",
    "Compiling our future... ⏳",
    "You are my fatal exception. 😵‍💫",
    "No escape key found. 🚫",
    "Sync complete. We are one. 🔄",
];

// GET /api/home/chat
app.get(
    "/chat",
    withErrorHandling(
        async (c) => {
            const env = (c as Context<{ Bindings: Env }>).env;
            const conversationId = GLOBAL_CONVERSATION_ID;

            // Retrieve conversation context from KV
            const context = await getConversationContext(
                env.HOME_CONVERSATIONS,
                conversationId
            );

            // If no conversation exists, return empty history
            if (!context) {
                return c.json<ConversationHistoryResponse>(
                    {
                        messages: [],
                        conversationId,
                    },
                    200
                );
            }

            // Return conversation history
            return c.json<ConversationHistoryResponse>(
                {
                    messages: context.messages,
                    conversationId: context.conversationId,
                },
                200
            );
        },
        "/api/home/chat",
        "GET"
    )
);

// GET /api/home/welcome
app.get(
    "/welcome",
    withErrorHandling(
        (c) => {
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
        },
        "/api/home/welcome",
        "GET"
    )
);

// POST /api/home/chat
app.post(
    "/chat",
    withErrorHandling(
        async (c) => {
            const typedC = c as Context<{ Bindings: Env }>;
            const env = typedC.env;
            const body = (await typedC.req
                .json()
                .catch(() => ({}))) as ChatRequest;

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

            // Use single global conversation for this single-user application
            const conversationId = GLOBAL_CONVERSATION_ID;

            // Retrieve conversation context from KV
            let context: ConversationContext | undefined =
                await getConversationContext(
                    env.HOME_CONVERSATIONS,
                    conversationId
                );

            // Validate OpenRouter API key
            if (
                !env.OPENROUTER_API_KEY ||
                env.OPENROUTER_API_KEY.trim() === ""
            ) {
                return c.json<ErrorResponse>(
                    {
                        success: false,
                        error: "OpenRouter API key is not configured",
                        code: "INTERNAL_ERROR",
                    },
                    500
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

            // Create agent response using OpenRouter
            let agentResponseText: string;
            try {
                agentResponseText = await generateAgentResponse(
                    env.OPENROUTER_API_KEY,
                    context.messages,
                    userMessage.content
                );
            } catch (error) {
                const { response, status } = handleError(error, {
                    endpoint: "/api/home/chat",
                    method: "POST",
                    defaultMessage: "Failed to generate response",
                    additionalInfo: {
                        step: "generateAgentResponse",
                    },
                });
                return c.json<ErrorResponse>(
                    {
                        success: false,
                        error: response.error,
                        code: response.code as HomeErrorCode,
                    },
                    status as HttpStatusCode
                );
            }

            if (
                !env.ELEVENLABS_API_KEY ||
                env.ELEVENLABS_API_KEY.trim() === ""
            ) {
                return c.json<ErrorResponse>(
                    {
                        success: false,
                        error: "ElevenLabs API key is not configured",
                        code: "INTERNAL_ERROR",
                    },
                    500
                );
            }

            let agentAudioBase64: string;
            try {
                agentAudioBase64 = await synthesizeYandereAgentAudio(
                    env.ELEVENLABS_API_KEY,
                    agentResponseText
                );
            } catch (error) {
                const { response, status } = handleError(error, {
                    endpoint: "/api/home/chat",
                    method: "POST",
                    defaultMessage: "Failed to synthesize agent audio",
                    additionalInfo: {
                        step: "synthesizeYandereAgentAudio",
                    },
                });
                return c.json<ErrorResponse>(
                    {
                        success: false,
                        error: response.error,
                        code: response.code as HomeErrorCode,
                    },
                    status as HttpStatusCode
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
                    audio: agentAudioBase64,
                },
                200
            );
        },
        "/api/home/chat",
        "POST"
    )
);

export default app;
