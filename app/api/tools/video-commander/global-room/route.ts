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
 * Global room ID for Video Commander
 *
 * This is the single room that all users connect to.
 * Create a room via RealtimeKit API and update this constant with the room ID.
 *
 * To create a room:
 * POST https://api.cloudflare.com/client/v4/accounts/{account_id}/realtime/kit/{app_id}/meetings
 * Body: { "title": "Global Video Commander Room" }
 * Response: { "success": true, "data": { "id": "..." } }
 */
const GLOBAL_ROOM_ID = "bbbc5f0e-5acc-47e9-86cb-b7bef293269b";

/**
 * Gets the global room ID
 *
 * @returns Room ID
 * @throws {Error} If room ID is not set (still placeholder)
 */
function getGlobalRoomId(): string {
    if (GLOBAL_ROOM_ID === "REPLACE_WITH_ACTUAL_ROOM_ID") {
        throw new Error(
            "Global room ID not configured. " +
                "Create a room via RealtimeKit API and update GLOBAL_ROOM_ID constant in this file."
        );
    }

    return GLOBAL_ROOM_ID;
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
