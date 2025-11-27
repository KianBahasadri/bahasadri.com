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
    SendWhatsAppRequest,
    SendWhatsAppResponse,
    MessagesResponse as WhatsAppMessagesResponse,
    MessagesSinceResponse as WhatsAppMessagesSinceResponse,
    ThreadListResponse as WhatsAppThreadListResponse,
    ContactListResponse as WhatsAppContactListResponse,
    ContactCreatePayload as WhatsAppContactCreatePayload,
    ContactMutationResult as WhatsAppContactMutationResult,
    ContactUpdatePayload as WhatsAppContactUpdatePayload,
} from "../types/whatsapp-messenger";
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
    CreateSessionRequest,
    CreateSessionResponse,
    GenerateTokenRequest,
    GenerateTokenResponse,
    ListSessionsResponse,
    ListMeetingsResponse,
    ListPresetsResponse,
    DeleteMeetingResponse,
} from "../types/video-call";
import type {
    MovieSearchResponse,
    MovieDetails,
    ReleasesResponse,
    SimilarMoviesResponse,
    FetchMovieRequest,
    FetchMovieResponse,
    JobStatus,
    StreamResponse,
    WatchHistoryResponse,
} from "../types/movies-on-demand";
import type { UploadResponse, FileListResponse } from "../types/file-hosting";

const API_BASE_URL =
    import.meta.env.MODE === "production"
        ? "https://bahasadri.com/api"
        : "http://localhost:8787/api";

/**
 * Handles API error responses with logging
 */
async function handleApiError(
    response: Response,
    endpoint: string,
    defaultMessage: string
): Promise<never> {
    let errorData: { error?: string; code?: string };
    try {
        errorData = (await response.json()) as {
            error?: string;
            code?: string;
        };
    } catch {
        errorData = {};
    }

    const errorMessage = errorData.error ?? defaultMessage;
    console.error(`[API] ${endpoint} failed:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        code: errorData.code,
    });

    throw new Error(errorMessage);
}

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

export const sendWhatsApp = async (
    phoneNumber: string,
    message: string,
    contactId?: string
): Promise<SendWhatsAppResponse> => {
    const body: SendWhatsAppRequest = { phoneNumber, message };
    if (contactId) {
        body.contactId = contactId;
    }
    const response = await fetch(`${API_BASE_URL}/whatsapp-messenger/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error ?? "Failed to send WhatsApp message");
    }

    return response.json() as Promise<SendWhatsAppResponse>;
};

export const fetchWhatsAppMessages = async (
    counterpart: string,
    cursor?: string,
    limit?: number
): Promise<WhatsAppMessagesResponse> => {
    const params = new URLSearchParams({ counterpart });
    if (cursor) params.append("cursor", cursor);
    if (limit) params.append("limit", String(limit));

    const response = await fetch(
        `${API_BASE_URL}/whatsapp-messenger/messages?${params}`
    );
    if (!response.ok) throw new Error("Failed to fetch messages");
    return response.json() as Promise<WhatsAppMessagesResponse>;
};

export const pollWhatsAppMessagesSince = async (
    since: number
): Promise<WhatsAppMessagesSinceResponse> => {
    const response = await fetch(
        `${API_BASE_URL}/whatsapp-messenger/messages-since?since=${String(
            since
        )}`
    );
    if (!response.ok) throw new Error("Failed to poll messages");
    return response.json() as Promise<WhatsAppMessagesSinceResponse>;
};

export const fetchWhatsAppThreads =
    async (): Promise<WhatsAppThreadListResponse> => {
        const response = await fetch(
            `${API_BASE_URL}/whatsapp-messenger/threads`
        );
        if (!response.ok) throw new Error("Failed to fetch threads");
        return response.json() as Promise<WhatsAppThreadListResponse>;
    };

export const fetchWhatsAppContacts =
    async (): Promise<WhatsAppContactListResponse> => {
        const response = await fetch(
            `${API_BASE_URL}/whatsapp-messenger/contacts`
        );
        if (!response.ok) throw new Error("Failed to fetch contacts");
        return response.json() as Promise<WhatsAppContactListResponse>;
    };

export const createWhatsAppContact = async (
    phoneNumber: string,
    displayName: string
): Promise<WhatsAppContactMutationResult> => {
    const response = await fetch(
        `${API_BASE_URL}/whatsapp-messenger/contacts`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phoneNumber,
                displayName,
            } satisfies WhatsAppContactCreatePayload),
        }
    );

    if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error ?? "Failed to create contact");
    }

    return response.json() as Promise<WhatsAppContactMutationResult>;
};

export const updateWhatsAppContact = async (
    contactId: string,
    displayName: string
): Promise<WhatsAppContactMutationResult> => {
    const response = await fetch(
        `${API_BASE_URL}/whatsapp-messenger/contacts/${contactId}`,
        {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                displayName,
            } satisfies WhatsAppContactUpdatePayload),
        }
    );

    if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error ?? "Failed to update contact");
    }

    return response.json() as Promise<WhatsAppContactMutationResult>;
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
            throw new Error(
                error.error ?? "Failed to fetch conversation history"
            );
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
        await handleApiError(
            response,
            "createSession",
            "Failed to create session"
        );
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
        await handleApiError(
            response,
            "generateToken",
            "Failed to generate token"
        );
    }

    const json = (await response.json()) as GenerateTokenResponse;
    return json;
};

export const listSessions = async (): Promise<ListSessionsResponse> => {
    const response = await fetch(`${API_BASE_URL}/video-call/sessions`);

    if (!response.ok) {
        await handleApiError(
            response,
            "listSessions",
            "Failed to list sessions"
        );
    }

    const json = (await response.json()) as ListSessionsResponse;
    return json;
};

export const listAllMeetings = async (): Promise<ListMeetingsResponse> => {
    const response = await fetch(`${API_BASE_URL}/video-call/meetings`);

    if (!response.ok) {
        await handleApiError(
            response,
            "listAllMeetings",
            "Failed to list meetings"
        );
    }

    return response.json() as Promise<ListMeetingsResponse>;
};

export const listAllPresets = async (): Promise<ListPresetsResponse> => {
    const response = await fetch(`${API_BASE_URL}/video-call/presets`);

    if (!response.ok) {
        await handleApiError(
            response,
            "listAllPresets",
            "Failed to list presets"
        );
    }

    return response.json() as Promise<ListPresetsResponse>;
};

export const deleteMeeting = async (
    meetingId: string
): Promise<DeleteMeetingResponse> => {
    const response = await fetch(
        `${API_BASE_URL}/video-call/meetings/${meetingId}`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        await handleApiError(
            response,
            "deleteMeeting",
            "Failed to delete meeting"
        );
    }

    return response.json() as Promise<DeleteMeetingResponse>;
};

export const searchMovies = async (
    query: string,
    page = 1
): Promise<MovieSearchResponse> => {
    const response = await fetch(
        `${API_BASE_URL}/movies-on-demand/search?query=${encodeURIComponent(
            query
        )}&page=${String(page)}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );

    if (!response.ok) {
        await handleApiError(
            response,
            "searchMovies",
            "Failed to search movies"
        );
    }

    return response.json() as Promise<MovieSearchResponse>;
};

export const getPopularMovies = async (
    page = 1
): Promise<MovieSearchResponse> => {
    const response = await fetch(
        `${API_BASE_URL}/movies-on-demand/popular?page=${String(page)}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );

    if (!response.ok) {
        await handleApiError(
            response,
            "getPopularMovies",
            "Failed to get popular movies"
        );
    }

    return response.json() as Promise<MovieSearchResponse>;
};

export const getTopMovies = async (page = 1): Promise<MovieSearchResponse> => {
    const response = await fetch(
        `${API_BASE_URL}/movies-on-demand/top?page=${String(page)}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );

    if (!response.ok) {
        await handleApiError(
            response,
            "getTopMovies",
            "Failed to get top movies"
        );
    }

    return response.json() as Promise<MovieSearchResponse>;
};

export const getMovieDetails = async (id: number): Promise<MovieDetails> => {
    const response = await fetch(
        `${API_BASE_URL}/movies-on-demand/movies/${String(id)}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );

    if (!response.ok) {
        await handleApiError(
            response,
            "getMovieDetails",
            "Failed to get movie details"
        );
    }

    return response.json() as Promise<MovieDetails>;
};

export const getMovieReleases = async (
    id: number
): Promise<ReleasesResponse> => {
    const response = await fetch(
        `${API_BASE_URL}/movies-on-demand/movies/${String(id)}/releases`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );

    if (!response.ok) {
        await handleApiError(
            response,
            "getMovieReleases",
            "Failed to get movie releases"
        );
    }

    return response.json() as Promise<ReleasesResponse>;
};

export const getSimilarMovies = async (
    id: number,
    page = 1
): Promise<SimilarMoviesResponse> => {
    const response = await fetch(
        `${API_BASE_URL}/movies-on-demand/movies/${String(
            id
        )}/similar?page=${String(page)}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );

    if (!response.ok) {
        await handleApiError(
            response,
            "getSimilarMovies",
            "Failed to get similar movies"
        );
    }

    return response.json() as Promise<SimilarMoviesResponse>;
};

export const fetchMovie = async (
    id: number,
    request: FetchMovieRequest
): Promise<FetchMovieResponse> => {
    const response = await fetch(
        `${API_BASE_URL}/movies-on-demand/movies/${String(id)}/fetch`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        }
    );

    if (!response.ok) {
        await handleApiError(response, "fetchMovie", "Failed to fetch movie");
    }

    return response.json() as Promise<FetchMovieResponse>;
};

export const getJobStatus = async (jobId: string): Promise<JobStatus> => {
    const response = await fetch(
        `${API_BASE_URL}/movies-on-demand/jobs/${jobId}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );

    if (!response.ok) {
        await handleApiError(
            response,
            "getJobStatus",
            "Failed to get job status"
        );
    }

    return response.json() as Promise<JobStatus>;
};

export const listActiveJobs = async (): Promise<{ jobs: JobStatus[] }> => {
    const response = await fetch(`${API_BASE_URL}/movies-on-demand/jobs`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        await handleApiError(response, "listActiveJobs", "Failed to list jobs");
    }

    return response.json() as Promise<{ jobs: JobStatus[] }>;
};

export const getMovieStream = async (
    movieId: number
): Promise<StreamResponse> => {
    const response = await fetch(
        `${API_BASE_URL}/movies-on-demand/movies/${String(movieId)}/stream`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );

    if (!response.ok) {
        await handleApiError(
            response,
            "getMovieStream",
            "Failed to get movie stream"
        );
    }

    return response.json() as Promise<StreamResponse>;
};

export const getWatchHistory = async (
    limit = 20,
    offset = 0
): Promise<WatchHistoryResponse> => {
    const response = await fetch(
        `${API_BASE_URL}/movies-on-demand/history?limit=${String(
            limit
        )}&offset=${String(offset)}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );

    if (!response.ok) {
        await handleApiError(
            response,
            "getWatchHistory",
            "Failed to get watch history"
        );
    }

    return response.json() as Promise<WatchHistoryResponse>;
};

export const uploadFile = async (
    file: File,
    isPublic = true
): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("isPublic", String(isPublic));

    const response = await fetch(`${API_BASE_URL}/file-hosting/upload`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        await handleApiError(response, "uploadFile", "Failed to upload file");
    }

    return response.json() as Promise<UploadResponse>;
};

export const fetchFileList = async (
    cursor?: string,
    limit?: number
): Promise<FileListResponse> => {
    const params = new URLSearchParams();
    if (cursor) {
        params.append("cursor", cursor);
    }
    if (limit !== undefined) {
        params.append("limit", String(limit));
    }

    const queryString = params.toString();
    const url = queryString
        ? `${API_BASE_URL}/file-hosting/files?${queryString}`
        : `${API_BASE_URL}/file-hosting/files`;

    const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        await handleApiError(
            response,
            "fetchFileList",
            "Failed to fetch file list"
        );
    }

    return response.json() as Promise<FileListResponse>;
};
