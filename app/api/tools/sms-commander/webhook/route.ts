/**
 * SMS Commander - Twilio Webhook API Route
 *
 * Receives inbound SMS messages forwarded by Twilio, validates the signature
 * (when credentials are configured), stores the message in memory, and returns
 * a simple TwiML response. This keeps the utility aware of both outbound and
 * inbound messages for the local dashboard.
 */

import { NextResponse } from "next/server";

import {
    storeIncomingMessage,
    validateTwilioSignature,
} from "../../../../tools/sms-commander/lib/twilio";

/**
 * POST handler for the Twilio webhook endpoint.
 *
 * @param request - Incoming webhook request
 * @returns TwiML response acknowledging receipt
 */
export async function POST(request: Request): Promise<Response> {
    const formData = await request.formData();

    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!authToken) {
        return NextResponse.json(
            { error: "Twilio auth token is not configured" },
            { status: 500 }
        );
    }

    const isValid = await validateTwilioSignature(request, formData, authToken);
    if (!isValid) {
        return NextResponse.json(
            { error: "Invalid Twilio signature" },
            { status: 403 }
        );
    }

    const payload: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
        if (typeof value === "string") {
            payload[key] = value;
        }
    }

    await storeIncomingMessage(payload);

    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;

    return new Response(twimlResponse, {
        headers: {
            "Content-Type": "text/xml",
        },
    });
}
