/**
 * Twilio helper utilities for SMS Commander.
 *
 * Provides helpers for sending SMS messages via Twilio's REST API and validating
 * webhook signatures. Uses Twilio's official SDK, which is compatible with the
 * Cloudflare Workers runtime.
 */

import twilio, { type Twilio } from "twilio";

import { Message, SendSMSRequest } from "./types";
import { appendMessage } from "./messageStore";
import { normalizeSendRequest } from "./validation";

/**
 * Configuration required to interact with Twilio.
 */
export interface TwilioConfig {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
}

/**
 * Read Twilio configuration from environment variables.
 *
 * @throws If any required value is missing
 */
export function getTwilioConfig(): TwilioConfig {
    const accountSid = readEnvValue("TWILIO_ACCOUNT_SID");
    const authToken = readEnvValue("TWILIO_AUTH_TOKEN");
    const phoneNumber = readEnvValue("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !phoneNumber) {
        throw new Error(
            "Where are the Twilio creds, dumbass? Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER or this breaks. I can't believe I have to explain this."
        );
    }

    return { accountSid, authToken, phoneNumber };
}

let cachedClient: Twilio | null = null;

/**
 * Retrieve (and cache) a Twilio SDK client instance.
 */
export function getTwilioClient(): Twilio {
    if (!cachedClient) {
        const config = getTwilioConfig();
        cachedClient = twilio(config.accountSid, config.authToken);
    }

    return cachedClient;
}

/**
 * Reset the cached Twilio client. Intended solely for tests so each suite can
 * assert against fresh mocks without leaking state between cases.
 */
export function resetTwilioClientForTesting(): void {
    cachedClient = null;
}

/**
 * Send an SMS message via Twilio REST API.
 *
 * @param payload - Request payload containing target number and message
 * @returns Message record stored in KV
 */
export async function sendSmsViaTwilio(
    payload: SendSMSRequest
): Promise<Message> {
    const normalized = normalizeSendRequest(payload);
    const config = getTwilioConfig();

    const twilioResponse = await getTwilioClient().messages.create({
        to: normalized.phoneNumber,
        from: config.phoneNumber,
        body: normalized.message,
    });

    const messageRecord: Message = {
        id: twilioResponse.sid ?? crypto.randomUUID(),
        direction: "sent",
        phoneNumber: twilioResponse.to ?? normalized.phoneNumber,
        counterpart: twilioResponse.from ?? config.phoneNumber,
        body: twilioResponse.body ?? normalized.message,
        timestamp: twilioResponse.dateCreated?.getTime?.() ?? Date.now(),
        status: twilioResponse.status === "failed" ? "failed" : "success",
    };

    return appendMessage(messageRecord);
}

/**
 * Build a message record for an incoming webhook payload.
 *
 * @param payload - Map of Twilio webhook values
 * @returns Stored message
 */
export async function storeIncomingMessage(
    payload: Record<string, string>
): Promise<Message> {
    const record: Message = {
        id: payload.MessageSid ?? crypto.randomUUID(),
        direction: "received",
        phoneNumber: payload.From ?? "unknown",
        counterpart: payload.To ?? "unknown",
        body: payload.Body ?? "",
        timestamp: Date.now(),
        status: "success",
    };

    return appendMessage(record);
}

/**
 * Validate the Twilio webhook signature.
 *
 * @param request - Incoming request object
 * @param formData - Parsed form data payload
 * @param authToken - Twilio auth token used as signing secret
 * @returns Boolean indicating if the signature is valid
 */
export async function validateTwilioSignature(
    request: Request,
    formData: FormData,
    authToken: string
): Promise<boolean> {
    const signatureHeader = request.headers.get("x-twilio-signature");
    if (!signatureHeader) {
        return false;
    }

    const url = request.url;
    const sortedEntries = Array.from(formData.entries())
        .filter(
            (entry): entry is [string, string] => typeof entry[1] === "string"
        )
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

    let dataToSign = url;
    for (const [key, value] of sortedEntries) {
        dataToSign += key + value;
    }

    const expectedSignature = await generateHmacSha1(authToken, dataToSign);
    const providedSignature = base64ToUint8Array(signatureHeader);

    return constantTimeCompare(expectedSignature, providedSignature);
}

async function generateHmacSha1(
    secret: string,
    data: string
): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-1" },
        false,
        ["sign"]
    );
    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(data)
    );
    return new Uint8Array(signature);
}

function base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const output = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        output[i] = binary.charCodeAt(i);
    }

    return output;
}

/**
 * Retrieve an environment binding from the Workers `env` object.
 * This ensures development and production use the same code path.
 */
export function readEnvValue(key: TwilioEnvKey): string | undefined {
    if (typeof env !== "undefined" && env?.[key]) {
        return env[key];
    }

    return undefined;
}

function constantTimeCompare(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) {
        return false;
    }

    let diff = 0;
    for (let i = 0; i < a.length; i += 1) {
        diff |= a[i] ^ b[i];
    }

    return diff === 0;
}
