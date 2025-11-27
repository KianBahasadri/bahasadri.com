import { Hono } from "hono";
import { cors } from "hono/cors";
import type { MessageBatch, ExecutionContext } from "@cloudflare/workers-types";
import smsMessengerRoutes from "./sms-messenger";
import whatsappMessengerRoutes from "./whatsapp-messenger";
import calculatorRoutes from "./calculator";
import homeRoutes from "./home";
import videoCallRoutes from "./video-call";
import fileHostingRoutes from "./file-hosting";
import moviesOnDemandRoutes from "./movies-on-demand";
import type { Env } from "./types/env";
import type { JobQueueMessage } from "./movies-on-demand/types";

// Conditionally import container to avoid breaking tests
// The container module requires Cloudflare Workers runtime which isn't available in tests
let containerModule: typeof import("./movies-on-demand/container") | null = null;

try {
    // Only import if not in test environment
    if (typeof process === "undefined" || !process.env.VITEST) {
        containerModule = await import("./movies-on-demand/container");
    }
} catch {
    // Ignore import errors in test environments
    containerModule = null;
}

// Export container class (mocked in tests)
export const MovieDownloaderContainer = containerModule?.MovieDownloaderContainer ?? (class {
    defaultPort = 8080;
    sleepAfter = "20m";
    manualStart = true;
} as unknown as typeof import("./movies-on-demand/container").MovieDownloaderContainer);

// Queue handler (mocked in tests)
const handleMovieQueue = containerModule?.handleMovieQueue ?? (async () => {
    // Mock implementation for tests
});

const app = new Hono();

// CORS middleware
app.use(
    "*",
    cors({
        origin: (origin) => {
            if (!origin) {
                return;
            }
            // Allow production origin or localhost for development
            if (
                origin === "https://bahasadri.com" ||
                origin.startsWith("http://localhost:")
            ) {
                return origin;
            }
            // Default: deny (returning nothing denies the request)
        },
        allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "X-Twilio-Signature"],
        exposeHeaders: ["Content-Length"],
        maxAge: 86_400,
        credentials: true,
    })
);

// API routes
app.route("/api/sms-messenger", smsMessengerRoutes);
app.route("/api/whatsapp-messenger", whatsappMessengerRoutes);
app.route("/api/calculator", calculatorRoutes);
app.route("/api/home", homeRoutes);
app.route("/api/video-call", videoCallRoutes);
app.route("/api/file-hosting", fileHostingRoutes);
app.route("/api/movies-on-demand", moviesOnDemandRoutes);

// Health check
app.get("/", (c) => c.json({ success: true, message: "bahasadri.com API" }));

// Export default with fetch handler, queue consumer, and request method for testing
// Note: MovieDownloaderContainer is already exported above as a const
export default {
    fetch: (request: Request, env?: Env, ctx?: ExecutionContext) => {
        // In test environment, use ENV from globalThis if not provided
        const testEnv = (typeof globalThis !== "undefined" && "ENV" in globalThis)
            ? (globalThis as { ENV: Env }).ENV
            : env;
        return app.fetch(request, testEnv, ctx);
    },
    request: (input: RequestInfo | URL, init?: RequestInit) => {
        // In test environment, inject ENV from globalThis
        // Hono's request method doesn't directly accept env, so we use fetch instead
        if (typeof globalThis !== "undefined" && "ENV" in globalThis) {
            const env = (globalThis as { ENV: Env }).ENV;
            // Convert string paths to full URLs for Request constructor
            const url = typeof input === "string" 
                ? (input.startsWith("http") ? input : `http://localhost${input}`)
                : input;
            const request = input instanceof Request ? input : new Request(url, init);
            return app.fetch(request, env);
        }
        return app.request(input, init);
    },
    async queue(batch: MessageBatch<JobQueueMessage>, env: Env): Promise<void> {
        await handleMovieQueue(batch, env);
    },
};
