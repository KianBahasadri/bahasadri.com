import { Hono } from "hono";
import type { Env } from "../types/env";
import { handleError } from "../lib/error-handling";
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
import { sendWhatsApp, validateTwilioSignature } from "./lib/twilio";
import type {
  Message,
  SendWhatsAppRequest,
  SendWhatsAppResponse,
  MessagesResponse,
  MessagesSinceResponse,
  ThreadListResponse,
  ContactListResponse,
  ContactCreatePayload,
  ContactUpdatePayload,
  ContactMutationResult,
} from "./types";

const app = new Hono<{ Bindings: Env }>();

type HttpStatusCode = 400 | 404 | 500 | 502;

// Helper to get Twilio config from env
function getTwilioConfig(env: Env): { accountSid: string; authToken: string; whatsappNumber: string } {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    throw new Error("Twilio configuration is missing. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.");
  }
  
  // Use TWILIO_WHATSAPP_NUMBER if set
  // Note: WhatsApp requires the number to be registered as a WhatsApp Business sender
  // You cannot use a regular SMS number for WhatsApp - it must be registered separately
  // For testing, you can use the WhatsApp Sandbox: whatsapp:+14155238886
  const whatsappNumber = env.TWILIO_WHATSAPP_NUMBER;
  
  if (!whatsappNumber) {
    throw new Error("TWILIO_WHATSAPP_NUMBER is required. WhatsApp requires a number registered as a WhatsApp Business sender. For testing, use the WhatsApp Sandbox number: whatsapp:+14155238886. For production, register your number in the Twilio Console.");
  }
  
  return {
    accountSid: env.TWILIO_ACCOUNT_SID,
    authToken: env.TWILIO_AUTH_TOKEN,
    whatsappNumber,
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

// Helper to normalize WhatsApp phone number (strip whatsapp: prefix if present)
function normalizeWhatsAppNumber(phone: string): string {
  if (phone.startsWith("whatsapp:")) {
    return phone.slice(9);
  }
  return phone;
}

// POST /api/whatsapp-messenger/send
app.post("/send", async (c) => {
  try {
    const body = await c.req.json<SendWhatsAppRequest>();

    // Validate input
    const phoneValidation = validatePhoneNumber(body.phoneNumber);
    if (!phoneValidation.ok) {
      return c.json<SendWhatsAppResponse>(
        { success: false, error: phoneValidation.error },
        400
      );
    }

    const messageValidation = validateMessage(body.message);
    if (!messageValidation.ok) {
      return c.json<SendWhatsAppResponse>(
        { success: false, error: messageValidation.error },
        400
      );
    }

    const env = c.env;
    const timestamp = Date.now();
    const messageId = generateMessageId();
    const counterpart = body.phoneNumber;

    // Send WhatsApp via Twilio
    let errorMessage: string | undefined;

    let status: "success" | "failed" | "pending";
    try {
      const twilioConfig = getTwilioConfig(env);
      const result = await sendWhatsApp(twilioConfig, body.phoneNumber, body.message);
      status = result.status === "queued" || result.status === "sent" ? "success" : "failed";
    } catch (error) {
      const { response, status: errorStatus } = handleError(error, {
        endpoint: "/api/whatsapp-messenger/send",
        method: "POST",
        defaultMessage: "Twilio API error",
        additionalInfo: {
          step: "sendWhatsApp",
        },
      });
      return c.json<SendWhatsAppResponse>(
        { success: false, error: response.error },
        errorStatus as HttpStatusCode
      );
    }

    // Create message object
    const message: Message = {
      id: messageId,
      direction: "sent",
      phoneNumber: normalizeWhatsAppNumber(env.TWILIO_WHATSAPP_NUMBER),
      counterpart,
      body: body.message,
      timestamp,
      status,
      errorMessage,
      contactId: body.contactId,
    };

    // Store message in KV
    await storeMessage(env.WHATSAPP_MESSAGES, message);

    // Get contact if exists
    const contact = await getContactByPhoneNumber(env.WHATSAPP_MESSAGES, counterpart);

    // Update thread summary
    await updateThreadSummary(env.WHATSAPP_MESSAGES, message, contact);

    return c.json<SendWhatsAppResponse>({ success: true, message });
  } catch (error) {
    const { response, status } = handleError(error, {
      endpoint: "/api/whatsapp-messenger/send",
      method: "POST",
    });
    return c.json<SendWhatsAppResponse>(
      { success: false, error: response.error },
      status as HttpStatusCode | 502
    );
  }
});

// GET /api/whatsapp-messenger/messages
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
    const result = await getMessages(env.WHATSAPP_MESSAGES, counterpart, cursor, limit);

    return c.json<MessagesResponse>({
      success: true,
      messages: result.messages,
      cursor: result.cursor,
      listComplete: result.listComplete,
    });
  } catch (error) {
    const { response, status } = handleError(error, {
      endpoint: "/api/whatsapp-messenger/messages",
      method: "GET",
    });
    return c.json<MessagesResponse>(
      { success: false, messages: [], listComplete: true, error: response.error },
      status as HttpStatusCode
    );
  }
});

// GET /api/whatsapp-messenger/messages-since
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
    const messages = await getMessagesSince(env.WHATSAPP_MESSAGES, since);

    // Get thread summaries and enrich with contact info
    const threads = await getThreadSummaries(env.WHATSAPP_MESSAGES);
    const contacts = await getAllContacts(env.WHATSAPP_MESSAGES);

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
  } catch (error) {
    const { response, status } = handleError(error, {
      endpoint: "/api/whatsapp-messenger/messages-since",
      method: "GET",
    });
    return c.json<MessagesSinceResponse>(
      { success: false, messages: [], threads: [], timestamp: Date.now(), error: response.error },
      status as HttpStatusCode
    );
  }
});

// GET /api/whatsapp-messenger/threads
app.get("/threads", async (c) => {
  try {
    const env = c.env;
    const threads = await getThreadSummaries(env.WHATSAPP_MESSAGES);
    const contacts = await getAllContacts(env.WHATSAPP_MESSAGES);

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
  } catch (error) {
    const { response, status } = handleError(error, {
      endpoint: "/api/whatsapp-messenger/threads",
      method: "GET",
    });
    return c.json(
      { success: false, error: response.error },
      status as HttpStatusCode
    );
  }
});

// GET /api/whatsapp-messenger/contacts
app.get("/contacts", async (c) => {
  try {
    const env = c.env;
    const contacts = await getAllContacts(env.WHATSAPP_MESSAGES);
    return c.json<ContactListResponse>({ contacts });
  } catch (error) {
    const { response, status } = handleError(error, {
      endpoint: "/api/whatsapp-messenger/contacts",
      method: "GET",
    });
    return c.json(
      { success: false, error: response.error },
      status as HttpStatusCode
    );
  }
});

// POST /api/whatsapp-messenger/contacts
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
    const existing = await getContactByPhoneNumber(env.WHATSAPP_MESSAGES, body.phoneNumber);
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

    await storeContact(env.WHATSAPP_MESSAGES, contact);

    return c.json<ContactMutationResult>({ success: true, contact });
  } catch (error) {
    const { response, status } = handleError(error, {
      endpoint: "/api/whatsapp-messenger/contacts",
      method: "POST",
    });
    return c.json<ContactMutationResult>(
      { success: false, error: response.error },
      status as HttpStatusCode
    );
  }
});

// PATCH /api/whatsapp-messenger/contacts/:id
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
    const contact = await getContact(env.WHATSAPP_MESSAGES, contactId);
    if (!contact) {
      return c.json<ContactMutationResult>(
        { success: false, error: "Contact not found" },
        404
      );
    }

    // Update contact
    contact.displayName = body.displayName;
    contact.updatedAt = Date.now();

    await storeContact(env.WHATSAPP_MESSAGES, contact);

    return c.json<ContactMutationResult>({ success: true, contact });
  } catch (error) {
    const { response, status } = handleError(error, {
      endpoint: "/api/whatsapp-messenger/contacts/:id",
      method: "PATCH",
    });
    return c.json<ContactMutationResult>(
      { success: false, error: response.error },
      status as HttpStatusCode
    );
  }
});

// POST /api/whatsapp-messenger/webhook
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

    // Normalize phone numbers (strip whatsapp: prefix)
    const normalizedFrom = normalizeWhatsAppNumber(from);
    const normalizedTo = normalizeWhatsAppNumber(to);

    // Create message object
    const timestamp = Date.now();
    const messageId = messageSid || generateMessageId();
    const message: Message = {
      id: messageId,
      direction: "received",
      phoneNumber: normalizedTo,
      counterpart: normalizedFrom,
      body,
      timestamp,
      status: "success",
      unread: true,
    };

    // Store message in KV
    await storeMessage(env.WHATSAPP_MESSAGES, message);

    // Get contact if exists
    const contact = await getContactByPhoneNumber(env.WHATSAPP_MESSAGES, normalizedFrom);

    // Update thread summary
    await updateThreadSummary(env.WHATSAPP_MESSAGES, message, contact);

    // Return TwiML response
    return c.text('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', 200, {
      "Content-Type": "text/xml",
    });
  } catch (error) {
    const { response, status } = handleError(error, {
      endpoint: "/api/whatsapp-messenger/webhook",
      method: "POST",
    });
    return c.text(response.error, status as 400 | 404 | 500);
  }
});

export default app;

