import { Hono } from "hono";
import { cors } from "hono/cors";
import smsMessengerRoutes from "./sms-messenger";

const app = new Hono();

// CORS middleware
app.use(
    "*",
    cors({
        origin: "https://bahasadri.com",
        allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
        allowHeaders: ["Content-Type", "X-Twilio-Signature"],
        exposeHeaders: ["Content-Length"],
        maxAge: 86_400,
        credentials: true,
    })
);

// API routes
app.route("/api/sms-messenger", smsMessengerRoutes);

// Health check
app.get("/", (c) => c.json({ success: true, message: "bahasadri.com API" }));

export default app;
