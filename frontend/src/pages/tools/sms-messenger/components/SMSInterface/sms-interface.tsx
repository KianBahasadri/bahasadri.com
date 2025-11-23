import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sendSMS, fetchMessages, fetchThreads, fetchContacts } from "../../../../../lib/api";
import { ThreadSidebar } from "./ThreadSidebar";
import { MessageArea } from "./MessageArea";
import type { Message, ThreadSummary, Contact } from "../../../../../types/sms-messenger";
import { useMessagePolling } from "./useMessagePolling";
import styles from "./sms-interface.module.css";

interface SMSInterfaceProps {
  readonly initialThreads: readonly ThreadSummary[];
  readonly initialMessages: readonly Message[];
  readonly initialContacts: readonly Contact[];
  readonly initialCounterpart: string | undefined;
}

const POLL_INTERVAL = 2000; // 2 seconds
const POLL_MAX_ATTEMPTS = 1000;

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
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactFormPhoneNumber, setContactFormPhoneNumber] = useState("");

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


  // Handle polling response
  const handlePollResponse = useCallback(
    (response: Awaited<ReturnType<typeof import("../../../../../lib/api").pollMessagesSince>>) => {
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

  // Send SMS mutation
  const sendMutation = useMutation({
    mutationFn: async ({ phoneNumber, message }: { phoneNumber: string; message: string }) =>
      await sendSMS(phoneNumber, message),
    onSuccess: (data) => {
      if (data.success && data.message) {
        addSingleMessageToCache(data.message);

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

  const handleContactFormSuccess = useCallback(async () => {
    setShowContactForm(false);
    setContactFormPhoneNumber("");
    const contactsData = await fetchContacts();
    setContacts(contactsData.contacts);
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
        threads={threads}
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

