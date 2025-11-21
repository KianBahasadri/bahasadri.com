/**
 * Video Commander Session API Route
 *
 * Creates new video conference meetings using Cloudflare RealtimeKit.
 *
 * Endpoint: POST /api/tools/video-commander/session
 * Body: { name?: string }
 * Returns: { meeting_id: string }
 *
 * @see [PLAN.md](../../../../tools/video-commander/PLAN.md) - Planning and documentation
 * @see [types.ts](../../../../tools/video-commander/lib/types.ts) - Type definitions
 * @see [docs/ARCHITECTURE.md](../../../../../docs/ARCHITECTURE.md) - System architecture
 * @see [docs/AI_AGENT_STANDARDS.md](../../../../../docs/AI_AGENT_STANDARDS.md) - AI agent standards
 * @see https://developers.cloudflare.com/realtime/llms-full.txt - Cloudflare Realtime API documentation
 */

import { NextResponse } from "next/server";
import type {
    RealtimeKitConfig,
    RealtimeKitMeetingResponse,
} from "../../../../tools/video-commander/lib/types";

/**
 * Request body for creating a meeting
 */
interface CreateMeetingRequest {
    name?: string;
}

/**
 * Gets RealtimeKit configuration from environment variables
 *
 * @returns RealtimeKit configuration
 * @throws {Error} If required environment variables are missing
 */
function getRealtimeKitConfig(): RealtimeKitConfig {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const appId = process.env.CLOUDFLARE_REALTIME_APP_ID;
    const apiToken = process.env.CLOUDFLARE_REALTIME_API_TOKEN;

    if (!accountId || !appId || !apiToken) {
        throw new Error(
            "Missing RealtimeKit configuration. Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_REALTIME_APP_ID, and CLOUDFLARE_REALTIME_API_TOKEN."
        );
    }

    return { accountId, appId, apiToken };
}

/**
 * Creates a new meeting via RealtimeKit API
 *
 * @param config - RealtimeKit configuration
 * @param meetingName - Optional meeting name
 * @returns Promise resolving to meeting ID
 * @throws {Error} If the API request fails
 */
async function createMeeting(
    config: RealtimeKitConfig,
    meetingName?: string
): Promise<string> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/realtime/kit/${config.appId}/meetings`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: meetingName || "Video Commander Meeting",
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Failed to create meeting: ${response.status} ${response.statusText} - ${errorText}`
        );
    }

    const data = (await response.json()) as RealtimeKitMeetingResponse;

    if (!data.success || !data.data?.id) {
        console.error("Invalid API response structure:", JSON.stringify(data));
        throw new Error(
            `Invalid response from RealtimeKit API - expected data.id, got: ${JSON.stringify(data)}`
        );
    }

    return data.data.id;
}

/**
 * POST handler for creating a new video conference meeting
 *
 * @param request - Next.js request object
 * @returns NextResponse with meeting ID or error
 */
export async function POST(
    request: Request
): Promise<NextResponse<{ meeting_id: string } | { error: string }>> {
    try {
        const config = getRealtimeKitConfig();
        const body = (await request.json()) as CreateMeetingRequest;

        const meetingId = await createMeeting(config, body.name);

        return NextResponse.json({ meeting_id: meetingId }, { status: 200 });
    } catch (error) {
        console.error("Failed to create meeting:", error);

        const errorMessage =
            error instanceof Error
                ? error.message
                : "Unknown error occurred while creating meeting";

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
