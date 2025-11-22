import { Hono } from "hono";
import type { Env } from "../types/env";
import { validatePhoneNumber, validateMessage, validateDisplayName } from "./lib/validation";
import {
  storeMessage,
  getMessages,
  getMessagesSince,
  updateThreadSummary,
  getThreadSummaries,
  storeContact,
  getContact,
  getContactByPhoneNumber,
  getAllContacts,
} from "./lib/kv-helpers";
import { sendSMS, validateTwilioSignature } from "./lib/twilio";
import type {
  Message,
  SendSMSRequest,
  SendSMSResponse,
  MessagesResponse,
  MessagesSinceResponse,
  ThreadListResponse,
  ContactListResponse,
  ContactCreatePayload,
  ContactUpdatePayload,
  ContactMutationResult,
} from "./types";

const app = new Hono<{ Bindings: Env }>();

// Helper to get Twilio config from env
function getTwilioConfig(env: Env): { accountSid: string; authToken: string; phoneNumber: string } {
  return {
    accountSid: env.TWILIO_ACCOUNT_SID,
    authToken: env.TWILIO_AUTH_TOKEN,
    phoneNumber: env.TWILIO_PHONE_NUMBER,
  };
}

// Helper to generate message ID
function generateMessageId(): string {
  // Using crypto for better randomness instead of Math.random
  const randomBytes = crypto.getRandomValues(new Uint8Array(4));
  const randomString = Array.from(randomBytes, (byte) => byte.toString(36)).join("").slice(0, 7);
  return `${String(Date.now())}-${randomString}`;
}

// Helper to generate contact ID (UUID v4)
function generateContactId(): string {
  return crypto.randomUUID();
}

// POST /api/sms-messenger/send
app.post("/send", async (c) => {
  try {
    const body = await c.req.json<SendSMSRequest>();

    // Validate input
    const phoneValidation = validatePhoneNumber(body.phoneNumber);
    if (!phoneValidation.ok) {
      return c.json<SendSMSResponse>(
        { success: false, error: phoneValidation.error },
        400
      );
    }

    const messageValidation = validateMessage(body.message);
    if (!messageValidation.ok) {
      return c.json<SendSMSResponse>(
        { success: false, error: messageValidation.error },
        400
      );
    }

    const env = c.env;
    const timestamp = Date.now();
    const messageId = generateMessageId();
    const counterpart = body.phoneNumber;

    // Send SMS via Twilio
    let errorMessage: string | undefined;

    let status: "success" | "failed" | "pending";
    try {
      const twilioConfig = getTwilioConfig(env);
      const result = await sendSMS(twilioConfig, body.phoneNumber, body.message);
      status = result.status === "queued" || result.status === "sent" ? "success" : "failed";
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Twilio API error";
      return c.json<SendSMSResponse>(
        { success: false, error: errorMessage },
        502
      );
    }

    // Create message object
    const message: Message = {
      id: messageId,
      direction: "sent",
      phoneNumber: env.TWILIO_PHONE_NUMBER,
      counterpart,
      body: body.message,
      timestamp,
      status,
      errorMessage,
    };

    // Store message in KV
    await storeMessage(env.SMS_MESSAGES, message);

    // Get contact if exists
    const contact = await getContactByPhoneNumber(env.SMS_MESSAGES, counterpart);

    // Update thread summary
    await updateThreadSummary(env.SMS_MESSAGES, message, contact);

    return c.json<SendSMSResponse>({ success: true, message });
  } catch {
    return c.json<SendSMSResponse>(
      { success: false, error: "Internal server error" },
      500
    );
  }
});

// GET /api/sms-messenger/messages
app.get("/messages", async (c) => {
  try {
    const counterpart = c.req.query("counterpart");
    if (!counterpart) {
      return c.json<MessagesResponse>(
        { success: false, messages: [], listComplete: true, error: "Missing counterpart parameter" },
        400
      );
    }

    const cursor = c.req.query("cursor");
    const limitParam = c.req.query("limit");
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 50;

    const env = c.env;
    const result = await getMessages(env.SMS_MESSAGES, counterpart, cursor, limit);

    return c.json<MessagesResponse>({
      success: true,
      messages: result.messages,
      cursor: result.cursor,
      listComplete: result.listComplete,
    });
  } catch {
    return c.json<MessagesResponse>(
      { success: false, messages: [], listComplete: true, error: "Internal server error" },
      500
    );
  }
});

// GET /api/sms-messenger/messages-since
app.get("/messages-since", async (c) => {
  try {
    const sinceParam = c.req.query("since");
    if (!sinceParam) {
      return c.json<MessagesSinceResponse>(
        { success: false, messages: [], threads: [], timestamp: Date.now(), error: "Missing since parameter" },
        400
      );
    }

    const since = Number.parseInt(sinceParam, 10);
    if (Number.isNaN(since) || since < 0) {
      return c.json<MessagesSinceResponse>(
        { success: false, messages: [], threads: [], timestamp: Date.now(), error: "Invalid timestamp" },
        400
      );
    }

    const env = c.env;
    const messages = await getMessagesSince(env.SMS_MESSAGES, since);

    // Get thread summaries and enrich with contact info
    const threads = await getThreadSummaries(env.SMS_MESSAGES);
    const contacts = await getAllContacts(env.SMS_MESSAGES);

    // Enrich threads with contact names
    const enrichedThreads = threads.map((thread) => {
      if (thread.contactId) {
        const contact = contacts.find((c) => c.id === thread.contactId);
        if (contact) {
          thread.contactName = contact.displayName;
        }
      }
      return thread;
    });

    return c.json<MessagesSinceResponse>({
      success: true,
      messages,
      threads: enrichedThreads,
      timestamp: Date.now(),
    });
  } catch {
    return c.json<MessagesSinceResponse>(
      { success: false, messages: [], threads: [], timestamp: Date.now(), error: "Internal server error" },
      500
    );
  }
});

// GET /api/sms-messenger/threads
app.get("/threads", async (c) => {
  try {
    const env = c.env;
    const threads = await getThreadSummaries(env.SMS_MESSAGES);
    const contacts = await getAllContacts(env.SMS_MESSAGES);

    // Enrich threads with contact names
    const enrichedThreads = threads.map((thread) => {
      if (thread.contactId) {
        const contact = contacts.find((c) => c.id === thread.contactId);
        if (contact) {
          thread.contactName = contact.displayName;
        }
      }
      return thread;
    });

    return c.json<ThreadListResponse>({ threads: enrichedThreads });
  } catch {
    return c.json(
      { success: false, error: "Internal server error" },
      500
    );
  }
});

// GET /api/sms-messenger/contacts
app.get("/contacts", async (c) => {
  try {
    const env = c.env;
    const contacts = await getAllContacts(env.SMS_MESSAGES);
    return c.json<ContactListResponse>({ contacts });
  } catch {
    return c.json(
      { success: false, error: "Internal server error" },
      500
    );
  }
});

// POST /api/sms-messenger/contacts
app.post("/contacts", async (c) => {
  try {
    const body = await c.req.json<ContactCreatePayload>();

    // Validate input
    const phoneValidation = validatePhoneNumber(body.phoneNumber);
    if (!phoneValidation.ok) {
      return c.json<ContactMutationResult>(
        { success: false, error: phoneValidation.error },
        400
      );
    }

    const nameValidation = validateDisplayName(body.displayName);
    if (!nameValidation.ok) {
      return c.json<ContactMutationResult>(
        { success: false, error: nameValidation.error },
        400
      );
    }

    const env = c.env;

    // Check for duplicate phone number
    const existing = await getContactByPhoneNumber(env.SMS_MESSAGES, body.phoneNumber);
    if (existing) {
      return c.json<ContactMutationResult>(
        { success: false, error: "Contact with this phone number already exists" },
        400
      );
    }

    // Create contact
    const now = Date.now();
    const contact = {
      id: generateContactId(),
      phoneNumber: body.phoneNumber,
      displayName: body.displayName,
      createdAt: now,
      updatedAt: now,
    };

    await storeContact(env.SMS_MESSAGES, contact);

    return c.json<ContactMutationResult>({ success: true, contact });
  } catch {
    return c.json<ContactMutationResult>(
      { success: false, error: "Internal server error" },
      500
    );
  }
});

// PATCH /api/sms-messenger/contacts/:id
app.patch("/contacts/:id", async (c) => {
  try {
    const contactId = c.req.param("id");
    const body = await c.req.json<ContactUpdatePayload>();

    // Validate input
    const nameValidation = validateDisplayName(body.displayName);
    if (!nameValidation.ok) {
      return c.json<ContactMutationResult>(
        { success: false, error: nameValidation.error },
        400
      );
    }

    const env = c.env;

    // Get existing contact
    const contact = await getContact(env.SMS_MESSAGES, contactId);
    if (!contact) {
      return c.json<ContactMutationResult>(
        { success: false, error: "Contact not found" },
        404
      );
    }

    // Update contact
    contact.displayName = body.displayName;
    contact.updatedAt = Date.now();

    await storeContact(env.SMS_MESSAGES, contact);

    return c.json<ContactMutationResult>({ success: true, contact });
  } catch {
    return c.json<ContactMutationResult>(
      { success: false, error: "Internal server error" },
      500
    );
  }
});

// POST /api/sms-messenger/webhook
app.post("/webhook", async (c) => {
  try {
    const env = c.env;

    // Parse form data
    const formData = await c.req.formData();
    const params: Record<string, string> = {};
    // FormData iteration - using type assertion for Cloudflare Workers compatibility
    const formDataEntries = formData as unknown as Iterable<[string, FormDataEntryValue]>;
    for (const [key, value] of formDataEntries) {
      if (typeof value === "string") {
        params[key] = value;
      } else if (value instanceof File) {
        params[key] = value.name;
      } else {
        params[key] = String(value);
      }
    }

    // Validate Twilio signature
    const signature = c.req.header("X-Twilio-Signature");
    if (!signature) {
      return c.text("Missing signature", 403);
    }

    const url = new URL(c.req.url);
    const isValid = await validateTwilioSignature(
      url.toString(),
      params,
      env.TWILIO_AUTH_TOKEN,
      signature
    );

    if (!isValid) {
      return c.text("Invalid signature", 403);
    }

    // Extract message data
    const from = params.From;
    const to = params.To;
    const body = params.Body || "";
    const messageSid = params.MessageSid || "";

    if (!from || !to) {
      return c.text("Missing required fields", 400);
    }

    // Create message object
    const timestamp = Date.now();
    const messageId = messageSid || generateMessageId();
    const message: Message = {
      id: messageId,
      direction: "received",
      phoneNumber: from,
      counterpart: from,
      body,
      timestamp,
      status: "success",
    };

    // Store message in KV
    await storeMessage(env.SMS_MESSAGES, message);

    // Get contact if exists
    const contact = await getContactByPhoneNumber(env.SMS_MESSAGES, from);

    // Update thread summary
    await updateThreadSummary(env.SMS_MESSAGES, message, contact);

    // Return TwiML response
    return c.text('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', 200, {
      "Content-Type": "text/xml",
    });
  } catch {
    return c.text("Internal server error", 500);
  }
});

export default app;

