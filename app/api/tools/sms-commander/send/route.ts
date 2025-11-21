/**
 * SMS Commander - Send SMS API Route
 *
 * Accepts POST requests with a phone number and message body, validates the
 * payload, sends the SMS via Twilio's REST API, and stores the resulting
 * message in the in-memory store. Responses follow a simple JSON contract so
 * the client UI can consume them easily.
 */

import { NextResponse } from "next/server";

import { sendSmsViaTwilio } from "../../../../tools/sms-commander/lib/twilio";
import {
    SendSMSRequest,
    SendSMSResponse,
} from "../../../../tools/sms-commander/lib/types";
import {
    normalizeSendRequest,
    validateSendRequest,
} from "../../../../tools/sms-commander/lib/validation";
import {
    broadcastMessage,
    broadcastThreads,
} from "../../../../tools/sms-commander/lib/websocket-manager";
import { getThreadSummaries } from "../../../../tools/sms-commander/lib/messageStore";

/**
 * POST handler for sending SMS messages.
 *
 * @param request - Incoming HTTP request
 * @returns JSON payload with send status
 */
export async function POST(
    request: Request
): Promise<NextResponse<SendSMSResponse>> {
    let body: SendSMSRequest | undefined;

    try {
        body = (await request.json()) as SendSMSRequest;
    } catch {
        return NextResponse.json(
            { success: false, error: "Invalid JSON payload" },
            { status: 400 }
        );
    }

    const [isValid, validationError] = validateSendRequest(body);
    if (!isValid) {
        return NextResponse.json(
            { success: false, error: validationError },
            { status: 400 }
        );
    }

    try {
        const message = await sendSmsViaTwilio(normalizeSendRequest(body));

        // Broadcast message update via WebSocket
        broadcastMessage(message, message.phoneNumber);

        // Broadcast thread list update
        try {
            const threads = await getThreadSummaries();
            broadcastThreads(threads);
        } catch {
            // Ignore thread update errors
        }

        return NextResponse.json({ success: true, message }, { status: 200 });
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Failed to send SMS via Twilio";
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 502 }
        );
    }
}
