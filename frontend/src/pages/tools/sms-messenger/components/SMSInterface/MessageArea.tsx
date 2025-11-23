import React, { useRef, useEffect } from "react";
import MessageList from "../MessageList/MessageList";
import type { Message, Contact } from "../../../../../types/sms-messenger";
import styles from "./sms-interface.module.css";

interface MessageAreaProps {
  readonly activeCounterpart: string | undefined;
  readonly messages: readonly Message[];
  readonly contacts: readonly Contact[];
  readonly messageBody: string;
  readonly sending: boolean;
  readonly sendError: string | undefined;
  readonly draftNumber: string;
  readonly onMessageBodyChange: (value: string) => void;
  readonly onSend: (event: React.FormEvent) => void;
  readonly onDraftNumberChange: (value: string) => void;
  readonly onStartConversation: () => void;
  readonly onShowContactForm: () => void;
}

export function MessageArea({
  activeCounterpart,
  messages,
  contacts,
  messageBody,
  sending,
  sendError,
  draftNumber,
  onMessageBodyChange,
  onSend,
  onDraftNumberChange,
  onStartConversation,
  onShowContactForm,
}: MessageAreaProps): React.JSX.Element {
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const getContactName = (phoneNumber: string): string => {
    const contact = contacts.find((c) => c.phoneNumber === phoneNumber);
    return contact?.displayName ?? phoneNumber;
  };

  return (
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
                onClick={onShowContactForm}
                title="Add to contacts"
              >
                Add Contact
              </button>
            ) : undefined}
          </div>

          <div className={styles["messageList"]} ref={messageListRef}>
            <MessageList messages={messages} />
          </div>

          <form className={styles["composer"]} onSubmit={onSend}>
            {sendError ? <div className={styles["error"]}>{sendError}</div> : undefined}
            <div className={styles["composerInputs"]}>
              <textarea
                className={styles["messageInput"]}
                value={messageBody}
                onChange={(event) => {
                  onMessageBodyChange(event.target.value);
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
                onDraftNumberChange(event.target.value);
              }}
              placeholder="Enter phone number (E.164 format)"
            />
            <button
              className={styles["startButton"]}
              onClick={onStartConversation}
            >
              Start Conversation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

