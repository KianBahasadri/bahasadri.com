/**
 * SMS Commander Type Definitions
 *
 * These interfaces and types describe the data structures shared between
 * server-side route handlers and client-side components. Keeping them in a
 * dedicated module ensures a single source of truth for message shapes,
 * API responses, and validation contracts.
 *
 * @see ../../../../docs/AI_AGENT_STANDARDS.md - Documentation requirements
 * @see ../PLAN.md - Utility planning and architecture details
 */

export type MessageDirection = "sent" | "received";

/**
 * Represents a single SMS message tracked by the utility.
 */
export interface Message {
    /** Unique identifier for the message */
    id: string;
    /** Indicates whether the message was sent or received */
    direction: MessageDirection;
    /** Phone number in E.164 format */
    phoneNumber: string;
    /** Phone number the message was sent from/to */
    counterpart: string;
    /** The text body of the SMS message */
    body: string;
    /** Unix timestamp (ms) indicating when the message event occurred */
    timestamp: number;
    /** Optional delivery status reported by Twilio */
    status?: "success" | "failed" | "pending";
    /** Optional error message if delivery failed */
    errorMessage?: string;
    /** Optional Twilio SID associated with the message */
    twilioSid?: string;
    /** Optional resolved contact identifier */
    contactId?: string;
}

/**
 * Request payload for sending an SMS message.
 */
export interface SendSMSRequest {
    /** Target recipient phone number in E.164 format */
    phoneNumber: string;
    /** Message content */
    message: string;
}

/**
 * Response payload for the Send SMS API endpoint.
 */
export interface SendSMSResponse {
    /** Indicates whether the send operation succeeded */
    success: boolean;
    /** Message record that was stored (if any) */
    message?: Message;
    /** Error description when success is false */
    error?: string;
}

/**
 * Structure returned by the history API route.
 */
export interface MessageHistoryResponse {
    /** Counterpart phone number these messages belong to */
    counterpart: string;
    /** Collection of tracked messages */
    messages: Message[];
    /** Cursor for pagination (if more results exist) */
    cursor?: string;
    /** Indicates whether KV returned all messages in current batch */
    listComplete: boolean;
    /** Optional error description when request fails */
    error?: string;
}

/**
 * Represents a lightweight chat thread summary scoped to a single counterpart.
 */
export interface ThreadSummary {
    /** Counterpart phone number */
    counterpart: string;
    /** Last message preview snippet */
    lastMessagePreview: string;
    /** Timestamp of most recent message */
    lastMessageTimestamp: number;
    /** Direction of most recent message */
    lastDirection: MessageDirection;
    /** Total messages tracked for this counterpart */
    messageCount: number;
    /** Optional linked contact identifier */
    contactId?: string;
    /** Optional linked contact name */
    contactName?: string;
}

/**
 * Response payload for the thread list endpoint.
 */
export interface ThreadListResponse {
    threads: ThreadSummary[];
}

/**
 * Contact profile representing a saved alias for a given phone number.
 */
export interface Contact {
    id: string;
    phoneNumber: string;
    displayName: string;
    notes?: string;
    createdAt: number;
    updatedAt: number;
}

export interface ContactListResponse {
    contacts: Contact[];
}

export interface ContactCreatePayload {
    phoneNumber: string;
    displayName: string;
    notes?: string;
}

export interface ContactMutationResult {
    success: boolean;
    contact?: Contact;
    error?: string;
}
