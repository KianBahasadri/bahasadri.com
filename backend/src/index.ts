import { Hono } from "hono";
import { cors } from "hono/cors";
import smsMessengerRoutes from "./sms-messenger";
import calculatorRoutes from "./calculator";
import homeRoutes from "./home";
import videoCallRoutes from "./video-call";

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
app.route("/api/calculator", calculatorRoutes);
app.route("/api/home", homeRoutes);
app.route("/api/video-call", videoCallRoutes);

// Health check
app.get("/", (c) => c.json({ success: true, message: "bahasadri.com API" }));

export default app;
