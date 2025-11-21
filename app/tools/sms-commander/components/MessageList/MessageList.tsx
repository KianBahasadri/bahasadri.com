"use client";

/**
 * Message List Component
 *
 * Renders a modern chat-style message list with bubble-style messages,
 * proper alignment (sent messages right, received left), and auto-scroll
 * support. This component intentionally remains client-side so it can
 * animate new messages without remounting.
 *
 * Type: Client Component (inherits requirement from parent)
 *
 * @see ../../../../docs/AI_AGENT_STANDARDS.md - Repository standards
 * @see ../../../../docs/COMPONENTS.md - Component patterns
 */

import { useEffect, useRef } from "react";
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
 * Format timestamp for display in chat bubbles.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted time string (e.g., "2:30 PM" or "Yesterday 2:30 PM")
 */
function formatMessageTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    const diffDays = Math.floor(
        (today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    } else if (diffDays === 1) {
        return `Yesterday ${date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })}`;
    } else if (diffDays < 7) {
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    } else {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }
}

/**
 * Render the message list with modern chat bubble styling.
 */
export default function MessageList({
    messages,
    isLoading,
    contactName,
    counterpart,
}: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    /**
     * Auto-scroll to bottom when messages change or thread changes.
     */
    useEffect(() => {
        if (messagesEndRef.current && containerRef.current) {
            const container = containerRef.current;
            const isNearBottom =
                container.scrollHeight - container.scrollTop <=
                container.clientHeight + 100;

            if (isNearBottom || messages.length === 0) {
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [messages, counterpart]);

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
        <div ref={containerRef} className={styles.messageContainer}>
            <div className={styles.messageList}>
                {messages.map((message) => {
                    const isOutbound = message.direction === "sent";

                    return (
                        <div
                            key={message.id}
                            className={`${styles.messageWrapper} ${
                                isOutbound ? styles.outbound : styles.inbound
                            }`}
                        >
                            <div
                                className={`${styles.messageBubble} ${
                                    isOutbound
                                        ? styles.outboundBubble
                                        : styles.inboundBubble
                                }`}
                            >
                                <p className={styles.messageBody}>
                                    {message.body}
                                </p>
                                <time className={styles.messageTime}>
                                    {formatMessageTime(message.timestamp)}
                                </time>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
