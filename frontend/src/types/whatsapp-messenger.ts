export type MessageDirection = "sent" | "received";

export interface Message {
  id: string;
  direction: MessageDirection;
  phoneNumber: string;
  counterpart: string;
  body: string;
  timestamp: number;
  status?: "success" | "failed" | "pending";
  errorMessage?: string;
  contactId?: string;
  unread?: boolean;
}

export interface ThreadSummary {
  counterpart: string;
  lastMessagePreview: string;
  lastMessageTimestamp: number;
  lastDirection: MessageDirection;
  messageCount: number;
  unreadCount: number;
  contactId?: string;
  contactName?: string;
}

export interface Contact {
  id: string;
  phoneNumber: string;
  displayName: string;
  createdAt: number;
  updatedAt: number;
}

export interface SendWhatsAppRequest {
  phoneNumber: string;
  message: string;
  contactId?: string;
}

export interface SendWhatsAppResponse {
  success: boolean;
  message?: Message;
  error?: string;
}

export interface MessagesResponse {
  success: boolean;
  messages: Message[];
  cursor?: string;
  listComplete: boolean;
  error?: string;
}

export interface MessagesSinceResponse {
  success: boolean;
  messages: Message[];
  threads: ThreadSummary[];
  timestamp: number;
  error?: string;
}

export interface ThreadListResponse {
  threads: ThreadSummary[];
}

export interface ContactListResponse {
  contacts: Contact[];
}

export interface ContactCreatePayload {
  phoneNumber: string;
  displayName: string;
}

export interface ContactUpdatePayload {
  displayName: string;
}

export interface ContactMutationResult {
  success: boolean;
  contact?: Contact;
  error?: string;
}

