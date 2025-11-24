import { Hono } from "hono";
import type { Env } from "../types/env";
import {
    validateGenerateTokenRequest,
    ValidationError,
} from "./lib/validation";
import { handleError } from "../lib/error-handling";
import type {
    CreateSessionRequest,
    CreateSessionResponse,
    GenerateTokenRequest,
    GenerateTokenResponse,
    ErrorResponse,
    RealtimeKitConfig,
    RealtimeKitMeetingResponse,
    RealtimeKitTokenResponse,
} from "./types";

type HttpStatusCode = 400 | 404 | 500;
type VideoCallErrorCode =
    | "INVALID_INPUT"
    | "NOT_FOUND"
    | "INTERNAL_ERROR"
    | "REALTIMEKIT_ERROR";

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
    const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/realtime/kit/${config.appId}/meetings`;

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
    const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/realtime/kit/${config.appId}/meetings/${meetingId}/tokens`;

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

app.post("/session", async (c) => {
    try {
        const body = (await c.req
            .json<CreateSessionRequest>()
            .catch(() => ({}))) as CreateSessionRequest;

        const config = getRealtimeKitConfig(c.env);

        if (!config.accountId || !config.appId || !config.apiToken) {
            const { response, status } = handleError(
                new Error("RealtimeKit configuration missing"),
                {
                    endpoint: "/api/video-call/session",
                    method: "POST",
                    defaultMessage: "RealtimeKit configuration missing",
                    additionalInfo: {
                        hasAccountId: !!config.accountId,
                        hasAppId: !!config.appId,
                        hasApiToken: !!config.apiToken,
                    },
                }
            );
            return c.json<ErrorResponse>(
                {
                    error: response.error,
                    code: response.code as VideoCallErrorCode,
                },
                status as HttpStatusCode
            );
        }

        const meetingId = await createRealtimeKitMeeting(config, body.name);

        return c.json<CreateSessionResponse>({ meeting_id: meetingId }, 200);
    } catch (error) {
        const { response, status } = handleError(error, {
            endpoint: "/api/video-call/session",
            method: "POST",
            additionalInfo: {
                hasBody: !!c.req.raw.body,
            },
        });
        return c.json<ErrorResponse>(
            {
                error: response.error,
                code: response.code as VideoCallErrorCode,
            },
            status as HttpStatusCode
        );
    }
});

app.post("/token", async (c) => {
    try {
        const body = await c.req.json<GenerateTokenRequest>().catch(() => ({}));

        const validation = validateGenerateTokenRequest(body);
        if (!validation.ok) {
            const { response, status } = handleError(
                new ValidationError(validation.error ?? "Invalid request"),
                {
                    endpoint: "/api/video-call/token",
                    method: "POST",
                }
            );
            return c.json<ErrorResponse>(
                {
                    error: response.error,
                    code: response.code as VideoCallErrorCode,
                },
                status as HttpStatusCode
            );
        }

        const config = getRealtimeKitConfig(c.env);

        if (!config.accountId || !config.appId || !config.apiToken) {
            const { response, status } = handleError(
                new Error("RealtimeKit configuration missing"),
                {
                    endpoint: "/api/video-call/token",
                    method: "POST",
                    defaultMessage: "RealtimeKit configuration missing",
                    additionalInfo: {
                        hasAccountId: !!config.accountId,
                        hasAppId: !!config.appId,
                        hasApiToken: !!config.apiToken,
                    },
                }
            );
            return c.json<ErrorResponse>(
                {
                    error: response.error,
                    code: response.code as VideoCallErrorCode,
                },
                status as HttpStatusCode
            );
        }

        const validatedBody = body as GenerateTokenRequest;
        const authToken = await generateRealtimeKitToken(
            config,
            validatedBody.meeting_id,
            validatedBody
        );

        return c.json<GenerateTokenResponse>({ auth_token: authToken }, 200);
    } catch (error) {
        const { response, status } = handleError(error, {
            endpoint: "/api/video-call/token",
            method: "POST",
        });
        return c.json<ErrorResponse>(
            {
                error: response.error,
                code: response.code as VideoCallErrorCode,
            },
            status as HttpStatusCode
        );
    }
});

export default app;
