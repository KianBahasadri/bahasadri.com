"use client";

/**
 * SMS Commander Interactive Console
 *
 * Client Component that renders the SMS form, handles API interactions, and
 * displays hostile feedback to stay on brand with the site's persona.
 */

import { useCallback, useState } from "react";

import MessageList from "../MessageList/MessageList";
import styles from "./SMSInterface.module.css";
import {
    Message,
    MessageHistoryResponse,
    SendSMSResponse,
} from "../../lib/types";

interface SMSInterfaceProps {
    /** Initial message history provided by the Server Component */
    initialMessages: Message[];
}

/**
 * Render the SMS control console with form + history.
 */
export default function SMSInterface({ initialMessages }: SMSInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [messageBody, setMessageBody] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const refreshMessages = useCallback(async () => {
        setIsRefreshing(true);
        setError(null);

        try {
            const response = await fetch("/api/tools/sms-commander/history", {
                cache: "no-store",
            });

            if (!response.ok) {
                throw new Error("History endpoint coughed up blood");
            }

            const payload = (await response.json()) as MessageHistoryResponse;
            setMessages(payload.messages);
        } catch (refreshError) {
            const message =
                refreshError instanceof Error
                    ? refreshError.message
                    : "Failed to fetch history";
            setError(message);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setIsSending(true);
            setError(null);
            setFeedback(null);

            try {
                const response = await fetch("/api/tools/sms-commander/send", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        phoneNumber,
                        message: messageBody,
                    }),
                });

                const payload = (await response.json()) as SendSMSResponse;

                if (!response.ok || !payload.success || !payload.message) {
                    throw new Error(payload.error ?? "Send API imploded");
                }

                const storedMessage = payload.message;
                setMessages((current) => [storedMessage, ...current]);
                setFeedback(
                    "Transmission launched. If this fails, blame the solar flares."
                );
                setPhoneNumber("");
                setMessageBody("");
            } catch (sendError) {
                const message =
                    sendError instanceof Error
                        ? sendError.message
                        : "Failed to send SMS";
                setError(message);
            } finally {
                setIsSending(false);
            }
        },
        [messageBody, phoneNumber]
    );

    return (
        <div className={styles.console}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.fieldGroup}>
                    <label htmlFor="phone-input">
                        target number (e.164 or riot)
                    </label>
                    <input
                        id="phone-input"
                        name="phone"
                        value={phoneNumber}
                        onChange={(event) => setPhoneNumber(event.target.value)}
                        placeholder="+1234567890"
                        className={styles.input}
                        required
                        maxLength={17}
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label htmlFor="message-input">
                        payload (keep it under 1600 chars)
                    </label>
                    <textarea
                        id="message-input"
                        name="message"
                        value={messageBody}
                        onChange={(event) => setMessageBody(event.target.value)}
                        placeholder="Tell the feds how much you love compliance."
                        className={styles.textarea}
                        required
                        maxLength={1600}
                    />
                </div>

                <div className={styles.actions}>
                    <button
                        type="submit"
                        className={styles.primaryButton}
                        disabled={isSending}
                    >
                        {isSending ? "launching..." : "fire the text missile"}
                    </button>
                    <button
                        type="button"
                        className={styles.refreshButton}
                        onClick={refreshMessages}
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? "syncing..." : "pull latest intel"}
                    </button>
                </div>

                {feedback && <p className={styles.feedback}>{feedback}</p>}
                {error && <p className={styles.error}>{error}</p>}
            </form>

            <MessageList messages={messages} />
        </div>
    );
}
