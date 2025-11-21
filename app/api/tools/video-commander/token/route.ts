/**
 * Video Commander Token API Route
 *
 * Generates participant authentication tokens for joining meetings.
 * These tokens are required for clients to connect to the RealtimeKit WebRTC session.
 *
 * Endpoint: POST /api/tools/video-commander/token
 * Body: { meeting_id: string, name?: string, preset_name?: string }
 * Returns: { auth_token: string }
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
    RealtimeKitTokenResponse,
    GenerateTokenRequest,
} from "../../../../tools/video-commander/lib/types";

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
 * Generates a participant token via RealtimeKit API
 *
 * @param config - RealtimeKit configuration
 * @param meetingId - Meeting ID to join
 * @param participantName - Optional participant name
 * @param presetName - Optional preset name (default: "group_call_participant")
 * @returns Promise resolving to auth token
 * @throws {Error} If the API request fails
 */
async function generateParticipantToken(
    config: RealtimeKitConfig,
    meetingId: string,
    participantName?: string,
    presetName = "group_call_participant"
): Promise<string> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/realtime/kit/${config.appId}/meetings/${meetingId}/participants`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: participantName || "Participant",
            preset_name: presetName,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Failed to generate token: ${response.status} ${response.statusText} - ${errorText}`
        );
    }

    const data = (await response.json()) as RealtimeKitTokenResponse;

    if (!data.success || !data.data?.auth_token) {
        console.error("Invalid API response structure:", JSON.stringify(data));
        throw new Error(
            `Invalid response from RealtimeKit API - expected data.auth_token, got: ${JSON.stringify(data)}`
        );
    }

    return data.data.auth_token;
}

/**
 * POST handler for generating a participant authentication token
 *
 * @param request - Next.js request object
 * @returns NextResponse with auth token or error
 */
export async function POST(
    request: Request
): Promise<NextResponse<{ auth_token: string } | { error: string }>> {
    try {
        const config = getRealtimeKitConfig();
        const body = (await request.json()) as GenerateTokenRequest;

        if (!body.meeting_id) {
            return NextResponse.json(
                { error: "Missing meeting_id in request body" },
                { status: 400 }
            );
        }

        const authToken = await generateParticipantToken(
            config,
            body.meeting_id,
            body.name,
            body.preset_name
        );

        return NextResponse.json({ auth_token: authToken }, { status: 200 });
    } catch (error) {
        console.error("Failed to generate token:", error);

        const errorMessage =
            error instanceof Error
                ? error.message
                : "Unknown error occurred while generating token";

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
