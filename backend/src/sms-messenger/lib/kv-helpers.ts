import type { KVNamespace } from "@cloudflare/workers-types";
import type { Message, ThreadSummary, Contact } from "../types";

const MESSAGE_PREFIX = "msg:";
const THREAD_PREFIX = "thread:";
const CONTACT_PREFIX = "contact:";

export function generateMessageKey(counterpart: string, timestamp: number, id: string): string {
  return `${MESSAGE_PREFIX}${counterpart}:${timestamp}:${id}`;
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
  messages.sort((a, b) => a.timestamp - b.timestamp);

  return {
    messages,
    cursor: "cursor" in result ? result.cursor : undefined,
    listComplete: result.list_complete,
  };
}

export async function getMessagesSince(
  kv: KVNamespace,
  since: number
): Promise<Message[]> {
  const prefix = MESSAGE_PREFIX;
  const messages: Message[] = [];
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
        try {
          const message = JSON.parse(value) as Message;
          if (message.timestamp > since) {
            messages.push(message);
          }
        } catch {
          // Failed to parse message, skip it
        }
      }
    }

    cursor = "cursor" in result ? result.cursor : undefined;
  } while (cursor);

  // Sort by timestamp ascending
  messages.sort((a, b) => a.timestamp - b.timestamp);

  return messages;
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
    threadSummary.lastMessagePreview = message.body.substring(0, 100);
    threadSummary.lastMessageTimestamp = message.timestamp;
    threadSummary.lastDirection = message.direction;
    threadSummary.messageCount += 1;
  } else {
    threadSummary = {
      counterpart: message.counterpart,
      lastMessagePreview: message.body.substring(0, 100),
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

export async function getThreadSummaries(
  kv: KVNamespace
): Promise<ThreadSummary[]> {
  const prefix = THREAD_PREFIX;
  const threads: ThreadSummary[] = [];
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
        try {
          const thread = JSON.parse(value) as ThreadSummary;
          threads.push(thread);
        } catch {
          // Failed to parse thread, skip it
        }
      }
    }

    cursor = "cursor" in result ? result.cursor : undefined;
  } while (cursor);

  // Sort by last message timestamp descending (newest first)
  threads.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);

  return threads;
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
): Promise<Contact | null> {
  const key = getContactKey(id);
  const value = await kv.get(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as Contact;
  } catch {
    // Failed to parse contact
    return null;
  }
}

export async function getContactByPhoneNumber(
  kv: KVNamespace,
  phoneNumber: string
): Promise<Contact | null> {
  const prefix = CONTACT_PREFIX;
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
        try {
          const contact = JSON.parse(value) as Contact;
          if (contact.phoneNumber === phoneNumber) {
            return contact;
          }
        } catch {
          // Failed to parse contact, skip it
        }
      }
    }

    cursor = "cursor" in result ? result.cursor : undefined;
  } while (cursor);

  return null;
}

export async function getAllContacts(kv: KVNamespace): Promise<Contact[]> {
  const prefix = CONTACT_PREFIX;
  const contacts: Contact[] = [];
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
        try {
          const contact = JSON.parse(value) as Contact;
          contacts.push(contact);
        } catch {
          // Failed to parse contact, skip it
        }
      }
    }

    cursor = "cursor" in result ? result.cursor : undefined;
  } while (cursor);

  // Sort by display name
  contacts.sort((a, b) => a.displayName.localeCompare(b.displayName));

  return contacts;
}

