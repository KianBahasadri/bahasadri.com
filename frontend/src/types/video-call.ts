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

export interface Participant {
    id: string;
    name?: string;
    videoEnabled: boolean;
    audioEnabled: boolean;
    stream?: MediaStream;
}

export type RoomState = "idle" | "connecting" | "connected" | "error" | "disconnected";

