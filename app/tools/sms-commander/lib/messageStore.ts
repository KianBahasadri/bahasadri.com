/**
 * SMS Commander message persistence powered by Cloudflare KV.
 *
 * The new schema stores per-counterpart (phone number) timelines as well as
 * lightweight thread summaries so the UI can render a chat-style interface
 * without client-side gymnastics. When the KV binding is missing (e.g., during
 * `next dev` without Wrangler), an in-memory fallback keeps the utility usable.
 *
 * @see ../../PLAN.md - Utility design notes
 * @see ../../../../docs/AI_AGENT_STANDARDS.md - Repository standards
 */

import type { KVNamespace, KVNamespaceListKey } from "@cloudflare/workers-types";

import { getSmsKvNamespace } from "./kv";
import type { Message, ThreadSummary } from "./types";
import { safeTrim } from "./validation";

const MESSAGE_PREFIX = "messages:";
const THREAD_PREFIX = "thread:";
const MAX_TIMESTAMP = 9999999999999;
const DEFAULT_LIMIT = 200;

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

const fallbackMessagesByCounterpart = new Map<string, Message[]>();
const fallbackThreads = new Map<string, ThreadSummary>();

function normalizeCounterpart(counterpart: string): string {
    return safeTrim(counterpart);
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
    return `${MESSAGE_PREFIX}${counterpart}:${invertTimestamp(timestamp)}:${id}`;
}

function buildThreadKey(counterpart: string): string {
    return `${THREAD_PREFIX}${counterpart}`;
}

function appendFallbackMessage(record: Message): void {
    const list = fallbackMessagesByCounterpart.get(record.phoneNumber) ?? [];
    list.push(record);
    list.sort((a, b) => a.timestamp - b.timestamp);
    fallbackMessagesByCounterpart.set(record.phoneNumber, list);
}

function updateFallbackThread(record: Message): void {
    const summary = fallbackThreads.get(record.phoneNumber);
    const updated: ThreadSummary = {
        counterpart: record.phoneNumber,
        lastMessagePreview: record.body.slice(0, 280),
        lastMessageTimestamp: record.timestamp,
        lastDirection: record.direction,
        messageCount: (summary?.messageCount ?? 0) + 1,
    };
    fallbackThreads.set(record.phoneNumber, updated);
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

    if (!kv) {
        appendFallbackMessage(normalizedMessage);
        updateFallbackThread(normalizedMessage);
        return normalizedMessage;
    }

    const messageKey = buildMessageKey(
        normalizedMessage.phoneNumber,
        normalizedMessage.timestamp,
        normalizedMessage.id
    );

    await Promise.all([
        kv.put(messageKey, JSON.stringify(normalizedMessage)),
        updateThreadSummary(kv, normalizedMessage),
    ]);

    return normalizedMessage;
}

export async function getMessages(
    options: MessageListOptions
): Promise<MessageListResult> {
    const counterpart = normalizeCounterpart(options.counterpart);
    if (!counterpart) {
        throw new Error("Counterpart phone number is required to list messages");
    }

    const kv = await getSmsKvNamespace();

    if (!kv) {
        const fallbackList =
            fallbackMessagesByCounterpart.get(counterpart) ?? [];
        return {
            counterpart,
            messages: [...fallbackList],
            listComplete: true,
        };
    }

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

export async function getMessagesSince(since: number): Promise<Message[]> {
    const kv = await getSmsKvNamespace();

    if (!kv) {
        // Fallback: filter all messages from all counterparts
        const allMessages: Message[] = [];
        for (const messages of fallbackMessagesByCounterpart.values()) {
            allMessages.push(...messages);
        }
        return allMessages
            .filter((msg) => msg.timestamp > since)
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    // Query all message keys and filter by timestamp
    const list = await kv.list({
        prefix: MESSAGE_PREFIX,
        limit: 10000, // Adjust if needed
    });

    const messages = await Promise.all(
        list.keys.map(async (entry) => {
            const result = await kv.get(entry.name, "json");
            return result as Message | null;
        })
    );

    return messages
        .filter((msg): msg is Message => msg !== null && msg.timestamp > since)
        .sort((a, b) => a.timestamp - b.timestamp);
}

export async function getThreadSummaries(): Promise<ThreadSummary[]> {
    const kv = await getSmsKvNamespace();

    if (!kv) {
        return [...fallbackThreads.values()].sort(
            (a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp
        );
    }

    const list = await kv.list({
        prefix: THREAD_PREFIX,
        limit: 1000,
    });

    const threads = await Promise.all(
        list.keys.map(async (entry) => {
            const summary = (await kv.get(entry.name, "json")) as
                | ThreadSummary
                | null;
            return summary;
        })
    );

    return threads
        .filter((summary): summary is ThreadSummary => summary !== null)
        .sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
}

