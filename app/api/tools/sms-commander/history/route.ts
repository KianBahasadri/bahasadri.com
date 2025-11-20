/**
 * SMS Commander - Message History API Route
 *
 * Provides a lightweight JSON endpoint for retrieving the current in-memory
 * message history so the client UI can refresh without re-rendering the entire
 * page. This route is read-only and returns messages in reverse chronological
 * order. No authentication is implemented because the utility is intended for
 * personal use; add protection before exposing publicly.
 */

import { NextResponse } from "next/server";

import { getMessages } from "../../../../tools/sms-commander/lib/messageStore";
import { MessageHistoryResponse } from "../../../../tools/sms-commander/lib/types";

/**
 * Handle GET requests for SMS message history.
 */
export async function GET(
    request: Request
): Promise<NextResponse<MessageHistoryResponse>> {
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor") ?? undefined;

    const {
        messages,
        cursor: nextCursor,
        listComplete,
    } = await getMessages({
        cursor,
    });

    return NextResponse.json({
        messages,
        cursor: nextCursor,
        listComplete,
    });
}
