import type {
  SendSMSRequest,
  SendSMSResponse,
  MessagesResponse,
  MessagesSinceResponse,
  ThreadListResponse,
  ContactListResponse,
  ContactCreatePayload,
  ContactMutationResult,
  ContactUpdatePayload,
} from "../types/sms-messenger";

const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://bahasadri.com/api"
    : "http://localhost:8787/api";

export const sendSMS = async (
  phoneNumber: string,
  message: string
): Promise<SendSMSResponse> => {
  const response = await fetch(`${API_BASE_URL}/tools/sms-messenger/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber, message } satisfies SendSMSRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send SMS");
  }

  return response.json();
};

export const fetchMessages = async (
  counterpart: string,
  cursor?: string,
  limit?: number
): Promise<MessagesResponse> => {
  const params = new URLSearchParams({ counterpart });
  if (cursor) params.append("cursor", cursor);
  if (limit) params.append("limit", limit.toString());

  const response = await fetch(
    `${API_BASE_URL}/tools/sms-messenger/messages?${params}`
  );
  if (!response.ok) throw new Error("Failed to fetch messages");
  return response.json();
};

export const pollMessagesSince = async (
  since: number
): Promise<MessagesSinceResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/tools/sms-messenger/messages-since?since=${since}`
  );
  if (!response.ok) throw new Error("Failed to poll messages");
  return response.json();
};

export const fetchThreads = async (): Promise<ThreadListResponse> => {
  const response = await fetch(`${API_BASE_URL}/tools/sms-messenger/threads`);
  if (!response.ok) throw new Error("Failed to fetch threads");
  return response.json();
};

export const fetchContacts = async (): Promise<ContactListResponse> => {
  const response = await fetch(`${API_BASE_URL}/tools/sms-messenger/contacts`);
  if (!response.ok) throw new Error("Failed to fetch contacts");
  return response.json();
};

export const createContact = async (
  phoneNumber: string,
  displayName: string
): Promise<ContactMutationResult> => {
  const response = await fetch(`${API_BASE_URL}/tools/sms-messenger/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber, displayName } satisfies ContactCreatePayload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create contact");
  }

  return response.json();
};

export const updateContact = async (
  contactId: string,
  displayName: string
): Promise<ContactMutationResult> => {
  const response = await fetch(
    `${API_BASE_URL}/tools/sms-messenger/contacts/${contactId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName } satisfies ContactUpdatePayload),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update contact");
  }

  return response.json();
};

