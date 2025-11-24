import type { KVNamespace } from "@cloudflare/workers-types";
import type { Message, ThreadSummary, Contact } from "../types";

const MESSAGE_PREFIX = "msg:";
const THREAD_PREFIX = "thread:";
const CONTACT_PREFIX = "contact:";

async function paginateKV<T>(
  kv: KVNamespace,
  prefix: string,
  parseValue: (value: string) => T | undefined,
  filter?: (item: T) => boolean
): Promise<T[]> {
  const items: T[] = [];
  let cursor: string | undefined;

  do {
    const listOptions: { prefix: string; cursor?: string } = { prefix };
    if (cursor) {
      listOptions.cursor = cursor;
    }

    const result = await kv.list(listOptions);

    for (const key of result.keys) {
      const value = await kv.get(key.name);
      if (value) {
        const item = parseValue(value);
        if (item !== undefined && (filter === undefined || filter(item))) {
          items.push(item);
        }
      }
    }

    cursor = "cursor" in result ? result.cursor : undefined;
  } while (cursor);

  return items;
}

export function generateMessageKey(counterpart: string, timestamp: number, id: string): string {
  return `${MESSAGE_PREFIX}${counterpart}:${String(timestamp)}:${id}`;
}

export function getThreadKey(counterpart: string): string {
  return `${THREAD_PREFIX}${counterpart}`;
}

export function getContactKey(id: string): string {
  return `${CONTACT_PREFIX}${id}`;
}

export async function storeMessage(
  kv: KVNamespace,
  message: Message
): Promise<void> {
  const key = generateMessageKey(message.counterpart, message.timestamp, message.id);
  await kv.put(key, JSON.stringify(message));
}

export async function getMessages(
  kv: KVNamespace,
  counterpart: string,
  cursor?: string,
  limit = 50
): Promise<{ messages: Message[]; cursor?: string; listComplete: boolean }> {
  const prefix = `${MESSAGE_PREFIX}${counterpart}:`;
  const listOptions: { prefix: string; limit?: number; cursor?: string } = {
    prefix,
    limit,
  };
  if (cursor) {
    listOptions.cursor = cursor;
  }

  const result = await kv.list(listOptions);
  const messages: Message[] = [];

  for (const key of result.keys) {
    const value = await kv.get(key.name);
    if (value) {
      try {
        const message = JSON.parse(value) as Message;
        messages.push(message);
      } catch {
        // Failed to parse message, skip it
      }
    }
  }

  // Sort by timestamp ascending (oldest first)
  const sortedMessages = messages.toSorted((a, b) => a.timestamp - b.timestamp);

  return {
    messages: sortedMessages,
    cursor: "cursor" in result ? result.cursor : undefined,
    listComplete: result.list_complete,
  };
}

function parseMessage(value: string): Message | undefined {
  try {
    return JSON.parse(value) as Message;
  } catch {
    return undefined;
  }
}

export async function getMessagesSince(
  kv: KVNamespace,
  since: number
): Promise<Message[]> {
  const messages = await paginateKV(
    kv,
    MESSAGE_PREFIX,
    parseMessage,
    (message) => message.timestamp > since
  );

  return messages.toSorted((a, b) => a.timestamp - b.timestamp);
}

export async function updateThreadSummary(
  kv: KVNamespace,
  message: Message,
  contact?: Contact
): Promise<void> {
  const threadKey = getThreadKey(message.counterpart);
  const existing = await kv.get(threadKey);

  let threadSummary: ThreadSummary;
  if (existing) {
    threadSummary = JSON.parse(existing) as ThreadSummary;
    threadSummary.lastMessagePreview = message.body.slice(0, 100);
    threadSummary.lastMessageTimestamp = message.timestamp;
    threadSummary.lastDirection = message.direction;
    threadSummary.messageCount += 1;
  } else {
    threadSummary = {
      counterpart: message.counterpart,
      lastMessagePreview: message.body.slice(0, 100),
      lastMessageTimestamp: message.timestamp,
      lastDirection: message.direction,
      messageCount: 1,
    };
  }

  if (contact) {
    threadSummary.contactId = contact.id;
    threadSummary.contactName = contact.displayName;
  }

  await kv.put(threadKey, JSON.stringify(threadSummary));
}

function parseThreadSummary(value: string): ThreadSummary | undefined {
  try {
    return JSON.parse(value) as ThreadSummary;
  } catch {
    return undefined;
  }
}

export async function getThreadSummaries(
  kv: KVNamespace
): Promise<ThreadSummary[]> {
  const threads = await paginateKV(kv, THREAD_PREFIX, parseThreadSummary);

  return threads.toSorted((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
}

export async function storeContact(
  kv: KVNamespace,
  contact: Contact
): Promise<void> {
  const key = getContactKey(contact.id);
  await kv.put(key, JSON.stringify(contact));
}

export async function getContact(
  kv: KVNamespace,
  id: string
): Promise<Contact | undefined> {
  const key = getContactKey(id);
  const value = await kv.get(key);
  if (!value) return undefined;
  try {
    return JSON.parse(value) as Contact;
  } catch {
    // Failed to parse contact
    return undefined;
  }
}

function parseContact(value: string): Contact | undefined {
  try {
    return JSON.parse(value) as Contact;
  } catch {
    return undefined;
  }
}

export async function getContactByPhoneNumber(
  kv: KVNamespace,
  phoneNumber: string
): Promise<Contact | undefined> {
  const contacts = await paginateKV(
    kv,
    CONTACT_PREFIX,
    parseContact,
    (contact) => contact.phoneNumber === phoneNumber
  );

  return contacts[0];
}

export async function getAllContacts(kv: KVNamespace): Promise<Contact[]> {
  const contacts = await paginateKV(kv, CONTACT_PREFIX, parseContact);

  return contacts.toSorted((a, b) => a.displayName.localeCompare(b.displayName));
}

