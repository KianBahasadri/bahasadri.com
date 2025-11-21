/**
 * Video Commander Global Room API Route
 *
 * Returns the hard-coded global room ID.
 * This is the single room that all users connect to.
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

/**
 * Gets the global room ID from environment variable
 *
 * CLOUDFLARE_REALTIME_GLOBAL_ROOM_ID must be set in all environments.
 * Configure it in your .env file for local development.
 *
 * @returns Room ID
 * @throws {Error} If room ID is not configured
 */
function getGlobalRoomId(): string {
    const envRoomId = process.env.CLOUDFLARE_REALTIME_GLOBAL_ROOM_ID;
    if (envRoomId) {
        return envRoomId;
    }

    throw new Error(
        "Global room ID not configured. " +
            "Set CLOUDFLARE_REALTIME_GLOBAL_ROOM_ID environment variable. " +
            "Create a room via RealtimeKit API if needed."
    );
}

/**
 * GET handler for getting the global room ID
 *
 * Returns the hard-coded global room ID.
 *
 * @returns NextResponse with room ID or error
 */
export async function GET(): Promise<
    NextResponse<{ room_id: string } | { error: string }>
> {
    try {
        const roomId = getGlobalRoomId();
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
