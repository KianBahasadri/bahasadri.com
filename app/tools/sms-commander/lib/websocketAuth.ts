/**
 * SMS Commander WebSocket Authentication Helpers
 *
 * Generates short-lived tokens that authorize WebSocket upgrade requests and
 * validates them inside the route handler. Tokens are signed with an HMAC
 * derived from `SMS_COMMANDER_WS_SECRET` (or the Twilio auth token as a
 * fallback) so the client can prove it originated from a trusted render.
 *
 * @see ../../../../docs/AI_AGENT_STANDARDS.md - Repository standards
 * @see ../PLAN.md - SMS Commander architecture notes
 */

/**
 * Read an environment value from either Node-style `process.env` or Workers `env`.
 * Inlined here to avoid importing from twilio.ts which pulls in the Twilio SDK.
 */
function readEnvValue(key: string): string | undefined {
    if (typeof process !== "undefined" && process.env?.[key]) {
        return process.env[key];
    }

    if (typeof env !== "undefined") {
        const envRecord = env as unknown as Record<string, string | undefined>;
        if (envRecord[key]) {
            return envRecord[key];
        }
    }

    return undefined;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

/**
 * Time-to-live for issued WebSocket tokens (12 hours).
 */
export const WS_TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

/**
 * Token payload sent to the client.
 */
export interface WebsocketAuthPayload {
    /** Unique identifier for the token (used to correlate sessions) */
    nonce: string;
    /** Epoch milliseconds when the token was generated */
    issuedAt: number;
    /** Epoch milliseconds when the token expires */
    expiresAt: number;
}

/**
 * Result returned when generating an auth token.
 */
export interface WebsocketAuthTokenResult {
    token: string;
    payload: WebsocketAuthPayload;
}

/**
 * Result returned when validating an auth token.
 */
export interface WebsocketAuthValidation {
    valid: boolean;
    payload?: WebsocketAuthPayload;
    error?: string;
}

let cachedSecret: string | null | undefined;
let loggedMissingSecret = false;

/**
 * Create a signed WebSocket auth token that expires within a short TTL.
 *
 * @param ttlMs - Optional custom TTL (defaults to 5 minutes)
 */
export async function createWebsocketAuthToken(
    ttlMs: number = WS_TOKEN_TTL_MS
): Promise<WebsocketAuthTokenResult> {
    const secret = await resolveSigningSecret();
    if (!secret) {
        throw new Error(
            "SMS Commander WebSocket secret missing. Set SMS_COMMANDER_WS_SECRET or TWILIO_AUTH_TOKEN."
        );
    }

    const now = Date.now();
    const payload: WebsocketAuthPayload = {
        nonce: crypto.randomUUID(),
        issuedAt: now,
        expiresAt: now + ttlMs,
    };

    const serializedPayload = serializePayload(payload);
    const signature = await sign(serializedPayload, secret);

    return {
        token: `${serializedPayload}.${signature}`,
        payload,
    };
}

/**
 * Validate an incoming WebSocket auth token.
 *
 * @param token - Serialized token from the client
 */
export async function validateWebsocketAuthToken(
    token: string | null
): Promise<WebsocketAuthValidation> {
    if (!token) {
        return { valid: false, error: "Missing authentication token." };
    }

    const [payloadPart, signaturePart] = token.split(".");
    if (!payloadPart || !signaturePart) {
        return { valid: false, error: "Malformed authentication token." };
    }

    let payload: WebsocketAuthPayload;
    try {
        payload = parsePayload(payloadPart);
    } catch (error) {
        return {
            valid: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Invalid authentication payload.",
        };
    }

    if (payload.expiresAt <= Date.now()) {
        return { valid: false, error: "Authentication token expired." };
    }

    const secret = await resolveSigningSecret();
    if (!secret) {
        return { valid: true, payload };
    }

    const expectedSignature = await sign(payloadPart, secret);
    if (!constantTimeEqual(signaturePart, expectedSignature)) {
        return {
            valid: false,
            error: "Authentication token signature mismatch.",
        };
    }

    return { valid: true, payload };
}

/**
 * Resolve the signing secret from environment bindings or cached value.
 */
async function resolveSigningSecret(): Promise<string | null> {
    if (cachedSecret !== undefined) {
        return cachedSecret;
    }

    const commanderSecret =
        process.env.SMS_COMMANDER_WS_SECRET ??
        (typeof env !== "undefined" ? env.SMS_COMMANDER_WS_SECRET : undefined);

    if (commanderSecret) {
        cachedSecret = commanderSecret;
        return cachedSecret;
    }

    const fallback = readEnvValue("TWILIO_AUTH_TOKEN") ?? null;

    if (!fallback && !loggedMissingSecret) {
        console.warn(
            "SMS Commander WebSocket secret missing. Authentication will pass-through until the secret is configured."
        );
        loggedMissingSecret = true;
    }

    cachedSecret = fallback;
    return cachedSecret;
}

/**
 * Serialize a token payload using base64url encoding.
 */
function serializePayload(payload: WebsocketAuthPayload): string {
    const json = JSON.stringify(payload);
    return base64UrlEncode(textEncoder.encode(json));
}

/**
 * Parse a base64url-encoded payload into its JSON representation.
 */
function parsePayload(encoded: string): WebsocketAuthPayload {
    const decodedBytes = base64UrlDecode(encoded);
    const jsonString = textDecoder.decode(decodedBytes);
    const parsed = JSON.parse(jsonString) as Partial<WebsocketAuthPayload>;

    if (
        typeof parsed.nonce !== "string" ||
        typeof parsed.issuedAt !== "number" ||
        typeof parsed.expiresAt !== "number"
    ) {
        throw new Error("Authentication payload missing required fields.");
    }

    return parsed as WebsocketAuthPayload;
}

/**
 * Base64url encode a byte array.
 */
function base64UrlEncode(data: Uint8Array): string {
    let base64: string;
    if (typeof Buffer !== "undefined") {
        base64 = Buffer.from(data).toString("base64");
    } else {
        let binary = "";
        data.forEach((byte) => {
            binary += String.fromCharCode(byte);
        });
        base64 = btoa(binary);
    }

    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

/**
 * Base64url decode into a byte array.
 */
function base64UrlDecode(encoded: string): Uint8Array {
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
        normalized.length + ((4 - (normalized.length % 4)) % 4),
        "="
    );

    if (typeof Buffer !== "undefined") {
        return new Uint8Array(Buffer.from(padded, "base64"));
    }

    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

/**
 * Sign a payload using HMAC-SHA256.
 */
async function sign(payload: string, secret: string): Promise<string> {
    if (globalThis.crypto?.subtle) {
        const key = await crypto.subtle.importKey(
            "raw",
            textEncoder.encode(secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );
        const signature = await crypto.subtle.sign(
            "HMAC",
            key,
            textEncoder.encode(payload)
        );
        return base64UrlEncode(new Uint8Array(signature));
    }

    try {
        const nodeCrypto = await import("crypto");
        const signature = nodeCrypto
            .createHmac("sha256", secret)
            .update(payload)
            .digest();
        return base64UrlEncode(new Uint8Array(signature));
    } catch (e) {
        console.error("Crypto unavailable for signing", e);
        throw new Error("Crypto unavailable");
    }
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i += 1) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

/**
 * Test-only helper to clear memoized state.
 */
export function resetWebsocketAuthCacheForTests(): void {
    cachedSecret = undefined;
    loggedMissingSecret = false;
}
