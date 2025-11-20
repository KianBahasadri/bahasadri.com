/**
 * SMS Commander - Thread List API Route
 *
 * Returns chat-style thread summaries enriched with optional contact metadata
 * so the client can render a sidebar without fetching the entire message log.
 */

import { NextResponse } from "next/server";

import { getThreadSummaries } from "../../../../tools/sms-commander/lib/messageStore";
import { listContacts } from "../../../../tools/sms-commander/lib/contactsStore";
import { ThreadListResponse } from "../../../../tools/sms-commander/lib/types";

export async function GET(): Promise<NextResponse<ThreadListResponse>> {
    const [threads, contacts] = await Promise.all([
        getThreadSummaries(),
        listContacts(),
    ]);

    const contactByNumber = new Map(
        contacts.map((contact) => [contact.phoneNumber, contact])
    );

    const enriched = threads.map((thread) => {
        const contact = contactByNumber.get(thread.counterpart);
        return {
            ...thread,
            contactId: contact?.id,
            contactName: contact?.displayName,
        };
    });

    return NextResponse.json({ threads: enriched });
}


