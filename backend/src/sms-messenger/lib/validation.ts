export function validatePhoneNumber(phone: string): {
    ok: boolean;
    error?: string;
} {
    // E.164 format: +[country code][number]
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    if (!e164Regex.test(phone)) {
        return {
            ok: false,
            error: "Phone number must be in E.164 format (e.g., +1234567890)",
        };
    }
    return { ok: true };
}

export function validateMessage(message: string): {
    ok: boolean;
    error?: string;
} {
    if (!message || message.trim().length === 0) {
        return { ok: false, error: "Message cannot be empty" };
    }
    if (message.length > 1600) {
        return { ok: false, error: "Message too long (max 1600 characters)" };
    }
    return { ok: true };
}

export function validateDisplayName(displayName: string): {
    ok: boolean;
    error?: string;
} {
    if (!displayName || displayName.trim().length === 0) {
        return { ok: false, error: "Display name cannot be empty" };
    }
    if (displayName.length > 100) {
        return {
            ok: false,
            error: "Display name too long (max 100 characters)",
        };
    }
    return { ok: true };
}

