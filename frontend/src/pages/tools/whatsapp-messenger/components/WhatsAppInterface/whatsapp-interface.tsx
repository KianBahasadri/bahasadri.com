import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sendWhatsApp, fetchWhatsAppMessages, fetchWhatsAppThreads, fetchWhatsAppContacts } from "../../../../../lib/api";
import { ThreadSidebar } from "./ThreadSidebar";
import { MessageArea } from "./MessageArea";
import type { Message, ThreadSummary, Contact, MessagesSinceResponse } from "../../../../../types/whatsapp-messenger";
import { useMessagePolling } from "./use-message-polling";
import styles from "./whatsapp-interface.module.css";

interface WhatsAppInterfaceProps {
  readonly initialThreads: readonly ThreadSummary[];
  readonly initialMessages: readonly Message[];
  readonly initialContacts: readonly Contact[];
  readonly initialCounterpart: string | undefined;
}

function addMessageToCache(
  cache: Record<string, Message[]>,
  message: Message
): void {
  if (!(message.counterpart in cache)) {
    cache[message.counterpart] = [];
  }
  const messages = cache[message.counterpart];
  if (messages !== undefined && !messages.some((m) => m.id === message.id)) {
    messages.push(message);
  }
}

function sortMessagesByTimestamp(messages: Message[]): void {
  messages.sort((a, b) => a.timestamp - b.timestamp);
}

const updateMessageCache = (
  previous: Record<string, Message[]>,
  newMessages: Message[]
): Record<string, Message[]> => {
  const updated = { ...previous };

  for (const msg of newMessages) {
    addMessageToCache(updated, msg);
  }

  for (const messages of Object.values(updated)) {
    sortMessagesByTimestamp(messages);
  }

  return updated;
};

export default function WhatsAppInterface({
  initialThreads,
  initialContacts,
  initialCounterpart,
}: WhatsAppInterfaceProps): React.JSX.Element {
  const queryClient = useQueryClient();
  const [threads, setThreads] = useState<ThreadSummary[]>([...initialThreads]);
  const [contacts, setContacts] = useState<Contact[]>([...initialContacts]);
  const [messageCache, setMessageCache] = useState<Record<string, Message[]>>({});
  const [activeCounterpart, setActiveCounterpart] = useState<string | undefined>(initialCounterpart);
  const [draftNumber, setDraftNumber] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | undefined>(undefined);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactFormPhoneNumber, setContactFormPhoneNumber] = useState("");

  // Update threads when initialThreads prop changes (e.g., when query completes)
  useEffect(() => {
    setThreads([...initialThreads]);
  }, [initialThreads]);

  // Update contacts when initialContacts prop changes (e.g., when query completes)
  useEffect(() => {
    setContacts([...initialContacts]);
  }, [initialContacts]);

  // Fetch messages for active counterpart
  const { data: messagesData } = useQuery({
    queryKey: ["whatsapp-messenger", "messages", activeCounterpart],
    queryFn: async () => {
      if (!activeCounterpart) throw new Error("No counterpart selected");
      return await fetchWhatsAppMessages(activeCounterpart);
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

  // Merge threads with contacts to show all contacts in conversations tab
  const allThreads = useMemo(() => {
    const threadMap = new Map<string, ThreadSummary>();
    
    // Add all existing threads
    for (const thread of threads) {
      threadMap.set(thread.counterpart, thread);
    }
    
    // Add contacts that don't have threads
    for (const contact of contacts) {
      if (!threadMap.has(contact.phoneNumber)) {
        threadMap.set(contact.phoneNumber, {
          counterpart: contact.phoneNumber,
          lastMessagePreview: "",
          lastMessageTimestamp: contact.createdAt,
          lastDirection: "sent",
          messageCount: 0,
          unreadCount: 0,
          contactId: contact.id,
          contactName: contact.displayName,
        });
      }
    }
    
    // Convert to array and sort: threads with messages first (by timestamp), then contacts without messages (by name)
    const allThreadsArray = [...threadMap.values()];
    allThreadsArray.sort((a, b) => {
      // Threads with messages (messageCount > 0) come first
      if (a.messageCount > 0 && b.messageCount === 0) return -1;
      if (a.messageCount === 0 && b.messageCount > 0) return 1;
      
      // If both have messages or both don't, sort by timestamp (most recent first)
      if (a.messageCount > 0 && b.messageCount > 0) {
        return b.lastMessageTimestamp - a.lastMessageTimestamp;
      }
      
      // If both don't have messages, sort by contact name (alphabetically)
      const nameA = a.contactName ?? a.counterpart;
      const nameB = b.contactName ?? b.counterpart;
      return nameA.localeCompare(nameB);
    });
    
    return allThreadsArray;
  }, [threads, contacts]);


  // Handle polling response
  const handlePollResponse = useCallback(
    (response: MessagesSinceResponse) => {
      if (response.success && response.messages.length > 0) {
        setMessageCache((previous) => updateMessageCache(previous, response.messages));

        if (response.threads.length > 0) {
          setThreads(response.threads);
        }
      }
    },
    []
  );

  useMessagePolling(handlePollResponse);

  const addSingleMessageToCache = useCallback((message: Message): void => {
    setMessageCache((previous) => {
      const updated = { ...previous };
      addMessageToCache(updated, message);
      const messages = updated[message.counterpart];
      if (messages !== undefined) {
        sortMessagesByTimestamp(messages);
      }
      return updated;
    });
  }, []);

  // Send WhatsApp mutation
  const sendMutation = useMutation({
    mutationFn: async ({ phoneNumber, message }: { phoneNumber: string; message: string }) =>
      await sendWhatsApp(phoneNumber, message),
    onSuccess: (data) => {
      if (data.success && data.message) {
        addSingleMessageToCache(data.message);

        void queryClient.invalidateQueries({ queryKey: ["whatsapp-messenger", "threads"] });
        void fetchWhatsAppThreads().then((data) => {
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

  const handleContactFormSuccess = useCallback(() => {
    void (async (): Promise<void> => {
      setShowContactForm(false);
      setContactFormPhoneNumber("");
      const contactsData = await fetchWhatsAppContacts();
      setContacts(contactsData.contacts);
    })();
  }, []);

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

  const handleShowContactForm = (): void => {
    setShowContactForm(true);
  };

  const handleContactFormCancel = (): void => {
    setShowContactForm(false);
    setContactFormPhoneNumber("");
  };

  const handleStartConversation = (): void => {
    if (draftNumber.trim()) {
      setActiveCounterpart(draftNumber.trim());
    }
  };

  const handleShowContactFormFromThread = (): void => {
    if (activeCounterpart) {
      setContactFormPhoneNumber(activeCounterpart);
      setShowContactForm(true);
    }
  };

  return (
    <div className={styles["container"]}>
      <ThreadSidebar
        threads={allThreads}
        activeCounterpart={activeCounterpart}
        showContactForm={showContactForm}
        contactFormPhoneNumber={contactFormPhoneNumber}
        onThreadSelect={handleThreadSelect}
        onShowContactForm={handleShowContactForm}
        onContactFormCancel={handleContactFormCancel}
        onContactFormSuccess={handleContactFormSuccess}
      />
      <MessageArea
        activeCounterpart={activeCounterpart}
        messages={activeMessages}
        contacts={contacts}
        messageBody={messageBody}
        sending={sending}
        sendError={sendError}
        draftNumber={draftNumber}
        onMessageBodyChange={setMessageBody}
        onSend={handleSend}
        onDraftNumberChange={setDraftNumber}
        onStartConversation={handleStartConversation}
        onShowContactForm={handleShowContactFormFromThread}
      />
    </div>
  );
}

