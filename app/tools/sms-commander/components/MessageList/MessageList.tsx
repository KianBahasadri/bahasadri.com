'use client';

/**
 * Message List Component
 *
 * Renders a chat-style transcript with outbound/inbound styling, optional
 * contact labels, and a loading state. This component intentionally remains
 * client-side so it can animate new messages without remounting.
 *
 * Type: Client Component (inherits requirement from parent)
 */

import styles from "./MessageList.module.css";
import type { Message } from "../../lib/types";

interface MessageListProps {
    /** Messages to render for the active counterpart */
    messages: Message[];
    /** Indicates whether a history fetch is in flight */
    isLoading: boolean;
    /** Friendly name tied to the counterpart (if any) */
    contactName: string | null;
    /** Active counterpart phone number */
    counterpart: string | null;
}

/**
 * Render the message list with hostile UX copy.
 */
export default function MessageList({
    messages,
    isLoading,
    contactName,
    counterpart,
}: MessageListProps) {
    if (!counterpart) {
        return (
            <div className={styles.emptyState}>
                <p>select a thread. the void is patient but i am not.</p>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>
                    {isLoading
                        ? "scraping the archives..."
                        : "no transmissions yet. type faster, coward."}
                </p>
            </div>
        );
    }

    return (
        <div className={styles.timeline}>
            {messages.map((message) => {
                const isOutbound = message.direction === "sent";
                const senderLabel = isOutbound
                    ? "you"
                    : contactName ?? counterpart ?? message.phoneNumber;

                return (
                    <article
                        key={message.id}
                        className={`${styles.message} ${
                            isOutbound ? styles.outbound : styles.inbound
                        }`}
                    >
                        <header className={styles.messageHeader}>
                            <span className={styles.sender}>{senderLabel}</span>
                            <time className={styles.timestamp}>
                                {new Date(message.timestamp).toLocaleString()}
                            </time>
                        </header>
                        <p className={styles.body}>{message.body}</p>
                        <footer className={styles.footer}>
                            <span>{isOutbound ? "launched" : "captured"}</span>
                            {message.twilioSid && (
                                <span className={styles.sid}>
                                    sid: {message.twilioSid}
                                </span>
                            )}
                        </footer>
                    </article>
                );
            })}
        </div>
    );
}

