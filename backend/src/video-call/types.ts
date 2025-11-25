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

export interface Session {
    meeting_id: string;
    name?: string;
    created_at?: string;
    status?: "LIVE" | "ENDED";
}

export interface ListSessionsResponse {
    sessions: Session[];
}

export interface ErrorResponse {
    error: string;
    code:
        | "INVALID_INPUT"
        | "NOT_FOUND"
        | "INTERNAL_ERROR"
        | "REALTIMEKIT_ERROR";
}

export interface RealtimeKitConfig {
    orgId: string;
    apiKey: string;
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

export interface RealtimeKitListMeetingsResponse {
    success: boolean;
    data?: {
        id: string;
        title?: string;
        created_at?: string;
    }[];
    errors?: unknown[];
}

export interface Meeting {
    id: string;
    title?: string;
    preferred_region?: string | null;
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
    paging: Paging;
}

export interface RealtimeKitListAllMeetingsResponse {
    success: boolean;
    data?: Meeting[];
    paging?: Paging;
    errors?: unknown[];
}

export interface RealtimeKitSession {
    id: string;
    associated_id?: string;
    meeting_display_name?: string;
    type?: string;
    status?: string;
    live_participants?: number;
    max_concurrent_participants?: number;
    minutes_consumed?: number;
    organization_id?: string;
    started_at?: string;
    created_at?: string;
    updated_at?: string;
    ended_at?: string;
    meta?: Record<string, unknown>;
    breakout_rooms?: unknown[];
}

export interface RealtimeKitListSessionsResponse {
    success: boolean;
    data?: {
        sessions?: RealtimeKitSession[];
    };
    errors?: unknown[];
}

export interface Preset {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface ListPresetsResponse {
    success: boolean;
    data: Preset[];
    paging: Paging;
}

export interface RealtimeKitListAllPresetsResponse {
    success: boolean;
    data?: Preset[];
    paging?: Paging;
    errors?: unknown[];
}

export interface DeleteMeetingResponse {
    success: boolean;
}
