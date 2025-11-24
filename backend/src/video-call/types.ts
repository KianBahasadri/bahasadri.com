export interface CreateSessionRequest {
    name?: string;
}

export interface CreateSessionResponse {
    meeting_id: string;
}

export interface GenerateTokenRequest {
    meeting_id: string;
    name?: string;
    custom_participant_id?: string;
    preset_name?: string;
}

export interface GenerateTokenResponse {
    auth_token: string;
}

export interface ErrorResponse {
    error: string;
    code: "INVALID_INPUT" | "NOT_FOUND" | "INTERNAL_ERROR" | "REALTIMEKIT_ERROR";
}

export interface RealtimeKitConfig {
    accountId: string;
    appId: string;
    apiToken: string;
}

export interface RealtimeKitMeetingResponse {
    success: boolean;
    data?: {
        id: string;
        title?: string;
    };
    errors?: unknown[];
}

export interface RealtimeKitTokenResponse {
    success: boolean;
    data?: {
        token?: string;
        auth_token?: string;
        participant_id?: string;
    };
    errors?: unknown[];
}

