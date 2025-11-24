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
import type {
    CalculateRequest,
    CalculateResponse,
    ErrorResponse,
} from "../types/calculator";
import type {
    WelcomeResponse,
    ChatRequest,
    ChatResponse,
    ConversationHistoryResponse,
} from "../types/home";
import type {
    GlobalRoomResponse,
    CreateSessionRequest,
    CreateSessionResponse,
    GenerateTokenRequest,
    GenerateTokenResponse,
    ErrorResponse as VideoCallErrorResponse,
} from "../types/video-call";

const API_BASE_URL =
    import.meta.env.MODE === "production"
        ? "https://bahasadri.com/api"
        : "http://localhost:8787/api";

export const sendSMS = async (
    phoneNumber: string,
    message: string
): Promise<SendSMSResponse> => {
    const response = await fetch(`${API_BASE_URL}/sms-messenger/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, message } satisfies SendSMSRequest),
    });

    if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error ?? "Failed to send SMS");
    }

    return response.json() as Promise<SendSMSResponse>;
};

export const fetchMessages = async (
    counterpart: string,
    cursor?: string,
    limit?: number
): Promise<MessagesResponse> => {
    const params = new URLSearchParams({ counterpart });
    if (cursor) params.append("cursor", cursor);
    if (limit) params.append("limit", String(limit));

    const response = await fetch(
        `${API_BASE_URL}/sms-messenger/messages?${params}`
    );
    if (!response.ok) throw new Error("Failed to fetch messages");
    return response.json() as Promise<MessagesResponse>;
};

export const pollMessagesSince = async (
    since: number
): Promise<MessagesSinceResponse> => {
    const response = await fetch(
        `${API_BASE_URL}/sms-messenger/messages-since?since=${String(since)}`
    );
    if (!response.ok) throw new Error("Failed to poll messages");
    return response.json() as Promise<MessagesSinceResponse>;
};

export const fetchThreads = async (): Promise<ThreadListResponse> => {
    const response = await fetch(`${API_BASE_URL}/sms-messenger/threads`);
    if (!response.ok) throw new Error("Failed to fetch threads");
    return response.json() as Promise<ThreadListResponse>;
};

export const fetchContacts = async (): Promise<ContactListResponse> => {
    const response = await fetch(`${API_BASE_URL}/sms-messenger/contacts`);
    if (!response.ok) throw new Error("Failed to fetch contacts");
    return response.json() as Promise<ContactListResponse>;
};

export const createContact = async (
    phoneNumber: string,
    displayName: string
): Promise<ContactMutationResult> => {
    const response = await fetch(`${API_BASE_URL}/sms-messenger/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            phoneNumber,
            displayName,
        } satisfies ContactCreatePayload),
    });

    if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error ?? "Failed to create contact");
    }

    return response.json() as Promise<ContactMutationResult>;
};

export const updateContact = async (
    contactId: string,
    displayName: string
): Promise<ContactMutationResult> => {
    const response = await fetch(
        `${API_BASE_URL}/sms-messenger/contacts/${contactId}`,
        {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                displayName,
            } satisfies ContactUpdatePayload),
        }
    );

    if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error ?? "Failed to update contact");
    }

    return response.json() as Promise<ContactMutationResult>;
};

export const calculateExpression = async (
    expression: string
): Promise<CalculateResponse> => {
    const response = await fetch(`${API_BASE_URL}/calculator/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression } satisfies CalculateRequest),
    });

    if (!response.ok) {
        const error = (await response.json()) as ErrorResponse;
        throw new Error(error.error || "Calculation failed");
    }

    return response.json() as Promise<CalculateResponse>;
};

export const fetchWelcomeMessage = async (): Promise<WelcomeResponse> => {
    const response = await fetch(`${API_BASE_URL}/home/welcome`);
    if (!response.ok) {
        throw new Error("Failed to fetch welcome message");
    }
    return response.json() as Promise<WelcomeResponse>;
};

export const fetchConversationHistory =
    async (): Promise<ConversationHistoryResponse> => {
        const response = await fetch(`${API_BASE_URL}/home/chat`);

        if (!response.ok) {
            const error = (await response.json()) as { error?: string };
            throw new Error(error.error ?? "Failed to fetch conversation history");
        }

        return response.json() as Promise<ConversationHistoryResponse>;
    };

export const sendChatMessage = async (
    message: string,
    conversationId?: string
): Promise<ChatResponse> => {
    const body: ChatRequest = { message };
    if (conversationId) {
        body.conversationId = conversationId;
    }

    const response = await fetch(`${API_BASE_URL}/home/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error ?? "Failed to send message");
    }

    return response.json() as Promise<ChatResponse>;
};

export const fetchGlobalRoom = async (): Promise<GlobalRoomResponse> => {
    const response = await fetch(`${API_BASE_URL}/video-call/global-room`);
    if (!response.ok) {
        const error: VideoCallErrorResponse = await response.json();
        throw new Error(error.error || "Failed to fetch global room");
    }
    return response.json() as Promise<GlobalRoomResponse>;
};

export const createSession = async (
    name?: string
): Promise<CreateSessionResponse> => {
    const body: CreateSessionRequest = {};
    if (name) {
        body.name = name;
    }
    const response = await fetch(`${API_BASE_URL}/video-call/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error: VideoCallErrorResponse = await response.json();
        throw new Error(error.error || "Failed to create session");
    }

    return response.json() as Promise<CreateSessionResponse>;
};

export const generateToken = async (
    meetingId: string,
    name?: string,
    customParticipantId?: string,
    presetName?: string
): Promise<GenerateTokenResponse> => {
    const body: GenerateTokenRequest = {
        meeting_id: meetingId,
    };
    if (name) {
        body.name = name;
    }
    if (customParticipantId) {
        body.custom_participant_id = customParticipantId;
    }
    if (presetName) {
        body.preset_name = presetName;
    }
    const response = await fetch(`${API_BASE_URL}/video-call/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error: VideoCallErrorResponse = await response.json();
        throw new Error(error.error || "Failed to generate token");
    }

    return response.json() as Promise<GenerateTokenResponse>;
};
