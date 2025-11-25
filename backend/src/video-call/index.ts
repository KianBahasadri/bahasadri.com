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
    ListSessionsResponse,
    ListMeetingsResponse,
    ListPresetsResponse,
    DeleteMeetingResponse,
    Session,
    ErrorResponse,
    RealtimeKitConfig,
    RealtimeKitMeetingResponse,
    RealtimeKitTokenResponse,
    RealtimeKitListAllMeetingsResponse,
    RealtimeKitListAllPresetsResponse,
    RealtimeKitListSessionsResponse,
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
        orgId: env.CLOUDFLARE_REALTIME_ORG_ID,
        apiKey:
            (env as { CLOUDFLARE_REALTIME_API_KEY?: string })
                .CLOUDFLARE_REALTIME_API_KEY ?? "",
    };
}

function getRealtimeKitV2Credentials(env: Env): {
    orgId: string;
    apiKey: string;
} {
    const orgId = env.CLOUDFLARE_REALTIME_ORG_ID;
    const apiKey =
        (env as { CLOUDFLARE_REALTIME_API_KEY?: string })
            .CLOUDFLARE_REALTIME_API_KEY ?? "";

    return { orgId, apiKey };
}

async function createRealtimeKitMeeting(
    orgId: string,
    apiKey: string,
    name?: string
): Promise<string> {
    const url = "https://api.realtime.cloudflare.com/v2/meetings";

    const credentials = `${orgId}:${apiKey}`;
    const base64Credentials = btoa(credentials);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Basic ${base64Credentials}`,
            "Content-Type": "application/json",
            Accept: "application/json",
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
    orgId: string,
    apiKey: string,
    meetingId: string,
    request: GenerateTokenRequest
): Promise<string> {
    const url = `https://api.realtime.cloudflare.com/v2/meetings/${meetingId}/participants`;

    const credentials = `${orgId}:${apiKey}`;
    const base64Credentials = btoa(credentials);

    const body: Record<string, unknown> = {
        preset_name: request.preset_name ?? "group_call_participant",
        custom_participant_id:
            request.custom_participant_id ?? crypto.randomUUID(),
    };

    if (request.name) {
        body.name = request.name;
    }

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Basic ${base64Credentials}`,
            "Content-Type": "application/json",
            Accept: "application/json",
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
        const errorDetails = {
            errors: data.errors,
            responseData: data,
            meetingId,
            hasToken: !!data.data?.token,
            hasAuthToken: !!data.data?.auth_token,
        };
        throw new Error(
            `RealtimeKit API error: ${JSON.stringify(
                data.errors
            )}. Details: ${JSON.stringify(errorDetails)}`
        );
    }

    const authToken = data.data.token ?? data.data.auth_token;

    if (!authToken) {
        const errorDetails = {
            responseData: data,
            meetingId,
            participantId: data.data.participant_id,
        };
        throw new Error(
            `RealtimeKit API error: No token in response. Details: ${JSON.stringify(
                errorDetails
            )}`
        );
    }

    return authToken;
}

async function listRealtimeKitMeetings(
    orgId: string,
    apiKey: string,
    status?: "LIVE" | "ENDED"
): Promise<Session[]> {
    const url = new URL("https://api.realtime.cloudflare.com/v2/sessions");

    if (status) {
        url.searchParams.set("status", status);
    }

    const credentials = `${orgId}:${apiKey}`;
    const base64Credentials = btoa(credentials);

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Basic ${base64Credentials}`,
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `RealtimeKit API error: ${String(response.status)} ${errorText}`
        );
    }

    const data = (await response.json()) as RealtimeKitListSessionsResponse;

    if (!data.success) {
        throw new Error(
            `RealtimeKit API error: ${JSON.stringify(data.errors)}`
        );
    }

    const sessionsData = data.data?.sessions ?? [];

    const sessions: Session[] = [];
    for (const session of sessionsData) {
        // Use associated_id (meeting ID) if available, fallback to session.id
        const meetingId = session.associated_id ?? session.id;
        if (meetingId) {
            sessions.push({
                meeting_id: meetingId,
                name: session.meeting_display_name,
                created_at: session.created_at,
                status:
                    session.status === "LIVE" || session.status === "ENDED"
                        ? session.status
                        : undefined,
            });
        }
    }

    return sessions;
}

async function listAllRealtimeKitMeetings(
    orgId: string,
    apiKey: string,
    queryParams?: {
        end_time?: string;
        page_no?: number;
        per_page?: number;
        search?: string;
        start_time?: string;
    }
): Promise<ListMeetingsResponse> {
    const url = new URL("https://api.realtime.cloudflare.com/v2/meetings");

    if (queryParams) {
        if (queryParams.end_time) {
            url.searchParams.set("end_time", queryParams.end_time);
        }
        if (queryParams.page_no !== undefined) {
            url.searchParams.set("page_no", String(queryParams.page_no));
        }
        if (queryParams.per_page !== undefined) {
            url.searchParams.set("per_page", String(queryParams.per_page));
        }
        if (queryParams.search) {
            url.searchParams.set("search", queryParams.search);
        }
        if (queryParams.start_time) {
            url.searchParams.set("start_time", queryParams.start_time);
        }
    }

    const credentials = `${orgId}:${apiKey}`;
    const base64Credentials = btoa(credentials);

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Basic ${base64Credentials}`,
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `RealtimeKit API error: ${String(response.status)} ${errorText}`
        );
    }

    const data = (await response.json()) as RealtimeKitListAllMeetingsResponse;

    if (!data.success) {
        throw new Error(
            `RealtimeKit API error: ${JSON.stringify(data.errors)}`
        );
    }

    const meetings = data.data ?? [];
    const paging = data.paging ?? {
        total_count: meetings.length,
        start_offset: 0,
        end_offset: meetings.length,
    };

    return {
        success: true,
        data: meetings,
        paging,
    };
}

async function listAllRealtimeKitPresets(
    orgId: string,
    apiKey: string,
    queryParams?: {
        page_no?: number;
        per_page?: number;
    }
): Promise<ListPresetsResponse> {
    const url = new URL("https://api.realtime.cloudflare.com/v2/presets");

    if (queryParams) {
        if (queryParams.page_no !== undefined) {
            url.searchParams.set("page_no", String(queryParams.page_no));
        }
        if (queryParams.per_page !== undefined) {
            url.searchParams.set("per_page", String(queryParams.per_page));
        }
    }

    const credentials = `${orgId}:${apiKey}`;
    const base64Credentials = btoa(credentials);

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Basic ${base64Credentials}`,
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `RealtimeKit API error: ${String(response.status)} ${errorText}`
        );
    }

    const data = (await response.json()) as RealtimeKitListAllPresetsResponse;

    if (!data.success) {
        throw new Error(
            `RealtimeKit API error: ${JSON.stringify(data.errors)}`
        );
    }

    const presets = data.data ?? [];
    const paging = data.paging ?? {
        total_count: presets.length,
        start_offset: 0,
        end_offset: presets.length,
    };

    return {
        success: true,
        data: presets,
        paging,
    };
}

async function deleteRealtimeKitMeeting(
    orgId: string,
    apiKey: string,
    meetingId: string
): Promise<void> {
    const url = `https://api.realtime.cloudflare.com/v2/meetings/${meetingId}`;

    const credentials = `${orgId}:${apiKey}`;
    const base64Credentials = btoa(credentials);

    // RealtimeKit doesn't support DELETE, so we set status to INACTIVE instead
    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            Authorization: `Basic ${base64Credentials}`,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            status: "INACTIVE",
        }),
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

    const data = (await response.json()) as RealtimeKitMeetingResponse;

    if (!data.success || !data.data) {
        throw new Error(
            `RealtimeKit API error: ${JSON.stringify(data.errors)}`
        );
    }
}

app.post("/session", async (c) => {
    try {
        const body = (await c.req
            .json<CreateSessionRequest>()
            .catch(() => ({}))) as CreateSessionRequest;

        const config = getRealtimeKitConfig(c.env);

        if (!config.orgId || !config.apiKey) {
            const { response, status } = handleError(
                new Error("RealtimeKit configuration missing"),
                {
                    endpoint: "/api/video-call/session",
                    method: "POST",
                    defaultMessage: "RealtimeKit configuration missing",
                    additionalInfo: {
                        hasOrgId: !!config.orgId,
                        hasApiKey: !!config.apiKey,
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

        const v2Credentials = getRealtimeKitV2Credentials(c.env);
        const meetingId = await createRealtimeKitMeeting(
            v2Credentials.orgId,
            v2Credentials.apiKey,
            body.name
        );

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
    const body = await c.req.json<GenerateTokenRequest>().catch(() => ({}));
    const requestBody = body as GenerateTokenRequest;
    try {
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

        if (!config.orgId || !config.apiKey) {
            const { response, status } = handleError(
                new Error("RealtimeKit configuration missing"),
                {
                    endpoint: "/api/video-call/token",
                    method: "POST",
                    defaultMessage: "RealtimeKit configuration missing",
                    additionalInfo: {
                        hasOrgId: !!config.orgId,
                        hasApiKey: !!config.apiKey,
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

        const v2Credentials = getRealtimeKitV2Credentials(c.env);
        const validatedBody = body as GenerateTokenRequest;
        const authToken = await generateRealtimeKitToken(
            v2Credentials.orgId,
            v2Credentials.apiKey,
            validatedBody.meeting_id,
            validatedBody
        );

        return c.json<GenerateTokenResponse>({ auth_token: authToken }, 200);
    } catch (error) {
        const { response, status } = handleError(error, {
            endpoint: "/api/video-call/token",
            method: "POST",
            additionalInfo: {
                meetingId: requestBody.meeting_id,
                hasName: !!requestBody.name,
                presetName: requestBody.preset_name,
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

app.get("/sessions", async (c) => {
    try {
        const config = getRealtimeKitConfig(c.env);

        if (!config.orgId || !config.apiKey) {
            const { response, status } = handleError(
                new Error("RealtimeKit configuration missing"),
                {
                    endpoint: "/api/video-call/sessions",
                    method: "GET",
                    defaultMessage: "RealtimeKit configuration missing",
                    additionalInfo: {
                        hasOrgId: !!config.orgId,
                        hasApiKey: !!config.apiKey,
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

        const statusQuery = c.req.query("status");
        let status: "LIVE" | "ENDED" | undefined = "LIVE";
        if (statusQuery === "LIVE" || statusQuery === "ENDED") {
            status = statusQuery;
        }

        const v2Credentials = getRealtimeKitV2Credentials(c.env);
        const sessions = await listRealtimeKitMeetings(
            v2Credentials.orgId,
            v2Credentials.apiKey,
            status
        );

        return c.json<ListSessionsResponse>({ sessions }, 200);
    } catch (error) {
        const { response, status } = handleError(error, {
            endpoint: "/api/video-call/sessions",
            method: "GET",
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

app.get("/meetings", async (c) => {
    try {
        const config = getRealtimeKitConfig(c.env);

        if (!config.orgId || !config.apiKey) {
            const { response, status } = handleError(
                new Error("RealtimeKit configuration missing"),
                {
                    endpoint: "/api/video-call/meetings",
                    method: "GET",
                    defaultMessage: "RealtimeKit configuration missing",
                    additionalInfo: {
                        hasOrgId: !!config.orgId,
                        hasApiKey: !!config.apiKey,
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

        const queryParams: {
            end_time?: string;
            page_no?: number;
            per_page?: number;
            search?: string;
            start_time?: string;
        } = {};

        const endTime = c.req.query("end_time");
        if (endTime) {
            queryParams.end_time = endTime;
        }

        const pageNo = c.req.query("page_no");
        if (pageNo) {
            const pageNoNum = Number.parseInt(pageNo, 10);
            if (!Number.isNaN(pageNoNum) && pageNoNum >= 0) {
                queryParams.page_no = pageNoNum;
            }
        }

        const perPage = c.req.query("per_page");
        if (perPage) {
            const perPageNum = Number.parseInt(perPage, 10);
            if (!Number.isNaN(perPageNum) && perPageNum >= 0) {
                queryParams.per_page = perPageNum;
            }
        }

        const search = c.req.query("search");
        if (search) {
            queryParams.search = search;
        }

        const startTime = c.req.query("start_time");
        if (startTime) {
            queryParams.start_time = startTime;
        }

        const v2Credentials = getRealtimeKitV2Credentials(c.env);

        const result = await listAllRealtimeKitMeetings(
            v2Credentials.orgId,
            v2Credentials.apiKey,
            Object.keys(queryParams).length > 0 ? queryParams : undefined
        );

        return c.json<ListMeetingsResponse>(result, 200);
    } catch (error) {
        const { response, status } = handleError(error, {
            endpoint: "/api/video-call/meetings",
            method: "GET",
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

app.get("/presets", async (c) => {
    try {
        const config = getRealtimeKitConfig(c.env);

        if (!config.orgId || !config.apiKey) {
            const { response, status } = handleError(
                new Error("RealtimeKit configuration missing"),
                {
                    endpoint: "/api/video-call/presets",
                    method: "GET",
                    defaultMessage: "RealtimeKit configuration missing",
                    additionalInfo: {
                        hasOrgId: !!config.orgId,
                        hasApiKey: !!config.apiKey,
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

        const queryParams: {
            page_no?: number;
            per_page?: number;
        } = {};

        const pageNo = c.req.query("page_no");
        if (pageNo) {
            const pageNoNum = Number.parseInt(pageNo, 10);
            if (!Number.isNaN(pageNoNum) && pageNoNum >= 0) {
                queryParams.page_no = pageNoNum;
            }
        }

        const perPage = c.req.query("per_page");
        if (perPage) {
            const perPageNum = Number.parseInt(perPage, 10);
            if (!Number.isNaN(perPageNum) && perPageNum >= 0) {
                queryParams.per_page = perPageNum;
            }
        }

        const v2Credentials = getRealtimeKitV2Credentials(c.env);

        const result = await listAllRealtimeKitPresets(
            v2Credentials.orgId,
            v2Credentials.apiKey,
            Object.keys(queryParams).length > 0 ? queryParams : undefined
        );

        return c.json<ListPresetsResponse>(result, 200);
    } catch (error) {
        const { response, status } = handleError(error, {
            endpoint: "/api/video-call/presets",
            method: "GET",
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

app.delete("/meetings/:meeting_id", async (c) => {
    try {
        const meetingId = c.req.param("meeting_id");

        if (!meetingId) {
            const { response, status } = handleError(
                new Error("Missing meeting_id"),
                {
                    endpoint: "/api/video-call/meetings/:meeting_id",
                    method: "DELETE",
                    defaultMessage: "Missing meeting_id",
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

        if (!config.orgId || !config.apiKey) {
            const { response, status } = handleError(
                new Error("RealtimeKit configuration missing"),
                {
                    endpoint: "/api/video-call/meetings/:meeting_id",
                    method: "DELETE",
                    defaultMessage: "RealtimeKit configuration missing",
                    additionalInfo: {
                        hasOrgId: !!config.orgId,
                        hasApiKey: !!config.apiKey,
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

        const v2Credentials = getRealtimeKitV2Credentials(c.env);
        await deleteRealtimeKitMeeting(
            v2Credentials.orgId,
            v2Credentials.apiKey,
            meetingId
        );

        return c.json<DeleteMeetingResponse>({ success: true }, 200);
    } catch (error) {
        const { response, status } = handleError(error, {
            endpoint: "/api/video-call/meetings/:meeting_id",
            method: "DELETE",
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
