/**
 * Validation utilities for SMS Commander.
 *
 * Handles phone number and message body validation for Twilio-compatible SMS
 * messaging. These helpers are shared by API route handlers and client-side
 * components to ensure consistent rules.
 */

import { SendSMSRequest } from "./types";

/** Maximum SMS payload length supported (Twilio allows up to 1600 characters). */
const MAX_MESSAGE_LENGTH = 1600;

/** Basic E.164 validation regex (allows + followed by 8-15 digits). */
const E164_REGEX = /^\+[1-9]\d{7,14}$/;

/**
 * Determine whether a string is a valid E.164 phone number.
 *
 * @param value - Candidate phone number
 * @returns True when the value matches E.164 format
 */
export function isValidPhoneNumber(value: string): boolean {
    return E164_REGEX.test(value.trim());
}

/**
 * Validate an SMS send request body.
 *
 * @param payload - Parsed request body
 * @returns Tuple where first element indicates validity and second contains an error message when invalid
 */
export function validateSendRequest(
    payload: Partial<SendSMSRequest>
): [isValid: boolean, error?: string] {
    if (!payload) {
        return [false, "Missing request body"];
    }

    if (
        typeof payload.phoneNumber !== "string" ||
        payload.phoneNumber.trim().length === 0
    ) {
        return [false, "Phone number is required"];
    }

    const sanitizedPhone = payload.phoneNumber.trim();
    if (!isValidPhoneNumber(sanitizedPhone)) {
        return [
            false,
            "Phone number must be in E.164 format (e.g. +1234567890)",
        ];
    }

    if (
        typeof payload.message !== "string" ||
        payload.message.trim().length === 0
    ) {
        return [false, "Message content is required"];
    }

    const sanitizedMessage = payload.message.trim();
    if (sanitizedMessage.length > MAX_MESSAGE_LENGTH) {
        return [false, `Message exceeds ${MAX_MESSAGE_LENGTH} characters`];
    }

    return [true];
}

/**
 * Sanitize and normalize send request payload.
 *
 * @param payload - Validated request object
 * @returns Normalized payload with trimmed values
 */
export function normalizeSendRequest(payload: SendSMSRequest): SendSMSRequest {
    return {
        phoneNumber: payload.phoneNumber.trim(),
        message: payload.message.trim(),
    };
}

