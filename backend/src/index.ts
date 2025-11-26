import { Hono } from "hono";
import { cors } from "hono/cors";
import type { MessageBatch } from "@cloudflare/workers-types";
import smsMessengerRoutes from "./sms-messenger";
import whatsappMessengerRoutes from "./whatsapp-messenger";
import calculatorRoutes from "./calculator";
import homeRoutes from "./home";
import videoCallRoutes from "./video-call";
import fileHostingRoutes from "./file-hosting";
import moviesOnDemandRoutes from "./movies-on-demand";
import {
    MovieDownloaderContainer,
    handleMovieQueue,
} from "./movies-on-demand/container";
import type { Env } from "./types/env";
import type { JobQueueMessage } from "./movies-on-demand/types";

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

// Export the Container class for Cloudflare Containers
export { MovieDownloaderContainer };

// Export default with fetch handler, queue consumer, and request method for testing
export default {
    fetch: app.fetch,
    request: app.request.bind(app), // For test compatibility
    async queue(batch: MessageBatch<JobQueueMessage>, env: Env): Promise<void> {
        await handleMovieQueue(batch, env);
    },
};
