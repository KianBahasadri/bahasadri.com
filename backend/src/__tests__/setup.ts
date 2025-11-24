/**
 * Test setup for Cloudflare Workers environment
 */

import { beforeEach } from "vitest";
import type { KVNamespace } from "@cloudflare/workers-types";
import type { Env } from "../types/env";

declare global {
    // eslint-disable-next-line no-var
    var ENV: Env;
}

// Mock Cloudflare Workers environment
beforeEach(() => {
    // Mock environment bindings
    globalThis.ENV = {
        HOME_CONVERSATIONS: {} as KVNamespace,
        SMS_MESSAGES: {} as KVNamespace,
        OPENROUTER_API_KEY: "test-key",
        TWILIO_ACCOUNT_SID: "test-account-sid",
        TWILIO_AUTH_TOKEN: "test-auth-token",
        TWILIO_PHONE_NUMBER: "test-phone-number",
    };
});

