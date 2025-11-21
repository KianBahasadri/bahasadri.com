/**
 * RealtimeKit and Video Commander Type Definitions
 *
 * Comprehensive TypeScript types for Cloudflare RealtimeKit API integration
 * and video conference state management.
 *
 * @see https://developers.cloudflare.com/realtime/llms-full.txt - Cloudflare Realtime API docs
 * @see [docs/AI_AGENT_STANDARDS.md](../../../docs/AI_AGENT_STANDARDS.md) - AI agent standards
 */

/**
 * RealtimeKit API Configuration
 */
export interface RealtimeKitConfig {
    accountId: string;
    appId: string;
    apiToken: string;
}

/**
 * Meeting object returned by RealtimeKit API when creating a room
 */
export interface RealtimeKitMeeting {
    id: string; // The actual field name from API
    title?: string;
    record_on_start?: boolean;
    live_stream_on_start?: boolean;
    summarize_on_end?: boolean;
    persist_chat?: boolean;
    is_large?: boolean;
    status?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Standard RealtimeKit API response wrapper for meetings
 */
export interface RealtimeKitMeetingResponse {
    success: boolean;
    data: RealtimeKitMeeting;
    errors?: unknown[];
}

/**
 * Participant token object returned by RealtimeKit API
 */
export interface RealtimeKitParticipant {
    token?: string;
    auth_token?: string;
    participant_id?: string;
    [key: string]: unknown;
}

/**
 * Standard RealtimeKit API response wrapper for tokens
 */
export interface RealtimeKitTokenResponse {
    success: boolean;
    data: RealtimeKitParticipant;
    errors?: unknown[];
}

/**
 * Request body for token generation
 */
export interface GenerateTokenRequest {
    meeting_id: string;
    name?: string;
    custom_participant_id?: string;
    preset_name?: string;
}

/**
 * Participant state (local or remote)
 */
export interface Participant {
    id: string;
    name: string;
    stream?: MediaStream;
    videoEnabled: boolean;
    audioEnabled: boolean;
    isLocal: boolean;
}

/**
 * Video conference room state
 */
export type RoomState = "idle" | "connecting" | "connected" | "error" | "disconnected";

