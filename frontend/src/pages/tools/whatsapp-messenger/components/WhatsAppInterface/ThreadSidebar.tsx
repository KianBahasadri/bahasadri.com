import React from "react";
import { ContactForm } from "./ContactForm";
import type { ThreadSummary } from "../../../../../types/whatsapp-messenger";
import styles from "./whatsapp-interface.module.css";

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

interface ThreadSidebarProps {
  readonly threads: readonly ThreadSummary[];
  readonly activeCounterpart: string | undefined;
  readonly showContactForm: boolean;
  readonly contactFormPhoneNumber: string;
  readonly onThreadSelect: (counterpart: string) => void;
  readonly onShowContactForm: () => void;
  readonly onContactFormCancel: () => void;
  readonly onContactFormSuccess: () => void;
}

export function ThreadSidebar({
  threads,
  activeCounterpart,
  showContactForm,
  contactFormPhoneNumber,
  onThreadSelect,
  onShowContactForm,
  onContactFormCancel,
  onContactFormSuccess,
}: ThreadSidebarProps): React.JSX.Element {
  return (
    <div className={styles["sidebar"]}>
      <div className={styles["sidebarHeader"]}>
        <h2 className={styles["sidebarTitle"]}>WhatsApp</h2>
        <button
          className={styles["addContactButton"]}
          onClick={onShowContactForm}
          title="Add Contact"
        >
          +
        </button>
      </div>
      {showContactForm ? (
        <ContactForm
          initialPhoneNumber={contactFormPhoneNumber}
          onCancel={onContactFormCancel}
          onSuccess={onContactFormSuccess}
        />
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
                onThreadSelect(thread.counterpart);
              }}
            >
              <div className={styles["threadName"]}>
                {thread.contactName ?? thread.counterpart}
                {thread.unreadCount > 0 ? (
                  <span className={styles["unreadBadge"]}>{thread.unreadCount}</span>
                ) : undefined}
              </div>
              <div className={styles["threadPreview"]}>
                {thread.lastMessagePreview || (thread.messageCount === 0 ? "No messages yet" : "")}
              </div>
              <div className={styles["threadTime"]}>
                {formatTimestamp(thread.lastMessageTimestamp)}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

