import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sendSMS, fetchMessages, pollMessagesSince, fetchThreads, createContact } from "../../../../../lib/api";
import MessageList from "../MessageList/MessageList";
import type { Message, ThreadSummary, Contact } from "../../../../../types/sms-messenger";
import styles from "./SMSInterface.module.css";

interface SMSInterfaceProps {
  initialThreads: ThreadSummary[];
  initialMessages: Message[];
  initialContacts: Contact[];
  initialCounterpart: string | null;
}

const POLL_INTERVAL = 2000; // 2 seconds
const POLL_MAX_ATTEMPTS = 1000;

export default function SMSInterface({
  initialThreads,
  initialContacts,
  initialCounterpart,
}: SMSInterfaceProps): JSX.Element {
  const queryClient = useQueryClient();
  const [threads, setThreads] = useState<ThreadSummary[]>(initialThreads);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [messageCache, setMessageCache] = useState<Record<string, Message[]>>({});
  const [activeCounterpart, setActiveCounterpart] = useState<string | null>(initialCounterpart);
  const [draftNumber, setDraftNumber] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [pollCounter, setPollCounter] = useState(0);
  const [lastPollTimestamp, setLastPollTimestamp] = useState(Date.now());
  const pollIntervalRef = useRef<number | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactPhoneNumber, setContactPhoneNumber] = useState("");
  const [contactDisplayName, setContactDisplayName] = useState("");
  const [contactError, setContactError] = useState<string | null>(null);

  // Fetch messages for active counterpart
  const { data: messagesData } = useQuery({
    queryKey: ["sms-messenger", "messages", activeCounterpart],
    queryFn: () => {
      if (!activeCounterpart) throw new Error("No counterpart selected");
      return fetchMessages(activeCounterpart);
    },
    enabled: !!activeCounterpart,
  });

  // Update message cache when messages are fetched
  useEffect(() => {
    if (messagesData?.messages && activeCounterpart) {
      setMessageCache((prev) => ({
        ...prev,
        [activeCounterpart]: messagesData.messages,
      }));
    }
  }, [messagesData, activeCounterpart]);

  // Get messages for active counterpart from cache
  const activeMessages = useMemo(
    () => (activeCounterpart ? messageCache[activeCounterpart] ?? [] : []),
    [activeCounterpart, messageCache]
  );

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [activeMessages]);

  // Polling logic
  const pollForUpdates = useCallback(async () => {
    if (pollCounter >= POLL_MAX_ATTEMPTS) {
      return;
    }

    try {
      const response = await pollMessagesSince(lastPollTimestamp);
      if (response.success && response.messages.length > 0) {
        // Deduplicate messages
        setMessageCache((prev) => {
          const updated = { ...prev };
          const messageMap = new Map<string, Message>();

          // Add existing messages to map
          Object.values(prev).flat().forEach((msg) => {
            messageMap.set(msg.id, msg);
          });

          // Add new messages
          response.messages.forEach((msg) => {
            messageMap.set(msg.id, msg);
          });

          // Group by counterpart
          response.messages.forEach((msg) => {
            if (!updated[msg.counterpart]) {
              updated[msg.counterpart] = [];
            }
            const existing = updated[msg.counterpart].find((m) => m.id === msg.id);
            if (!existing) {
              updated[msg.counterpart].push(msg);
            }
          });

          // Sort messages by timestamp
          Object.keys(updated).forEach((counterpart) => {
            updated[counterpart].sort((a, b) => a.timestamp - b.timestamp);
          });

          return updated;
        });

        // Update threads
        if (response.threads.length > 0) {
          setThreads(response.threads);
        }

        setLastPollTimestamp(response.timestamp);
      }
      setPollCounter((prev) => prev + 1);
    } catch {
      // Error handled silently - polling will continue
      setPollCounter((prev) => prev + 1);
    }
  }, [pollCounter, lastPollTimestamp]);

  // Set up polling interval
  useEffect(() => {
    pollIntervalRef.current = window.setInterval(() => {
      void pollForUpdates();
    }, POLL_INTERVAL);

    return (): void => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [pollForUpdates]);

  // Send SMS mutation
  const sendMutation = useMutation({
    mutationFn: ({ phoneNumber, message }: { phoneNumber: string; message: string }) =>
      sendSMS(phoneNumber, message),
    onSuccess: (data) => {
      if (data.success && data.message) {
        const msg = data.message;
        setMessageCache((prev) => {
          const updated = { ...prev };
          if (!updated[msg.counterpart]) {
            updated[msg.counterpart] = [];
          }
          // Check for duplicates
          if (!updated[msg.counterpart].find((m) => m.id === msg.id)) {
            updated[msg.counterpart].push(msg);
            updated[msg.counterpart].sort((a, b) => a.timestamp - b.timestamp);
          }
          return updated;
        });

        // Refresh threads
        void queryClient.invalidateQueries({ queryKey: ["sms-messenger", "threads"] });
        void fetchThreads().then((data) => {
          if (data.threads) {
            setThreads(data.threads);
          }
        });

        setMessageBody("");
        setSendError(null);
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
    mutationFn: ({ phoneNumber, displayName }: { phoneNumber: string; displayName: string }) =>
      createContact(phoneNumber, displayName),
    onSuccess: (data) => {
      if (data.success && data.contact) {
        setContacts((prev) => [...prev, data.contact]);
        void queryClient.invalidateQueries({ queryKey: ["sms-messenger", "contacts"] });
        setShowContactForm(false);
        setContactPhoneNumber("");
        setContactDisplayName("");
        setContactError(null);
      }
    },
    onError: (error: Error) => {
      setContactError(error.message);
    },
  });

  const handleCreateContact = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!contactPhoneNumber.trim() || !contactDisplayName.trim()) {
      setContactError("Please fill in all fields");
      return;
    }
    createContactMutation.mutate({
      phoneNumber: contactPhoneNumber.trim(),
      displayName: contactDisplayName.trim(),
    });
  };

  const handleSend = (e: React.FormEvent): void => {
    e.preventDefault();
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

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Conversations</h2>
          <button
            className={styles.addContactButton}
            onClick={() => setShowContactForm(true)}
            title="Add Contact"
          >
            +
          </button>
        </div>
        {showContactForm && (
          <div className={styles.contactForm}>
            <h3 className={styles.contactFormTitle}>Add Contact</h3>
            <form onSubmit={handleCreateContact}>
              {contactError && <div className={styles.error}>{contactError}</div>}
              <input
                type="tel"
                className={styles.contactInput}
                value={contactPhoneNumber}
                onChange={(e) => setContactPhoneNumber(e.target.value)}
                placeholder="Phone number (E.164)"
                required
              />
              <input
                type="text"
                className={styles.contactInput}
                value={contactDisplayName}
                onChange={(e) => setContactDisplayName(e.target.value)}
                placeholder="Display name"
                required
              />
              <div className={styles.contactFormActions}>
                <button
                  type="submit"
                  className={styles.contactSubmitButton}
                  disabled={createContactMutation.isPending}
                >
                  {createContactMutation.isPending ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  className={styles.contactCancelButton}
                  onClick={() => {
                    setShowContactForm(false);
                    setContactPhoneNumber("");
                    setContactDisplayName("");
                    setContactError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        <div className={styles.threadList}>
          {threads.length === 0 ? (
            <div className={styles.emptyState}>No conversations yet</div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.counterpart}
                className={`${styles.threadItem} ${
                  activeCounterpart === thread.counterpart ? styles.active : ""
                }`}
                onClick={() => handleThreadSelect(thread.counterpart)}
              >
                <div className={styles.threadName}>
                  {thread.contactName ?? thread.counterpart}
                </div>
                <div className={styles.threadPreview}>{thread.lastMessagePreview}</div>
                <div className={styles.threadTime}>
                  {formatTimestamp(thread.lastMessageTimestamp)}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className={styles.mainArea}>
        {activeCounterpart ? (
          <>
            <div className={styles.header}>
              <h2 className={styles.headerTitle}>
                {getContactName(activeCounterpart)}
              </h2>
              {activeCounterpart && !contacts.find((c) => c.phoneNumber === activeCounterpart) && (
                <button
                  className={styles.addContactToThreadButton}
                  onClick={() => {
                    setContactPhoneNumber(activeCounterpart);
                    setContactDisplayName("");
                    setContactError(null);
                    setShowContactForm(true);
                  }}
                  title="Add to contacts"
                >
                  Add Contact
                </button>
              )}
            </div>

            <div className={styles.messageList} ref={messageListRef}>
              <MessageList
                messages={activeMessages}
              />
            </div>

            <form className={styles.composer} onSubmit={handleSend}>
              {sendError && <div className={styles.error}>{sendError}</div>}
              <div className={styles.composerInputs}>
                <textarea
                  className={styles.messageInput}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Type a message..."
                  rows={3}
                  disabled={sending}
                />
                <button
                  type="submit"
                  className={styles.sendButton}
                  disabled={!messageBody.trim() || sending}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className={styles.emptyMain}>
            <p>Select a conversation or enter a phone number to start messaging</p>
            <div className={styles.newConversation}>
              <input
                type="tel"
                className={styles.phoneInput}
                value={draftNumber}
                onChange={(e) => setDraftNumber(e.target.value)}
                placeholder="Enter phone number (E.164 format)"
              />
              <button
                className={styles.startButton}
                onClick={() => {
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

