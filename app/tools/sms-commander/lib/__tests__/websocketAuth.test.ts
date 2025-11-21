/**
 * Unit tests for the WebSocket authentication helpers.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    createWebsocketAuthToken,
    resetWebsocketAuthCacheForTests,
    validateWebsocketAuthToken,
} from "../websocketAuth";

describe("websocketAuth", () => {
    beforeEach(() => {
        resetWebsocketAuthCacheForTests();
        vi.useRealTimers();
    });

    it("generates tokens that validate successfully", async () => {
        const { token, payload } = await createWebsocketAuthToken();
        const validation = await validateWebsocketAuthToken(token);

        expect(validation.valid).toBe(true);
        expect(validation.payload).toMatchObject({
            nonce: payload.nonce,
            issuedAt: payload.issuedAt,
            expiresAt: payload.expiresAt,
        });
    });

    it("rejects expired tokens", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));

        const { token } = await createWebsocketAuthToken(100);

        vi.setSystemTime(new Date("2025-01-01T00:00:01.000Z"));
        const validation = await validateWebsocketAuthToken(token);

        expect(validation.valid).toBe(false);
        expect(validation.error).toMatch(/expired/i);

        vi.useRealTimers();
    });

    it("rejects tampered tokens", async () => {
        const { token } = await createWebsocketAuthToken();
        const tampered = `${token.slice(0, -1)}x`;
        const validation = await validateWebsocketAuthToken(tampered);

        expect(validation.valid).toBe(false);
        expect(validation.error).toMatch(/signature/i);
    });

    it("respects custom TTL overrides", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(Date.now());

        const shortTtl = 250;
        const { token } = await createWebsocketAuthToken(shortTtl);
        const validation = await validateWebsocketAuthToken(token);
        expect(validation.valid).toBe(true);

        vi.advanceTimersByTime(shortTtl + 1);
        const expired = await validateWebsocketAuthToken(token);
        expect(expired.valid).toBe(false);

        vi.useRealTimers();
    });
});

