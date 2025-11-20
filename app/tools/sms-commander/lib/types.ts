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
    /** Collection of tracked messages */
    messages: Message[];
    /** Cursor for pagination (if more results exist) */
    cursor?: string;
    /** Indicates whether KV returned all messages in current batch */
    listComplete: boolean;
}
