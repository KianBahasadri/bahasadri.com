import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sendSMS, fetchMessages, pollMessagesSince, fetchThreads, createContact } from "../../../../../lib/api";
import MessageList from "../MessageList/MessageList";
import type { Message, ThreadSummary, Contact } from "../../../../../types/sms-messenger";
import styles from "./sms-interface.module.css";

interface SMSInterfaceProps {
  readonly initialThreads: readonly ThreadSummary[];
  readonly initialMessages: readonly Message[];
  readonly initialContacts: readonly Contact[];
  readonly initialCounterpart: string | undefined;
}

const POLL_INTERVAL = 2000; // 2 seconds
const POLL_MAX_ATTEMPTS = 1000;

/* eslint-disable sonarjs/cognitive-complexity */
const updateMessageCache = (
  previous: Record<string, Message[]>,
  newMessages: Message[]
): Record<string, Message[]> => {
  const updated = { ...previous };

  // Group by counterpart
  for (const msg of newMessages) {
    if (!(msg.counterpart in updated)) {
      updated[msg.counterpart] = [];
    }
    const messages = updated[msg.counterpart];
    if (messages !== undefined) {
      const existing = messages.some((m) => m.id === msg.id);
      if (!existing) {
        messages.push(msg);
      }
    }
  }

  // Sort messages by timestamp
  for (const counterpart of Object.keys(updated)) {
    const messages = updated[counterpart];
    if (messages !== undefined) {
      messages.sort((a, b) => a.timestamp - b.timestamp);
    }
  }

  return updated;
};
/* eslint-enable sonarjs/cognitive-complexity */

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return messageDate.getTime() === today.getTime()
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function SMSInterface({
  initialThreads,
  initialContacts,
  initialCounterpart,
}: SMSInterfaceProps): React.JSX.Element {
  const queryClient = useQueryClient();
  const [threads, setThreads] = useState<ThreadSummary[]>([...initialThreads]);
  const [contacts, setContacts] = useState<Contact[]>([...initialContacts]);
  const [messageCache, setMessageCache] = useState<Record<string, Message[]>>({});
  const [activeCounterpart, setActiveCounterpart] = useState<string | undefined>(initialCounterpart);
  const [draftNumber, setDraftNumber] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | undefined>(undefined);
  const [pollCounter, setPollCounter] = useState(0);
  const [lastPollTimestamp, setLastPollTimestamp] = useState(Date.now());
  const pollIntervalRef = useRef<number | undefined>(undefined);
  const messageListRef = useRef<HTMLDivElement>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactPhoneNumber, setContactPhoneNumber] = useState("");
  const [contactDisplayName, setContactDisplayName] = useState("");
  const [contactError, setContactError] = useState<string | undefined>(undefined);

  // Fetch messages for active counterpart
  const { data: messagesData } = useQuery({
    queryKey: ["sms-messenger", "messages", activeCounterpart],
    queryFn: async () => {
      if (!activeCounterpart) throw new Error("No counterpart selected");
      return await fetchMessages(activeCounterpart);
    },
    enabled: !!activeCounterpart,
  });

  // Update message cache when messages are fetched
  useEffect(() => {
    if (messagesData?.messages && activeCounterpart) {
      setMessageCache((previous) => ({
        ...previous,
        [activeCounterpart]: messagesData.messages,
      }));
    }
  }, [messagesData, activeCounterpart]);

  // Get messages for active counterpart from cache
  const activeMessages = useMemo(() => {
    if (!activeCounterpart) {
      return [];
    }
    return messageCache[activeCounterpart] ?? [];
  }, [activeCounterpart, messageCache]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [activeMessages]);

  // Handle polling response
  const handlePollResponse = useCallback(
    (response: Awaited<ReturnType<typeof pollMessagesSince>>) => {
      if (response.success && response.messages.length > 0) {
        setMessageCache((previous) => updateMessageCache(previous, response.messages));

        // Update threads
        if (response.threads.length > 0) {
          setThreads(response.threads);
        }

        setLastPollTimestamp(response.timestamp);
      }
    },
    []
  );

  // Polling logic
  const pollForUpdates = useCallback(async () => {
    if (pollCounter >= POLL_MAX_ATTEMPTS) {
      return;
    }

    try {
      const response = await pollMessagesSince(lastPollTimestamp);
      handlePollResponse(response);
      setPollCounter((previous) => previous + 1);
    } catch {
      // Error handled silently - polling will continue
      setPollCounter((previous) => previous + 1);
    }
  }, [pollCounter, lastPollTimestamp, handlePollResponse]);

  // Set up polling interval
  useEffect(() => {
    pollIntervalRef.current = globalThis.setInterval(() => {
      void pollForUpdates();
    }, POLL_INTERVAL);

    return (): void => {
      if (pollIntervalRef.current !== undefined) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [pollForUpdates]);

  // Send SMS mutation
  const sendMutation = useMutation({
    mutationFn: async ({ phoneNumber, message }: { phoneNumber: string; message: string }) =>
      await sendSMS(phoneNumber, message),
    onSuccess: (data) => {
      if (data.success && data.message) {
        const msg = data.message;
        setMessageCache((previous) => {
          const updated = { ...previous };
          if (!(msg.counterpart in updated)) {
            updated[msg.counterpart] = [];
          }
          // Check for duplicates
          const messages = updated[msg.counterpart];
          if (messages !== undefined && !messages.some((m) => m.id === msg.id)) {
            messages.push(msg);
            messages.sort((a, b) => a.timestamp - b.timestamp);
          }
          return updated;
        });

        // Refresh threads
        void queryClient.invalidateQueries({ queryKey: ["sms-messenger", "threads"] });
        void fetchThreads().then((data) => {
          setThreads(data.threads);
          return data;
        }).catch(() => {
          // Error handled silently
        });

        setMessageBody("");
        setSendError(undefined);
      }
    },
    onError: (error: Error) => {
      setSendError(error.message);
    },
    onSettled: () => {
      setSending(false);
    },
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async ({ phoneNumber, displayName }: { phoneNumber: string; displayName: string }) =>
      await createContact(phoneNumber, displayName),
    onSuccess: (data) => {
      if (data.success && data.contact) {
        const contact = data.contact;
        setContacts((previous) => [...previous, contact]);
        void queryClient.invalidateQueries({ queryKey: ["sms-messenger", "contacts"] });
        setShowContactForm(false);
        setContactPhoneNumber("");
        setContactDisplayName("");
        setContactError(undefined);
      }
    },
    onError: (error: Error) => {
      setContactError(error.message);
    },
  });

  const handleCreateContact = (event: React.FormEvent): void => {
    event.preventDefault();
    if (!contactPhoneNumber.trim() || !contactDisplayName.trim()) {
      setContactError("Please fill in all fields");
      return;
    }
    createContactMutation.mutate({
      phoneNumber: contactPhoneNumber.trim(),
      displayName: contactDisplayName.trim(),
    });
  };

  const handleSend = (event: React.FormEvent): void => {
    event.preventDefault();
    if (!messageBody.trim() || sending) return;

    const phoneNumber = activeCounterpart ?? draftNumber.trim();
    if (!phoneNumber) {
      setSendError("Please select a conversation or enter a phone number");
      return;
    }

    setSending(true);
    sendMutation.mutate({ phoneNumber, message: messageBody });
  };

  const handleThreadSelect = (counterpart: string): void => {
    setActiveCounterpart(counterpart);
    setDraftNumber("");
  };

  const getContactName = (phoneNumber: string): string => {
    const contact = contacts.find((c) => c.phoneNumber === phoneNumber);
    return contact?.displayName ?? phoneNumber;
  };

  return (
    <div className={styles["container"]}>
      <div className={styles["sidebar"]}>
        <div className={styles["sidebarHeader"]}>
          <h2 className={styles["sidebarTitle"]}>Conversations</h2>
          <button
            className={styles["addContactButton"]}
            onClick={(): void => {
              setShowContactForm(true);
            }}
            title="Add Contact"
          >
            +
          </button>
        </div>
        {showContactForm ? (
          <div className={styles["contactForm"]}>
            <h3 className={styles["contactFormTitle"]}>Add Contact</h3>
            <form onSubmit={handleCreateContact}>
              {contactError ? <div className={styles["error"]}>{contactError}</div> : undefined}
              <input
                type="tel"
                className={styles["contactInput"]}
                value={contactPhoneNumber}
                onChange={(event) => {
                  setContactPhoneNumber(event.target.value);
                }}
                placeholder="Phone number (E.164)"
                required
              />
              <input
                type="text"
                className={styles["contactInput"]}
                value={contactDisplayName}
                onChange={(event) => {
                  setContactDisplayName(event.target.value);
                }}
                placeholder="Display name"
                required
              />
              <div className={styles["contactFormActions"]}>
                <button
                  type="submit"
                  className={styles["contactSubmitButton"]}
                  disabled={createContactMutation.isPending}
                >
                  {createContactMutation.isPending ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  className={styles["contactCancelButton"]}
                  onClick={() => {
                    setShowContactForm(false);
                    setContactPhoneNumber("");
                    setContactDisplayName("");
                    setContactError(undefined);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : undefined}
        <div className={styles["threadList"]}>
          {threads.length === 0 ? (
            <div className={styles["emptyState"]}>No conversations yet</div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.counterpart}
                className={`${styles["threadItem"] ?? ""} ${
                  activeCounterpart === thread.counterpart ? styles["active"] ?? "" : ""
                }`}
                onClick={(): void => {
                  handleThreadSelect(thread.counterpart);
                }}
              >
                <div className={styles["threadName"]}>
                  {thread.contactName ?? thread.counterpart}
                </div>
                <div className={styles["threadPreview"]}>{thread.lastMessagePreview}</div>
                <div className={styles["threadTime"]}>
                  {formatTimestamp(thread.lastMessageTimestamp)}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className={styles["mainArea"]}>
        {activeCounterpart ? (
          <>
            <div className={styles["header"]}>
              <h2 className={styles["headerTitle"]}>
                {getContactName(activeCounterpart)}
              </h2>
              {activeCounterpart && !contacts.some((c) => c.phoneNumber === activeCounterpart) ? (
                <button
                  className={styles["addContactToThreadButton"]}
                  onClick={() => {
                    setContactPhoneNumber(activeCounterpart);
                    setContactDisplayName("");
                    setContactError(undefined);
                    setShowContactForm(true);
                  }}
                  title="Add to contacts"
                >
                  Add Contact
                </button>
              ) : undefined}
            </div>

            <div className={styles["messageList"]} ref={messageListRef}>
              <MessageList
                messages={activeMessages}
              />
            </div>

            <form className={styles["composer"]} onSubmit={handleSend}>
              {sendError ? <div className={styles["error"]}>{sendError}</div> : undefined}
              <div className={styles["composerInputs"]}>
                <textarea
                  className={styles["messageInput"]}
                  value={messageBody}
                  onChange={(event) => {
                    setMessageBody(event.target.value);
                  }}
                  placeholder="Type a message..."
                  rows={3}
                  disabled={sending}
                />
                <button
                  type="submit"
                  className={styles["sendButton"]}
                  disabled={!messageBody.trim() || sending}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className={styles["emptyMain"]}>
            <p>Select a conversation or enter a phone number to start messaging</p>
            <div className={styles["newConversation"]}>
              <input
                type="tel"
                className={styles["phoneInput"]}
                value={draftNumber}
                onChange={(event) => {
                  setDraftNumber(event.target.value);
                }}
                placeholder="Enter phone number (E.164 format)"
              />
              <button
                className={styles["startButton"]}
                onClick={(): void => {
                  if (draftNumber.trim()) {
                    setActiveCounterpart(draftNumber.trim());
                  }
                }}
              >
                Start Conversation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

