import type { KVNamespace } from "@cloudflare/workers-types";
import type { ConversationContext } from "../types";

const CONVERSATION_PREFIX = "conversation:";
const TTL_SECONDS = 3600; // 1 hour

export function getConversationKey(conversationId: string): string {
    return `${CONVERSATION_PREFIX}${conversationId}`;
}

export async function getConversationContext(
    kv: KVNamespace,
    conversationId: string
): Promise<ConversationContext | undefined> {
    const key = getConversationKey(conversationId);
    const value = await kv.get(key);

    if (!value) {
        return undefined;
    }

    try {
        return JSON.parse(value) as ConversationContext;
    } catch {
        return undefined;
    }
}

export async function storeConversationContext(
    kv: KVNamespace,
    context: ConversationContext
): Promise<void> {
    const key = getConversationKey(context.conversationId);
    await kv.put(key, JSON.stringify(context), {
        expirationTtl: TTL_SECONDS,
    });
}
