"use client";

/**
 * SMS Commander Interactive Console
 *
 * Chat-style client component that renders the thread sidebar, conversation
 * view, composer, and contact alias editor. Real-time updates are powered by
 * WebSocket connections for instant message delivery without polling.
 *
 * Type: Client Component (requires interactivity + WebSocket)
 *
 * @see ../../PLAN.md - Utility planning document
 * @see ../../../../docs/AI_AGENT_STANDARDS.md - Repository standards
 * @see ../../../../docs/COMPONENTS.md - Component patterns
 */

import {
    type FormEvent,
    type KeyboardEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import MessageList from "../MessageList/MessageList";
import styles from "./SMSInterface.module.css";
import type {
    Contact,
    ContactMutationResult,
    Message,
    MessageHistoryResponse,
    SendSMSResponse,
    ThreadListResponse,
    ThreadSummary,
} from "../../lib/types";

interface SMSInterfaceProps {
    /** Threads fetched on the server during the initial render */
    initialThreads: ThreadSummary[];
    /** Messages for the default/first thread */
    initialMessages: Message[];
    /** Contacts cached on the server */
    initialContacts: Contact[];
    /** Counterpart selected on first render (if any threads exist) */
    initialCounterpart: string | null;
    /** Short-lived token used to authorize WebSocket connections */
    websocketToken: string;
}

type MessageCache = Record<string, Message[]>;

/**
 * Render the SMS commander chat experience.
 */
export default function SMSInterface({
    initialThreads,
    initialMessages,
    initialContacts,
    initialCounterpart,
    websocketToken,
}: SMSInterfaceProps) {
    const [threads, setThreads] = useState<ThreadSummary[]>(initialThreads);
    const [contacts, setContacts] = useState<Contact[]>(initialContacts);
    const [messageCache, setMessageCache] = useState<MessageCache>(() =>
        initialCounterpart ? { [initialCounterpart]: initialMessages } : {}
    );
    const [activeCounterpart, setActiveCounterpart] = useState<string | null>(
        initialCounterpart
    );
    const [draftNumber, setDraftNumber] = useState("");
    const [messageBody, setMessageBody] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isRefreshingThreads, setIsRefreshingThreads] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isContactFormVisible, setIsContactFormVisible] = useState(false);
    const [contactNameInput, setContactNameInput] = useState("");
    const [isSavingContact, setIsSavingContact] = useState(false);

    const refreshThreadsInFlight = useRef(false);
    const refreshMessagesInFlight = useRef(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );
    const reconnectAttemptsRef = useRef(0);
    const activeCounterpartRef = useRef<string | null>(initialCounterpart);

    const activeMessages = useMemo(() => {
        if (!activeCounterpart) {
            return [];
        }

        return messageCache[activeCounterpart] ?? [];
    }, [activeCounterpart, messageCache]);

    const currentContact = useMemo(() => {
        if (!activeCounterpart) {
            return null;
        }

        return (
            contacts.find(
                (contact) => contact.phoneNumber === activeCounterpart
            ) ?? null
        );
    }, [activeCounterpart, contacts]);
    useEffect(() => {
        activeCounterpartRef.current = activeCounterpart;
    }, [activeCounterpart]);

    const isComposingNewChat = !activeCounterpart;

    /**
     * Refresh the thread list from the Workers endpoint.
     */
    const refreshThreads = useCallback(async (silent = false) => {
        if (silent && refreshThreadsInFlight.current) {
            return;
        }

        if (!silent) {
            setIsRefreshingThreads(true);
        }

        refreshThreadsInFlight.current = true;

        try {
            const response = await fetch("/api/tools/sms-commander/threads", {
                cache: "no-store",
            });

            if (!response.ok) {
                throw new Error("Thread list choked. Try again.");
            }

            const payload = (await response.json()) as ThreadListResponse;
            setThreads(payload.threads);
        } catch (error) {
            if (!silent) {
                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "Failed to refresh threads."
                );
            }
        } finally {
            refreshThreadsInFlight.current = false;
            if (!silent) {
                setIsRefreshingThreads(false);
            }
        }
    }, []);

    /**
     * Load messages for a specific counterpart.
     */
    const loadMessages = useCallback(
        async (counterpart: string, silent = false) => {
            if (!counterpart) {
                return;
            }

            if (silent && refreshMessagesInFlight.current) {
                return;
            }

            if (!silent) {
                setIsLoadingMessages(true);
            }

            refreshMessagesInFlight.current = true;

            try {
                const response = await fetch(
                    `/api/tools/sms-commander/history?counterpart=${encodeURIComponent(
                        counterpart
                    )}`,
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error("History endpoint coughed up blood.");
                }

                const payload =
                    (await response.json()) as MessageHistoryResponse;
                if (payload.error) {
                    throw new Error(payload.error);
                }
                setMessageCache((current) => ({
                    ...current,
                    [counterpart]: payload.messages,
                }));
            } catch (error) {
                if (!silent) {
                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : "Failed to fetch history."
                    );
                }
            } finally {
                refreshMessagesInFlight.current = false;
                if (!silent) {
                    setIsLoadingMessages(false);
                }
            }
        },
        []
    );

    /**
     * Establish WebSocket connection for real-time updates.
     */
    useEffect(() => {
        if (!websocketToken) {
            console.error("Missing WebSocket authentication token.");
            return;
        }

        let isUnmounted = false;
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/api/tools/sms-commander/ws?token=${encodeURIComponent(
            websocketToken
        )}`;

        const clearReconnectTimer = () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        };

        const scheduleReconnect = () => {
            if (isUnmounted) {
                return;
            }

            const attempt = reconnectAttemptsRef.current;
            const delay = Math.min(30000, 1000 * 2 ** attempt);
            reconnectAttemptsRef.current = attempt + 1;

            clearReconnectTimer();
            reconnectTimeoutRef.current = setTimeout(() => {
                connect();
            }, delay);
        };

        const connect = () => {
            if (isUnmounted) {
                return;
            }

            try {
                const ws = new WebSocket(wsUrl);
                wsRef.current = ws;

                ws.onopen = () => {
                    reconnectAttemptsRef.current = 0;
                    clearReconnectTimer();
                };

                ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data) as {
                            type: string;
                            data?: unknown;
                        };

                        if (message.type === "ping") {
                            ws.send(JSON.stringify({ type: "pong" }));
                            return;
                        }

                        if (message.type === "message" && message.data) {
                            const { message: newMessage, counterpart } =
                                message.data as {
                                    message: Message;
                                    counterpart: string;
                                };

                            setMessageCache((current) => {
                                const existing = current[counterpart] ?? [];
                                if (
                                    existing.some((existingMessage) => {
                                        return existingMessage.id === newMessage.id;
                                    })
                                ) {
                                    return current;
                                }
                                return {
                                    ...current,
                                    [counterpart]: [...existing, newMessage],
                                };
                            });

                            if (
                                counterpart === activeCounterpartRef.current ||
                                !activeCounterpartRef.current
                            ) {
                                void refreshThreads(true);
                            }
                        }

                        if (
                            message.type === "threads_refresh" &&
                            message.data
                        ) {
                            const { threads } = message.data as {
                                threads: ThreadSummary[];
                            };
                            setThreads(threads);
                        }
                    } catch (error) {
                        console.error(
                            "Error parsing WebSocket message:",
                            error
                        );
                    }
                };

                ws.onerror = (error) => {
                    console.error("WebSocket error:", error);
                };

                ws.onclose = () => {
                    wsRef.current = null;
                    if (!isUnmounted) {
                        scheduleReconnect();
                    }
                };
            } catch (error) {
                console.error("Failed to create WebSocket:", error);
                scheduleReconnect();
            }
        };

        connect();

        return () => {
            isUnmounted = true;
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            clearReconnectTimer();
        };
    }, [refreshThreads, websocketToken]);

    /**
     * Auto-fetch messages when selecting a different thread.
     */
    useEffect(() => {
        if (!activeCounterpart) {
            return;
        }

        if (!messageCache[activeCounterpart]) {
            void loadMessages(activeCounterpart);
        }
    }, [activeCounterpart, loadMessages, messageCache]);

    const handleThreadSelect = useCallback((counterpart: string) => {
        setStatusMessage(null);
        setErrorMessage(null);
        setIsContactFormVisible(false);
        setActiveCounterpart(counterpart);
    }, []);

    const handleStartNewChat = useCallback(() => {
        setActiveCounterpart(null);
        setStatusMessage(null);
        setErrorMessage(null);
        setIsContactFormVisible(false);
        setDraftNumber("");
    }, []);

    /**
     * Auto-resize textarea based on content.
     */
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [messageBody]);

    const handleSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setIsSending(true);
            setStatusMessage(null);
            setErrorMessage(null);

            const targetNumber = activeCounterpart ?? draftNumber.trim();
            if (!targetNumber) {
                setErrorMessage("Give me a number to harass, agent.");
                setIsSending(false);
                return;
            }

            if (!messageBody.trim()) {
                setErrorMessage("Message can't be empty, agent.");
                setIsSending(false);
                return;
            }

            try {
                const response = await fetch("/api/tools/sms-commander/send", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        phoneNumber: targetNumber,
                        message: messageBody,
                    }),
                });

                const payload = (await response.json()) as SendSMSResponse;

                if (!response.ok || !payload.success || !payload.message) {
                    throw new Error(payload.error ?? "Send API imploded.");
                }

                const storedMessage = payload.message;

                setMessageCache((current) => {
                    const existing = current[storedMessage.phoneNumber] ?? [];
                    return {
                        ...current,
                        [storedMessage.phoneNumber]: [
                            ...existing,
                            storedMessage,
                        ],
                    };
                });

                setMessageBody("");
                setDraftNumber("");
                setActiveCounterpart(storedMessage.phoneNumber);
                void refreshThreads(true);
            } catch (error) {
                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "Failed to send SMS."
                );
            } finally {
                setIsSending(false);
            }
        },
        [activeCounterpart, draftNumber, messageBody, refreshThreads]
    );

    /**
     * Handle Enter key press in textarea (submit on Enter, newline on Shift+Enter).
     */
    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLTextAreaElement>) => {
            if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !isSending &&
                messageBody.trim()
            ) {
                event.preventDefault();
                const form = event.currentTarget.closest("form");
                if (form) {
                    const syntheticEvent = {
                        preventDefault: () => {},
                        currentTarget: form,
                        target: form,
                    } as unknown as FormEvent<HTMLFormElement>;
                    void handleSubmit(syntheticEvent);
                }
            }
        },
        [handleSubmit, isSending, messageBody]
    );

    const toggleContactForm = useCallback(() => {
        if (!activeCounterpart) {
            setErrorMessage("Pick a thread before naming it, glowie.");
            return;
        }

        setContactNameInput(currentContact?.displayName ?? "");
        setIsContactFormVisible((current) => !current);
    }, [activeCounterpart, currentContact]);

    const handleContactSave = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            if (!activeCounterpart) {
                setErrorMessage("Pick a thread before naming it, glowie.");
                return;
            }

            setIsSavingContact(true);
            setErrorMessage(null);

            try {
                const endpoint = currentContact
                    ? `/api/tools/sms-commander/contacts/${currentContact.id}`
                    : "/api/tools/sms-commander/contacts";
                const method = currentContact ? "PATCH" : "POST";
                const payload = currentContact
                    ? { displayName: contactNameInput }
                    : {
                          phoneNumber: activeCounterpart,
                          displayName: contactNameInput,
                      };

                const response = await fetch(endpoint, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                const result = (await response.json()) as ContactMutationResult;
                if (!result.success || !result.contact) {
                    throw new Error(result.error ?? "Contact mutation failed.");
                }

                const savedContact = result.contact;

                setContacts((current) => {
                    const contactExists = current.some(
                        (contact) => contact.id === savedContact.id
                    );
                    if (contactExists) {
                        return current.map((contact) =>
                            contact.id === savedContact.id
                                ? savedContact
                                : contact
                        );
                    }
                    return [...current, savedContact];
                });

                setThreads((current) =>
                    current.map((thread) =>
                        thread.counterpart === savedContact.phoneNumber
                            ? {
                                  ...thread,
                                  contactId: savedContact.id,
                                  contactName: savedContact.displayName,
                              }
                            : thread
                    )
                );

                setStatusMessage(
                    "Alias updated. Don't make me rename it again."
                );
                setIsContactFormVisible(false);
            } catch (error) {
                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "Failed to save contact."
                );
            } finally {
                setIsSavingContact(false);
            }
        },
        [activeCounterpart, contactNameInput, currentContact]
    );

    return (
        <div className={styles.chatLayout}>
            <aside className={styles.sidebar}>
                <header className={styles.sidebarHeader}>
                    <h2>thread dossiers</h2>
                    <button
                        type="button"
                        className={styles.newChatButton}
                        onClick={handleStartNewChat}
                    >
                        start new psyop
                    </button>
                </header>
                <div className={styles.threadList}>
                    {threads.length === 0 ? (
                        <p className={styles.emptySidebar}>
                            no chats yet. text someone or go touch snow.
                        </p>
                    ) : (
                        threads.map((thread) => (
                            <button
                                key={thread.counterpart}
                                type="button"
                                onClick={() =>
                                    handleThreadSelect(thread.counterpart)
                                }
                                className={`${styles.threadButton} ${
                                    thread.counterpart === activeCounterpart
                                        ? styles.threadButtonActive
                                        : ""
                                }`}
                            >
                                <span className={styles.threadName}>
                                    {thread.contactName ?? thread.counterpart}
                                </span>
                                <span className={styles.threadSnippet}>
                                    {thread.lastMessagePreview}
                                </span>
                                <span className={styles.threadTimestamp}>
                                    {new Date(
                                        thread.lastMessageTimestamp
                                    ).toLocaleTimeString()}
                                </span>
                            </button>
                        ))
                    )}
                </div>
                <div className={styles.sidebarFooter}>
                    <button
                        type="button"
                        onClick={() => refreshThreads(false)}
                        className={styles.refreshThreadsButton}
                        disabled={isRefreshingThreads}
                    >
                        {isRefreshingThreads
                            ? "scanning..."
                            : "refresh threads"}
                    </button>
                </div>
            </aside>

            <section className={styles.conversationPanel}>
                <header className={styles.conversationHeader}>
                    {activeCounterpart ? (
                        <>
                            <div>
                                <p className={styles.conversationTitle}>
                                    {currentContact?.displayName ??
                                        activeCounterpart ??
                                        "unnamed psyop"}
                                </p>
                                <p className={styles.conversationMeta}>
                                    {currentContact
                                        ? activeCounterpart
                                        : "raw number. assign an alias or keep living feral."}
                                </p>
                            </div>
                            <button
                                type="button"
                                className={styles.aliasButton}
                                onClick={toggleContactForm}
                            >
                                {currentContact
                                    ? "rename alias"
                                    : "assign alias"}
                            </button>
                        </>
                    ) : (
                        <p className={styles.conversationPlaceholder}>
                            pick a thread or start a new one. the feds get
                            lonely.
                        </p>
                    )}
                </header>

                {isContactFormVisible && activeCounterpart && (
                    <form
                        className={styles.contactForm}
                        onSubmit={handleContactSave}
                    >
                        <label htmlFor="contact-name-input">
                            alias for {activeCounterpart}
                        </label>
                        <input
                            id="contact-name-input"
                            name="contactName"
                            value={contactNameInput}
                            onChange={(event) =>
                                setContactNameInput(event.target.value)
                            }
                            placeholder="ex: doomscroll goblin"
                            required
                        />
                        <div className={styles.contactFormActions}>
                            <button
                                type="submit"
                                className={styles.primaryButton}
                                disabled={isSavingContact}
                            >
                                {isSavingContact ? "saving..." : "save alias"}
                            </button>
                            <button
                                type="button"
                                className={styles.refreshButton}
                                onClick={() => setIsContactFormVisible(false)}
                            >
                                cancel
                            </button>
                        </div>
                    </form>
                )}

                <div className={styles.messagesContainer}>
                    <MessageList
                        messages={activeMessages}
                        isLoading={isLoadingMessages}
                        contactName={currentContact?.displayName ?? null}
                        counterpart={activeCounterpart}
                    />
                </div>

                <form className={styles.composer} onSubmit={handleSubmit}>
                    {isComposingNewChat && (
                        <div className={styles.newChatInputWrapper}>
                            <input
                                id="new-chat-number"
                                name="newChatNumber"
                                value={draftNumber}
                                onChange={(event) =>
                                    setDraftNumber(event.target.value)
                                }
                                placeholder="+1234567890"
                                className={styles.newChatInput}
                                required
                            />
                        </div>
                    )}

                    <div className={styles.chatInputWrapper}>
                        <textarea
                            ref={textareaRef}
                            id="message-input"
                            name="message"
                            value={messageBody}
                            onChange={(event) =>
                                setMessageBody(event.target.value)
                            }
                            placeholder={
                                activeCounterpart
                                    ? "type a message..."
                                    : "pick a thread or start a new one..."
                            }
                            className={styles.chatInput}
                            rows={1}
                            required
                            maxLength={1600}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            type="submit"
                            className={styles.sendButton}
                            disabled={isSending || !messageBody.trim()}
                            aria-label="Send message"
                        >
                            {isSending ? (
                                <span className={styles.sendButtonText}>
                                    ...
                                </span>
                            ) : (
                                <span className={styles.sendButtonText}>→</span>
                            )}
                        </button>
                    </div>

                    {statusMessage && (
                        <p className={styles.feedback}>{statusMessage}</p>
                    )}
                    {errorMessage && (
                        <p className={styles.error}>{errorMessage}</p>
                    )}
                </form>
            </section>
        </div>
    );
}
