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
    code:
        | "INVALID_INPUT"
        | "NOT_FOUND"
        | "INTERNAL_ERROR"
        | "REALTIMEKIT_ERROR";
}

export interface Participant {
    id: string;
    name?: string;
    videoEnabled: boolean;
    audioEnabled: boolean;
}

export type RoomState =
    | "idle"
    | "connecting"
    | "connected"
    | "error"
    | "disconnected";

export interface Session {
    meeting_id: string;
    name?: string;
    created_at: string;
    status?: "LIVE" | "ENDED";
    live_participants?: number;
    max_concurrent_participants?: number;
}

export interface ListSessionsResponse {
    sessions: Session[];
}

export interface Meeting {
    id: string;
    title?: string;
    preferred_region?: string;
    created_at: string;
    record_on_start?: boolean;
    updated_at: string;
    live_stream_on_start?: boolean;
    persist_chat?: boolean;
    summarize_on_end?: boolean;
    status?: "ACTIVE" | "INACTIVE";
}

export interface Paging {
    total_count: number;
    start_offset: number;
    end_offset: number;
}

export interface ListMeetingsResponse {
    success: boolean;
    data: Meeting[];
    paging?: Paging;
}

export interface Preset {
    id: string;
    name?: string;
    created_at: string;
    updated_at: string;
}

export interface ListPresetsResponse {
    success: boolean;
    data: Preset[];
    paging?: Paging;
}

export interface DeleteMeetingResponse {
    success: boolean;
}
