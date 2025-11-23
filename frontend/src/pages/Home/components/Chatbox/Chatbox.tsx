import React, { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { sendChatMessage } from "../../../../lib/api";
import type { ChatMessage } from "../../../../types/home";
import styles from "./Chatbox.module.css";

interface ChatboxProps {
  onClose: () => void;
}

export default function Chatbox({ onClose }: ChatboxProps): React.JSX.Element {
  const [messageInput, setMessageInput] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>(
    undefined
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      return await sendChatMessage(message, conversationId);
    },
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          content: data.response,
          timestamp: Date.now(),
        },
      ]);
    },
    onError: (error: Error) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "agent",
          content: `Sorry, I couldn't process that. ${error.message} ♡`,
          timestamp: Date.now(),
        },
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const trimmedMessage = messageInput.trim();
    if (!trimmedMessage || chatMutation.isPending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedMessage,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessageInput("");
    chatMutation.mutate(trimmedMessage);
  };

  return (
    <div className={styles.chatbox}>
      <div className={styles.chatHeader}>
        <h2 className={styles.chatTitle}>Chat with me~ ♡</h2>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close chat"
          aria-expanded="true"
        >
          💔
        </button>
      </div>

      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Start a conversation with me~ ♡</p>
          </div>
        ) : (
          <div className={styles.messagesList}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.role === "user" ? styles.userMessage : styles.agentMessage
                }`}
              >
                <div className={styles.messageContent}>{message.content}</div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className={`${styles.message} ${styles.agentMessage}`}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form className={styles.inputForm} onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          className={styles.messageInput}
          value={messageInput}
          onChange={(e) => {
            setMessageInput(e.target.value);
          }}
          placeholder="Type a message..."
          rows={2}
          disabled={chatMutation.isPending}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={!messageInput.trim() || chatMutation.isPending}
        >
          Send
        </button>
      </form>
    </div>
  );
}

