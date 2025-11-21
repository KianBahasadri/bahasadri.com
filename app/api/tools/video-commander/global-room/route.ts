/**
 * Video Commander Global Room API Route
 *
 * Returns the global room ID, creating it if it doesn't exist.
 * This ensures there's always exactly one room that everyone connects to.
 *
 * Endpoint: GET /api/tools/video-commander/global-room
 * Returns: { room_id: string }
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
 * Gets or creates the global room
 *
 * @param config - RealtimeKit configuration
 * @returns Promise resolving to meeting ID
 * @throws {Error} If the API request fails
 */
async function getOrCreateGlobalRoom(
    config: RealtimeKitConfig
): Promise<string> {
    // Check if we have a stored global room ID in environment
    // In production, this would be stored in Cloudflare KV
    const storedRoomId = process.env.CLOUDFLARE_REALTIME_GLOBAL_ROOM_ID;

    if (storedRoomId) {
        return storedRoomId;
    }

    // Create the global room
    // RealtimeKit API uses /realtime/kit/{app_id}/meetings endpoint
    const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/realtime/kit/${config.appId}/meetings`;

    console.log("Creating global room via RealtimeKit API", {
        url,
        accountId: config.accountId,
        appId: config.appId,
    });

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: "Global Video Commander Room",
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("RealtimeKit API error:", {
            status: response.status,
            statusText: response.statusText,
            errorText,
        });
        throw new Error(
            `Failed to create global room: ${response.status} ${response.statusText} - ${errorText}`
        );
    }

    const data = (await response.json()) as RealtimeKitMeetingResponse;

    if (!data.success || !data.data?.id) {
        console.error("Invalid API response structure:", JSON.stringify(data));
        throw new Error(
            `Invalid response from RealtimeKit API - expected data.id, got: ${JSON.stringify(
                data
            )}`
        );
    }

    return data.data.id;
}

/**
 * GET handler for getting the global room ID
 *
 * Creates the room on first call, returns cached ID on subsequent calls.
 *
 * @returns NextResponse with room ID or error
 */
export async function GET(): Promise<
    NextResponse<{ room_id: string } | { error: string }>
> {
    try {
        const config = getRealtimeKitConfig();
        const roomId = await getOrCreateGlobalRoom(config);

        return NextResponse.json({ room_id: roomId }, { status: 200 });
    } catch (error) {
        console.error("Failed to get global room:", error);

        const errorMessage =
            error instanceof Error
                ? error.message
                : "Unknown error occurred while fetching global room";

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
