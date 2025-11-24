import type { GenerateTokenRequest } from "../types";

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

export function validateGenerateTokenRequest(
    body: unknown
): { ok: boolean; error?: string } {
    if (!body || typeof body !== "object") {
        return { ok: false, error: "Invalid request body" };
    }

    const request = body as GenerateTokenRequest;

    if (!request.meeting_id || typeof request.meeting_id !== "string") {
        return { ok: false, error: "Missing meeting_id" };
    }

    if (request.name !== undefined && typeof request.name !== "string") {
        return { ok: false, error: "name must be a string" };
    }

    if (
        request.custom_participant_id !== undefined &&
        typeof request.custom_participant_id !== "string"
    ) {
        return { ok: false, error: "custom_participant_id must be a string" };
    }

    if (
        request.preset_name !== undefined &&
        typeof request.preset_name !== "string"
    ) {
        return { ok: false, error: "preset_name must be a string" };
    }

    return { ok: true };
}

