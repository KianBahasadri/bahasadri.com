/**
 * SMS Commander message persistence powered by Cloudflare KV.
 *
 * When the `SMS_MESSAGES` KV binding is available (production + wrangler dev),
 * messages are persisted durably. During local `next dev` sessions without
 * wrangler, the module falls back to the legacy in-memory store.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

import { Message } from "./types";

const MESSAGE_PREFIX = "messages:";
const MAX_TIMESTAMP = 9999999999999;
const DEFAULT_LIMIT = 50;
const FALLBACK_MAX_MESSAGES = 200;

const fallbackMessages: Message[] = [];
let loggedKvWarning = false;

type MessageListOptions = {
    cursor?: string;
    limit?: number;
};

export interface MessageListResult {
    messages: Message[];
    cursor?: string;
    listComplete: boolean;
}

function invertTimestamp(timestamp: number): string {
    const inverted = MAX_TIMESTAMP - Math.min(timestamp, MAX_TIMESTAMP);
    return inverted.toString().padStart(16, "0");
}

function buildKey(timestamp: number, id: string): string {
    return `${MESSAGE_PREFIX}${invertTimestamp(timestamp)}:${id}`;
}

async function getKvNamespace(): Promise<KVNamespace | null> {
    try {
        const { env } = await getCloudflareContext({ async: true });
        const kv = (env as unknown as CloudflareEnv | undefined)?.SMS_MESSAGES;

        if (!kv) {
            throw new Error("SMS_MESSAGES binding missing");
        }

        return kv;
    } catch (error) {
        if (!loggedKvWarning) {
            console.warn(
                "SMS Commander: SMS_MESSAGES KV binding unavailable. Falling back to in-memory storage.",
                error instanceof Error ? error.message : error
            );
            loggedKvWarning = true;
        }

        return null;
    }
}

function appendFallbackMessage(message: Message): void {
    fallbackMessages.unshift(message);

    if (fallbackMessages.length > FALLBACK_MAX_MESSAGES) {
        fallbackMessages.length = FALLBACK_MAX_MESSAGES;
    }
}

export async function appendMessage(message: Message): Promise<Message> {
    const kv = await getKvNamespace();

    if (!kv) {
        appendFallbackMessage(message);
        return message;
    }

    const key = buildKey(message.timestamp, message.id);
    await kv.put(key, JSON.stringify(message));

    return message;
}

export async function getMessages(
    options: MessageListOptions = {}
): Promise<MessageListResult> {
    const kv = await getKvNamespace();

    if (!kv) {
        return {
            messages: [...fallbackMessages],
            listComplete: true,
        };
    }

    const list = await kv.list({
        prefix: MESSAGE_PREFIX,
        limit: options.limit ?? DEFAULT_LIMIT,
        cursor: options.cursor,
    });

    const messages = await Promise.all(
        list.keys.map(async (entry) => {
            const result = await kv.get(entry.name, "json");
            return result as Message | null;
        })
    );

    return {
        messages: messages.filter(
            (message): message is Message => message !== null
        ),
        cursor: list.list_complete ? undefined : list.cursor,
        listComplete: list.list_complete,
    };
}
