/**
 * SMS Commander message persistence powered by Cloudflare KV.
 *
 * Stores per-counterpart (phone number) timelines as well as lightweight
 * thread summaries so the UI can render a chat-style interface without
 * client-side gymnastics. Requires the SMS_MESSAGES KV binding to be
 * configured, ensuring development and production use the same code path.
 *
 * @see ../../PLAN.md - Utility design notes
 * @see ../../../../docs/AI_AGENT_STANDARDS.md - Repository standards
 */

import type {
    KVNamespace,
    KVNamespaceListKey,
    KVNamespaceListResult,
} from "@cloudflare/workers-types";

import { getSmsKvNamespace } from "./kv";
import type { Message, ThreadSummary } from "./types";

const MESSAGE_PREFIX = "msg:";
const THREAD_PREFIX = "thread:";
const MAX_TIMESTAMP = 9999999999999;
const DEFAULT_LIMIT = 200;
const MESSAGE_SINCE_LIMIT = 1000;

type MessageListOptions = {
    counterpart: string;
    cursor?: string;
    limit?: number;
};

export interface MessageListResult {
    counterpart: string;
    messages: Message[];
    cursor?: string;
    listComplete: boolean;
}

function normalizeCounterpart(counterpart: string): string {
    return counterpart.trim();
}

function invertTimestamp(timestamp: number): string {
    const clamped = Math.min(timestamp, MAX_TIMESTAMP);
    const inverted = MAX_TIMESTAMP - clamped;
    return inverted.toString().padStart(16, "0");
}

function buildMessageKey(
    counterpart: string,
    timestamp: number,
    id: string
): string {
    return `${MESSAGE_PREFIX}${counterpart}:${invertTimestamp(
        timestamp
    )}:${id}`;
}

/**
 * Build a global timeline key for the message so the newest entries can be
 * retrieved by listing the index prefix.
 */
function buildGlobalMessageKey(timestamp: number, id: string): string {
    return `${MESSAGE_PREFIX}global:${invertTimestamp(timestamp)}:${id}`;
}

function buildThreadKey(counterpart: string): string {
    return `${THREAD_PREFIX}${counterpart}`;
}

async function updateThreadSummary(
    kv: KVNamespace,
    record: Message
): Promise<void> {
    const key = buildThreadKey(record.phoneNumber);
    const existing = (await kv.get(key, "json")) as ThreadSummary | null;

    const summary: ThreadSummary = {
        counterpart: record.phoneNumber,
        lastMessagePreview: record.body.slice(0, 280),
        lastMessageTimestamp: record.timestamp,
        lastDirection: record.direction,
        messageCount: (existing?.messageCount ?? 0) + 1,
    };

    await kv.put(key, JSON.stringify(summary));
}

export async function appendMessage(message: Message): Promise<Message> {
    const normalizedMessage: Message = {
        ...message,
        phoneNumber: normalizeCounterpart(message.phoneNumber),
    };

    const kv = await getSmsKvNamespace();

    const messageKey = buildMessageKey(
        normalizedMessage.phoneNumber,
        normalizedMessage.timestamp,
        normalizedMessage.id
    );
    const globalMessageKey = buildGlobalMessageKey(
        normalizedMessage.timestamp,
        normalizedMessage.id
    );

    await Promise.all([
        kv.put(messageKey, JSON.stringify(normalizedMessage)),
        kv.put(globalMessageKey, JSON.stringify(normalizedMessage)),
        updateThreadSummary(kv, normalizedMessage),
    ]);

    return normalizedMessage;
}

export async function getMessages(
    options: MessageListOptions
): Promise<MessageListResult> {
    const counterpart = normalizeCounterpart(options.counterpart);
    if (!counterpart) {
        throw new Error(
            "Counterpart phone number is required to list messages"
        );
    }

    const kv = await getSmsKvNamespace();

    const list = await kv.list({
        prefix: `${MESSAGE_PREFIX}${counterpart}:`,
        limit: options.limit ?? DEFAULT_LIMIT,
        cursor: options.cursor,
    });

    const messages = await Promise.all(
        list.keys.map(async (entry: KVNamespaceListKey<unknown>) => {
            const result = await kv.get(entry.name, "json");
            return result as Message | null;
        })
    );

    const normalizedMessages = messages
        .filter((record): record is Message => record !== null)
        .sort((a, b) => a.timestamp - b.timestamp);

    return {
        counterpart,
        messages: normalizedMessages,
        cursor: list.list_complete ? undefined : list.cursor,
        listComplete: list.list_complete,
    };
}

/**
 * Retrieve all messages newer than the given timestamp from the global index.
 * Uses cursor-based pagination to handle any number of messages efficiently,
 * stopping early when messages older than or equal to 'since' are encountered.
 * This optimizes for polling scenarios where 'since' is recent, typically
 * requiring only a small number of KV operations.
 *
 * @param since - Unix timestamp (ms) to filter messages after
 * @returns Array of messages sorted ascending by timestamp
 */
export async function getMessagesSince(since: number): Promise<Message[]> {
    const kv = await getSmsKvNamespace();
    const PAGE_LIMIT = 200; // Balanced page size for efficiency
    let cursor: string | undefined = undefined;
    const allMessages: Message[] = [];

    do {
        const list: KVNamespaceListResult<unknown> = await kv.list({
            prefix: `${MESSAGE_PREFIX}global:`,
            limit: PAGE_LIMIT,
            cursor,
        });

        const pageMessages = await Promise.all(
            list.keys.map(async (entry: KVNamespaceListKey<unknown>) => {
                const record = await kv.get(entry.name, "json");
                return record as Message | null;
            })
        );

        let hasOlder = false;
        for (const msg of pageMessages) {
            if (msg && msg.timestamp > since) {
                allMessages.push(msg);
            } else if (msg) {
                hasOlder = true;
                break; // Stop processing this page
            }
        }

        cursor = list.list_complete ? undefined : list.cursor;
        if (hasOlder || list.list_complete) {
            break;
        }
    } while (cursor);

    // Sort ascending by timestamp to match expected order
    return allMessages.sort((a, b) => a.timestamp - b.timestamp);
}

export async function getThreadSummaries(): Promise<ThreadSummary[]> {
    const kv = await getSmsKvNamespace();

    const list = await kv.list({
        prefix: THREAD_PREFIX,
        limit: 1000,
    });

    const threads = await Promise.all(
        list.keys.map(async (entry) => {
            const summary = (await kv.get(
                entry.name,
                "json"
            )) as ThreadSummary | null;
            return summary;
        })
    );

    return threads
        .filter((summary): summary is ThreadSummary => summary !== null)
        .sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
}
