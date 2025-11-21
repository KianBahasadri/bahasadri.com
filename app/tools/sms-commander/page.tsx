/**
 * SMS Commander Utility Page
 *
 * Server Component responsible for rendering the SMS Commander interface,
 * including the hostile persona copy and the interactive client component that
 * handles sending and receiving SMS messages via Twilio.
 *
 * @see ./PLAN.md - Utility planning details
 * @see ../../docs/ARCHITECTURE.md - App architecture guidelines
 * @see ../../docs/AI_AGENT_STANDARDS.md - Content standards
 */

import SMSInterface from "./components/SMSInterface/SMSInterface";
import styles from "./page.module.css";
import { getMessages, getThreadSummaries } from "./lib/messageStore";
import { listContacts } from "./lib/contactsStore";
import { createWebsocketAuthToken } from "./lib/websocketAuth";

/** Ensure the page is rendered dynamically to reflect latest in-memory state. */
export const dynamic = "force-dynamic";

/**
 * Server Component entry point for the SMS Commander page.
 */
export default async function SMSCommanderPage() {
    const [threads, contacts] = await Promise.all([
        getThreadSummaries(),
        listContacts(),
    ]);

    const contactsByNumber = new Map(
        contacts.map((contact) => [contact.phoneNumber, contact])
    );

    const enrichedThreads = threads.map((thread) => {
        const contact = contactsByNumber.get(thread.counterpart);
        return {
            ...thread,
            contactId: contact?.id,
            contactName: contact?.displayName,
        };
    });

    const initialCounterpart = enrichedThreads[0]?.counterpart;
    const initialMessages = initialCounterpart
        ? (
              await getMessages({
                  counterpart: initialCounterpart,
              })
          ).messages
        : [];

    const wsAuth = await createWebsocketAuthToken();

    return (
        <main className={styles.main}>
            <SMSInterface
                initialThreads={enrichedThreads}
                initialMessages={initialMessages}
                initialContacts={contacts}
                initialCounterpart={initialCounterpart ?? null}
                websocketToken={wsAuth.token}
            />
        </main>
    );
}
