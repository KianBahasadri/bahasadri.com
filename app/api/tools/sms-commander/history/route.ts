/**
 * SMS Commander - Message History API Route
 *
 * Provides a lightweight JSON endpoint for retrieving the per-counterpart
 * message history used by the chat UI. Clients must supply a `counterpart`
 * query param (E.164). No authentication is implemented because the utility is
 * intended for personal use; add protection before exposing publicly.
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
    const counterpart = url.searchParams.get("counterpart");
    const cursor = url.searchParams.get("cursor") ?? undefined;

    if (!counterpart) {
        return NextResponse.json(
            {
                counterpart: "",
                messages: [],
                cursor: undefined,
                listComplete: true,
                error: "Provide a counterpart query param in E.164 format.",
            },
            { status: 400 }
        );
    }

    const {
        counterpart: normalizedCounterpart,
        messages,
        cursor: nextCursor,
        listComplete,
    } = await getMessages({
        counterpart,
        cursor,
    });

    return NextResponse.json({
        counterpart: normalizedCounterpart,
        messages,
        cursor: nextCursor,
        listComplete,
    });
}
