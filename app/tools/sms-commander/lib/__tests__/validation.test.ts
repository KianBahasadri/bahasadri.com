/**
 * SMS Commander validation helpers test suite.
 *
 * Confirms our shared validation logic rejects malformed data before the Twilio
 * SDK ever sees it. These tests run inside the Workers-focused Vitest runner so
 * behavior matches the deployed runtime.
 *
 * @see ../../../../../docs/AI_AGENT_STANDARDS.md - Mandatory documentation
 * @see ../../../../../docs/DEVELOPMENT.md - Development workflow guidance
 */

import { describe, expect, it } from "vitest";

import type { SendSMSRequest } from "../types";
import {
    normalizeSendRequest,
    validateSendRequest,
} from "../validation";

describe("validateSendRequest", () => {
    it("accepts a well-formed payload", () => {
        const payload: SendSMSRequest = {
            phoneNumber: "+15550001111",
            message: "   keep the line open   ",
        };

        const [isValid, error] = validateSendRequest(payload);

        expect(isValid).toBe(true);
        expect(error).toBeUndefined();
    });

    it("rejects invalid phone numbers", () => {
        const [isValid, error] = validateSendRequest({
            phoneNumber: "555-000-1111",
            message: "lol no",
        });

        expect(isValid).toBe(false);
        expect(error).toMatch(/E\.164/i);
    });

    it("rejects overly long messages", () => {
        const [isValid, error] = validateSendRequest({
            phoneNumber: "+15550001111",
            message: "a".repeat(1601),
        });

        expect(isValid).toBe(false);
        expect(error).toContain("1600");
    });

    it("rejects empty message bodies", () => {
        const [isValid, error] = validateSendRequest({
            phoneNumber: "+15550001111",
            message: "   ",
        });

        expect(isValid).toBe(false);
        expect(error).toMatch(/required/i);
    });
});

describe("normalizeSendRequest", () => {
    it("trims whitespace from both fields", () => {
        const normalized = normalizeSendRequest({
            phoneNumber: "   +15550001111 ",
            message: "\nhello there   ",
        });

        expect(normalized).toEqual({
            phoneNumber: "+15550001111",
            message: "hello there",
        });
    });
});

