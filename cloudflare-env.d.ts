/**
 * Cloudflare Worker environment bindings shared across the SMS Commander tests.
 *
 * Declares the `CloudflareEnv` interface referenced by `wrangler types` and
 * exposes a global `env` symbol so Vitest can seed deterministic bindings for
 * Twilio credentials without reaching for Node-only APIs. The declarations live
 * at the repository root so both application code and tests can reference them.
 *
 * @see ./docs/AI_AGENT_STANDARDS.md - Required documentation for AI agents
 * @see ./docs/DEVELOPMENT.md - Tooling and workflow documentation
 */

declare global {
    /**
     * Identifier for the Twilio-specific bindings we care about during tests.
     */
    type TwilioEnvKey =
        | "TWILIO_ACCOUNT_SID"
        | "TWILIO_AUTH_TOKEN"
        | "TWILIO_PHONE_NUMBER";

    interface CloudflareEnv {
        /** Twilio Account SID credential */
        TWILIO_ACCOUNT_SID: string;
        /** Twilio Auth Token credential */
        TWILIO_AUTH_TOKEN: string;
        /** Default Twilio phone number for outbound messages */
        TWILIO_PHONE_NUMBER: string;
    }

    var env: CloudflareEnv;
}

export {};

