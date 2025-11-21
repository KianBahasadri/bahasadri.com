/**
 * SMS Commander contact storage powered by Cloudflare KV.
 *
 * Stores lightweight contact profiles (alias + phone number) so chats can
 * display human-friendly names. Requires the SMS_MESSAGES KV binding to be
 * configured, ensuring development and production use the same code path.
 *
 * @see ../../PLAN.md - Utility planning details
 * @see ../../../../docs/AI_AGENT_STANDARDS.md - Repository standards
 */

import type { KVNamespace } from "@cloudflare/workers-types";

import { getSmsKvNamespace } from "./kv";
import type {
    Contact,
    ContactCreatePayload,
    ContactMutationResult,
} from "./types";
import { isValidPhoneNumber } from "./validation";

const CONTACT_PREFIX = "contacts:";
const CONTACT_INDEX_PREFIX = "contacts-by-number:";

function contactKey(contactId: string): string {
    return `${CONTACT_PREFIX}${contactId}`;
}

function contactIndexKey(phoneNumber: string): string {
    return `${CONTACT_INDEX_PREFIX}${phoneNumber}`;
}

function sanitizeDisplayName(displayName: string): string {
    return displayName.trim().slice(0, 120);
}

function assertValidPayload(payload: ContactCreatePayload): void {
    if (!payload) {
        throw new Error("Missing payload");
    }

    if (!payload.phoneNumber || !isValidPhoneNumber(payload.phoneNumber)) {
        throw new Error("Provide a phone number in E.164 format, coward.");
    }

    if (!payload.displayName || payload.displayName.trim().length === 0) {
        throw new Error("Contacts need a name. Type literally anything.");
    }
}

async function putContactRecord(
    kv: KVNamespace,
    contact: Contact
): Promise<void> {
    await Promise.all([
        kv.put(contactKey(contact.id), JSON.stringify(contact)),
        kv.put(contactIndexKey(contact.phoneNumber), contact.id),
    ]);
}

export async function listContacts(): Promise<Contact[]> {
    const kv = await getSmsKvNamespace();

    const list = await kv.list({
        prefix: CONTACT_PREFIX,
        limit: 1000,
    });

    const contacts = await Promise.all(
        list.keys.map(async (entry) => {
            const record = (await kv.get(entry.name, "json")) as Contact | null;
            return record;
        })
    );

    return contacts
        .filter((contact): contact is Contact => contact !== null)
        .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function getContactByPhoneNumber(
    phoneNumber: string
): Promise<Contact | null> {
    const sanitized = phoneNumber.trim();
    const kv = await getSmsKvNamespace();

    const contactId = await kv.get(contactIndexKey(sanitized));
    if (!contactId) {
        return null;
    }

    const record = (await kv.get(
        contactKey(contactId),
        "json"
    )) as Contact | null;
    return record;
}

export async function createContact(
    payload: ContactCreatePayload
): Promise<ContactMutationResult> {
    assertValidPayload(payload);

    const sanitizedPhone = payload.phoneNumber.trim();
    const kv = await getSmsKvNamespace();
    const now = Date.now();
    const contact: Contact = {
        id: crypto.randomUUID(),
        phoneNumber: sanitizedPhone,
        displayName: sanitizeDisplayName(payload.displayName),
        createdAt: now,
        updatedAt: now,
    };

    const existingId = await kv.get(contactIndexKey(sanitizedPhone));
    if (existingId) {
        return {
            success: false,
            error: "Alias already exists for that number. Pick another pet name.",
        };
    }

    await putContactRecord(kv, contact);
    return { success: true, contact };
}

export async function updateContact(
    contactId: string,
    updates: Partial<ContactCreatePayload>
): Promise<ContactMutationResult> {
    const kv = await getSmsKvNamespace();

    const record = (await kv.get(
        contactKey(contactId),
        "json"
    )) as Contact | null;
    if (!record) {
        return { success: false, error: "Contact not found." };
    }

    const updated: Contact = {
        ...record,
        displayName: updates.displayName
            ? sanitizeDisplayName(updates.displayName)
            : record.displayName,
        updatedAt: Date.now(),
    };

    await kv.put(contactKey(contactId), JSON.stringify(updated));
    return { success: true, contact: updated };
}
