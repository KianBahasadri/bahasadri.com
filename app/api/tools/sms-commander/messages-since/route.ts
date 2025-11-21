/**
 * SMS Commander - Messages Since API Route
 *
 * Polling endpoint that returns new messages since a given timestamp.
 * Used by the client for real-time updates without WebSocket complexity.
 *
 * @see ../../../../docs/AI_AGENT_STANDARDS.md - Repository standards
 */

import { NextResponse } from "next/server";
import {
    getMessagesSince,
    getThreadSummaries,
} from "../../../../tools/sms-commander/lib/messageStore";

/**
 * GET handler for fetching new messages since a timestamp.
 *
 * Query params:
 * - `since`: Unix timestamp (milliseconds) to fetch messages after
 *
 * @param request - Incoming HTTP request
 * @returns JSON payload with new messages and threads
 */
export async function GET(request: Request): Promise<NextResponse> {
    try {
        const url = new URL(request.url);
        const sinceParam = url.searchParams.get("since");

        if (!sinceParam) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing 'since' query parameter",
                },
                { status: 400 }
            );
        }

        const since = parseInt(sinceParam, 10);
        if (isNaN(since)) {
            return NextResponse.json(
                { success: false, error: "Invalid 'since' timestamp" },
                { status: 400 }
            );
        }

        // Fetch new messages since the given timestamp
        const messages = await getMessagesSince(since);

        // Also fetch updated thread summaries for UI refresh
        const threads = await getThreadSummaries();

        return NextResponse.json(
            {
                success: true,
                messages,
                threads,
                timestamp: Date.now(),
            },
            { status: 200 }
        );
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch messages";
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

