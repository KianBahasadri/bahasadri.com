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
console.log("[POLL MODULE] messages-since module loaded");

export async function GET(request: Request): Promise<NextResponse> {
    console.log("[POLL] Request received:", request.url);

    try {
        console.log("[POLL] Attempting to parse query params");
        const url = new URL(request.url);
        const sinceParam = url.searchParams.get("since");
        const includeAllParam = url.searchParams.get("includeAll");

        console.log("[POLL] Parsed since param:", sinceParam);

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

        const includeAll = includeAllParam === "true";
        const isFullFetch = includeAll || since <= 0;

        console.log("[POLL] Calling getMessagesSince with:", since);
        const messages = await getMessagesSince(since);
        console.log("[POLL] Messages fetched:", messages.length);

        if (isFullFetch && messages.length > 0) {
            const sanitized = messages.map((message) => ({
                id: message.id,
                direction: message.direction,
                timestamp: message.timestamp,
                status: message.status,
                bodyLength: message.body.length,
            }));
            console.log(
                "[POLL] Full fetch sanitized payload:",
                { since, includeAll, count: messages.length },
                sanitized
            );
        }

        console.log("[POLL] Fetching thread summaries");
        const threads = await getThreadSummaries();
        console.log("[POLL] Threads fetched:", threads.length);

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
        console.error("[POLL ERROR]:", error);
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
