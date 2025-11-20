'use client';

/**
 * Message List Component
 *
 * Displays the hostile SMS history feed with sent/received differentiation.
 */

import styles from "./MessageList.module.css";
import { Message } from "../../lib/types";

interface MessageListProps {
    /** Messages to render */
    messages: Message[];
}

/**
 * Render the message list.
 */
export default function MessageList({ messages }: MessageListProps) {
    if (messages.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>no transmissions yet. did you forget to pay twilio again?</p>
            </div>
        );
    }

    return (
        <div className={styles.list}>
            {messages.map((message) => (
                <article
                    key={message.id}
                    className={`${styles.card} ${
                        message.direction === "sent" ? styles.sent : styles.received
                    }`}
                >
                    <header className={styles.cardHeader}>
                        <span className={styles.direction}>
                            {message.direction === "sent" ? "outbound" : "inbound"}
                        </span>
                        <span className={styles.timestamp}>
                            {new Date(message.timestamp).toLocaleString()}
                        </span>
                    </header>

                    <p className={styles.body}>{message.body}</p>

                    <footer className={styles.meta}>
                        <span>
                            you ↔ {message.direction === "sent" ? message.phoneNumber : message.counterpart}
                        </span>
                        {message.twilioSid && (
                            <span className={styles.sid}>sid: {message.twilioSid}</span>
                        )}
                    </footer>
                </article>
            ))}
        </div>
    );
}

