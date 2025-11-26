/**
 * Test setup for Cloudflare Workers environment
 */

import { beforeEach } from "vitest";
import type {
    KVNamespace,
    R2Bucket,
    D1Database,
} from "@cloudflare/workers-types";
import type { Env } from "../types/env";

declare global {
    var ENV: Env;
}

// Mock Cloudflare Workers environment
beforeEach(() => {
    // Mock environment bindings
    globalThis.ENV = {
        HOME_CONVERSATIONS: {} as KVNamespace,
        SMS_MESSAGES: {} as KVNamespace,
        WHATSAPP_MESSAGES: {} as KVNamespace,
        OPENROUTER_API_KEY: "test-key",
        TWILIO_ACCOUNT_SID: "test-account-sid",
        TWILIO_AUTH_TOKEN: "test-auth-token",
        TWILIO_PHONE_NUMBER: "test-phone-number",
        TWILIO_WHATSAPP_NUMBER: "test-whatsapp-number",
        ELEVENLABS_API_KEY: "test-elevenlabs-key",
        CLOUDFLARE_ACCOUNT_ID: "test-account-id",
        CLOUDFLARE_REALTIME_ORG_ID: "test-org-id",
        CLOUDFLARE_REALTIME_API_TOKEN: "test-api-token",
        file_hosting_prod: {} as R2Bucket,
        FILE_HOSTING_DB: {} as D1Database,
    };
});

