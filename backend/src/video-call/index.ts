import { Hono } from "hono";
import type { Env } from "../types/env";
import { validateGenerateTokenRequest, ValidationError } from "./lib/validation";
import type {
    GlobalRoomResponse,
    CreateSessionRequest,
    CreateSessionResponse,
    GenerateTokenRequest,
    GenerateTokenResponse,
    ErrorResponse,
    RealtimeKitConfig,
    RealtimeKitMeetingResponse,
    RealtimeKitTokenResponse,
} from "./types";

const app = new Hono<{ Bindings: Env }>();

function getRealtimeKitConfig(env: Env): RealtimeKitConfig {
    return {
        accountId: env.CLOUDFLARE_ACCOUNT_ID,
        appId: env.CLOUDFLARE_REALTIME_APP_ID,
        apiToken: env.CLOUDFLARE_REALTIME_API_TOKEN,
    };
}

async function createRealtimeKitMeeting(
    config: RealtimeKitConfig,
    name?: string
): Promise<string> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/realtime/meetings`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(name ? { title: name } : {}),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `RealtimeKit API error: ${String(response.status)} ${errorText}`
        );
    }

    const data = (await response.json()) as RealtimeKitMeetingResponse;

    if (!data.success || !data.data) {
        throw new Error(
            `RealtimeKit API error: ${JSON.stringify(data.errors)}`
        );
    }

    return data.data.id;
}

async function generateRealtimeKitToken(
    config: RealtimeKitConfig,
    meetingId: string,
    request: GenerateTokenRequest
): Promise<string> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/realtime/meetings/${meetingId}/tokens`;

    const body: Record<string, unknown> = {};

    if (request.name) {
        body.name = request.name;
    }

    if (request.custom_participant_id) {
        body.custom_participant_id = request.custom_participant_id;
    }

    body.preset_name = request.preset_name ?? "group_call_participant";

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("NOT_FOUND");
        }
        const errorText = await response.text();
        throw new Error(
            `RealtimeKit API error: ${String(response.status)} ${errorText}`
        );
    }

    const data = (await response.json()) as RealtimeKitTokenResponse;

    if (!data.success || !data.data) {
        throw new Error(
            `RealtimeKit API error: ${JSON.stringify(data.errors)}`
        );
    }

    const authToken = data.data.auth_token ?? data.data.token;

    if (!authToken) {
        throw new Error("RealtimeKit API error: No token in response");
    }

    return authToken;
}

app.get("/global-room", (c) => {
    try {
        const roomId = c.env.CLOUDFLARE_REALTIME_GLOBAL_ROOM_ID;

        if (!roomId) {
            return c.json<ErrorResponse>(
                {
                    error: "Global room ID not configured",
                    code: "INTERNAL_ERROR",
                },
                500
            );
        }

        return c.json<GlobalRoomResponse>({ room_id: roomId }, 200);
    } catch {
        return c.json<ErrorResponse>(
            {
                error: "Internal server error",
                code: "INTERNAL_ERROR",
            },
            500
        );
    }
});

app.post("/session", async (c) => {
    try {
        const body = (await c.req
            .json<CreateSessionRequest>()
            .catch(() => ({}))) as CreateSessionRequest;

        const config = getRealtimeKitConfig(c.env);

        if (!config.accountId || !config.appId || !config.apiToken) {
            return c.json<ErrorResponse>(
                {
                    error: "RealtimeKit configuration missing",
                    code: "INTERNAL_ERROR",
                },
                500
            );
        }

        const meetingId = await createRealtimeKitMeeting(
            config,
            body.name
        );

        return c.json<CreateSessionResponse>(
            { meeting_id: meetingId },
            200
        );
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.includes("RealtimeKit")
        ) {
            return c.json<ErrorResponse>(
                {
                    error: "RealtimeKit API error",
                    code: "REALTIMEKIT_ERROR",
                },
                500
            );
        }

        const errorMessage =
            error instanceof Error ? error.message : "Internal server error";

        return c.json<ErrorResponse>(
            {
                error: errorMessage,
                code: "INTERNAL_ERROR",
            },
            500
        );
    }
});

app.post("/token", async (c) => {
    try {
        const body = await c.req.json<GenerateTokenRequest>().catch(() => ({}));

        const validation = validateGenerateTokenRequest(body);
        if (!validation.ok) {
            return c.json<ErrorResponse>(
                {
                    error: validation.error ?? "Invalid request",
                    code: "INVALID_INPUT",
                },
                400
            );
        }

        const config = getRealtimeKitConfig(c.env);

        if (!config.accountId || !config.appId || !config.apiToken) {
            return c.json<ErrorResponse>(
                {
                    error: "RealtimeKit configuration missing",
                    code: "INTERNAL_ERROR",
                },
                500
            );
        }

        const validatedBody = body as GenerateTokenRequest;
        const authToken = await generateRealtimeKitToken(
            config,
            validatedBody.meeting_id,
            validatedBody
        );

        return c.json<GenerateTokenResponse>(
            { auth_token: authToken },
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

        if (error instanceof Error && error.message === "NOT_FOUND") {
            return c.json<ErrorResponse>(
                {
                    error: "Meeting does not exist",
                    code: "NOT_FOUND",
                },
                404
            );
        }

        if (error instanceof Error && error.message.includes("RealtimeKit")) {
            return c.json<ErrorResponse>(
                {
                    error: "RealtimeKit API error",
                    code: "REALTIMEKIT_ERROR",
                },
                500
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

