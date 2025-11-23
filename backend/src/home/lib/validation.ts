export function validateMessage(message: string): {
    ok: boolean;
    error?: string;
} {
    if (!message || typeof message !== "string") {
        return { ok: false, error: "Message is required" };
    }
    if (message.trim().length === 0) {
        return { ok: false, error: "Message cannot be empty" };
    }
    if (message.length > 1000) {
        return { ok: false, error: "Message too long (max 1000 characters)" };
    }
    return { ok: true };
}

export function validateConversationId(conversationId: string): {
    ok: boolean;
    error?: string;
} {
    if (!conversationId || typeof conversationId !== "string") {
        return { ok: false, error: "Conversation ID must be a string" };
    }
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(conversationId)) {
        return {
            ok: false,
            error: "Conversation ID must be a valid UUID format",
        };
    }
    return { ok: true };
}
