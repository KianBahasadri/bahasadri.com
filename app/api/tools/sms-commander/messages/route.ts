/**
 * SMS Commander - Messages List API Route
 *
 * Endpoint that returns messages for a specific counterpart.
 *
 * @see ../../../../docs/AI_AGENT_STANDARDS.md - Repository standards
 */

import { NextResponse } from "next/server";
import { getMessages } from "../../../../tools/sms-commander/lib/messageStore";

/**
 * GET handler for fetching messages for a counterpart.
 *
 * Query params:
 * - `counterpart`: Phone number to fetch messages for (required)
 * - `cursor`: Pagination cursor (optional)
 * - `limit`: Number of messages to fetch (optional)
 *
 * @param request - Incoming HTTP request
 * @returns JSON payload with messages
 */
export async function GET(request: Request): Promise<NextResponse> {
    try {
        const url = new URL(request.url);
        const counterpart = url.searchParams.get("counterpart");
        const cursor = url.searchParams.get("cursor") ?? undefined;
        const limitParam = url.searchParams.get("limit");
        const limit = limitParam ? parseInt(limitParam, 10) : undefined;

        if (!counterpart) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing 'counterpart' query parameter",
                },
                { status: 400 }
            );
        }

        const result = await getMessages({
            counterpart,
            cursor,
            limit,
        });

        return NextResponse.json(
            {
                success: true,
                messages: result.messages,
                cursor: result.cursor,
                listComplete: result.listComplete,
            },
            { status: 200 }
        );
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch messages";
        console.error("[MESSAGES ERROR]:", error);
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
