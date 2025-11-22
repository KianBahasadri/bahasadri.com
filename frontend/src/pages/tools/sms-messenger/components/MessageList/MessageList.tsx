import React from "react";
import type { Message } from "../../../../../types/sms-messenger";
import styles from "./MessageList.module.css";

interface MessageListProps {
  readonly messages: readonly Message[];
}

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

export default function MessageList({
  messages,
}: MessageListProps): React.JSX.Element {
  if (messages.length === 0) {
    return (
      <div className={styles["emptyState"]}>
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className={styles["messageList"]}>
      {messages.map((message) => {
        const isSent = message.direction === "sent";
        return (
          <div
            key={message.id}
            className={`${styles["message"] ?? ""} ${isSent ? styles["sent"] ?? "" : styles["received"] ?? ""}`}
          >
            <div className={styles["messageBubble"]}>
              <div className={styles["messageBody"]}>{message.body}</div>
              <div className={styles["messageMeta"]}>
                <span className={styles["messageTime"]}>
                  {formatTimestamp(message.timestamp)}
                </span>
                {message.status ? (
                  <span className={styles["messageStatus"]}>{message.status}</span>
                ) : undefined}
              </div>
              {message.errorMessage ? (
                <div className={styles["messageError"]}>{message.errorMessage}</div>
              ) : undefined}
            </div>
          </div>
        );
      })}
    </div>
  );
}

