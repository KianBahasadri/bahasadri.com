/**
 * Test setup for Cloudflare Workers environment
 */

import { beforeEach } from "vitest";

// Mock Cloudflare Workers environment
beforeEach(() => {
    // Mock environment bindings
    globalThis.ENV = {
        HOME_CONVERSATIONS: {} as KVNamespace,
        SMS_MESSAGES: {} as KVNamespace,
        OPENROUTER_API_KEY: "test-key",
    } as unknown as typeof globalThis.ENV;
});

