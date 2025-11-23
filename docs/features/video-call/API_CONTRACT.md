# Video Call Control Center - API Contract

**API contract document defining the interface between frontend and backend. This is the ONLY coupling point between frontend and backend.**

## Purpose

Video call control center using Cloudflare RealtimeKit. Allows users to create video conference sessions, generate participant links, monitor participants, and control call settings. The control center operator manages the call but does not join as a participant.

## API Base URL

- Development: `http://localhost:8787/api`
- Production: `https://bahasadri.com/api`

## Endpoints

### `POST /api/video-call/session`

**Description**: Creates a new video call session and returns the session ID. The control center operator uses this to start a new call.

**Request Body**:

```typescript
interface CreateSessionRequest {
    name?: string; // Optional session name for identification
}
```

**Response**:

```typescript
interface CreateSessionResponse {
    session_id: string;
    created_at: string; // ISO 8601 timestamp
}
```

**Status Codes**:

- `200 OK`: Session created successfully
- `500 Internal Server Error`: RealtimeKit API error

---

### `GET /api/video-call/session/:session_id`

**Description**: Gets details about an active session, including participant list and status

**Path Parameters**:
- `session_id`: The unique session identifier

**Response**:

```typescript
interface SessionDetailsResponse {
    session_id: string;
    name?: string;
    created_at: string;
    status: "active" | "ended";
    participants: ParticipantInfo[];
}

interface ParticipantInfo {
    participant_id: string;
    name?: string;
    joined_at: string;
    is_muted: boolean;
    is_camera_on: boolean;
    is_screen_sharing: boolean;
    connection_quality: "excellent" | "good" | "fair" | "poor";
}
```

**Status Codes**:

- `200 OK`: Session details retrieved successfully
- `404 Not Found`: Session does not exist
- `500 Internal Server Error`: RealtimeKit API error

---

### `POST /api/video-call/session/:session_id/participant-token`

**Description**: Generates a participant authentication token for joining a specific session. This token is embedded in the participant join link.

**Path Parameters**:
- `session_id`: The session identifier the participant will join

**Request Body**:

```typescript
interface GenerateParticipantTokenRequest {
    name?: string; // Optional participant name
}
```

**Response**:

```typescript
interface GenerateParticipantTokenResponse {
    token: string;
    join_url: string; // Full URL participants can use to join
    expires_at: string; // ISO 8601 timestamp
}
```

**Status Codes**:

- `200 OK`: Token generated successfully
- `404 Not Found`: Session does not exist
- `500 Internal Server Error`: RealtimeKit API error

---

### `POST /api/video-call/session/:session_id/control-token`

**Description**: Generates a control center authentication token for managing a specific session. This token grants administrative privileges.

**Path Parameters**:
- `session_id`: The session identifier to control

**Response**:

```typescript
interface GenerateControlTokenResponse {
    token: string;
    expires_at: string; // ISO 8601 timestamp
}
```

**Status Codes**:

- `200 OK`: Control token generated successfully
- `404 Not Found`: Session does not exist
- `500 Internal Server Error`: RealtimeKit API error

---

### `POST /api/video-call/session/:session_id/mute`

**Description**: Remotely mutes a specific participant in the session

**Path Parameters**:
- `session_id`: The session identifier

**Request Body**:

```typescript
interface MuteParticipantRequest {
    participant_id: string;
}
```

**Response**:

```typescript
interface MuteParticipantResponse {
    success: boolean;
    participant_id: string;
    is_muted: boolean;
}
```

**Status Codes**:

- `200 OK`: Participant muted successfully
- `400 Bad Request`: Missing or invalid participant_id
- `404 Not Found`: Session or participant does not exist
- `500 Internal Server Error`: RealtimeKit API error

---

### `POST /api/video-call/session/:session_id/unmute`

**Description**: Remotely unmutes a specific participant in the session

**Path Parameters**:
- `session_id`: The session identifier

**Request Body**:

```typescript
interface UnmuteParticipantRequest {
    participant_id: string;
}
```

**Response**:

```typescript
interface UnmuteParticipantResponse {
    success: boolean;
    participant_id: string;
    is_muted: boolean;
}
```

**Status Codes**:

- `200 OK`: Participant unmuted successfully
- `400 Bad Request`: Missing or invalid participant_id
- `404 Not Found`: Session or participant does not exist
- `500 Internal Server Error`: RealtimeKit API error

---

### `DELETE /api/video-call/session/:session_id`

**Description**: Ends a video call session, disconnecting all participants

**Path Parameters**:
- `session_id`: The session identifier to end

**Response**:

```typescript
interface EndSessionResponse {
    success: boolean;
    session_id: string;
    ended_at: string; // ISO 8601 timestamp
}
```

**Status Codes**:

- `200 OK`: Session ended successfully
- `404 Not Found`: Session does not exist
- `500 Internal Server Error`: RealtimeKit API error

---

### `GET /api/video-call/session/:session_id/screen-shares`

**Description**: Gets a list of active screen shares in the session

**Path Parameters**:
- `session_id`: The session identifier

**Response**:

```typescript
interface ScreenSharesResponse {
    screen_shares: ScreenShare[];
}

interface ScreenShare {
    share_id: string;
    participant_id: string;
    participant_name?: string;
    started_at: string;
    stream_url: string; // WebRTC stream identifier
}
```

**Status Codes**:

- `200 OK`: Screen shares retrieved successfully
- `404 Not Found`: Session does not exist
- `500 Internal Server Error`: RealtimeKit API error

---

### `POST /api/video-call/session/:session_id/video-file`

**Description**: Uploads a video file to be shared with all participants in the session

**Path Parameters**:
- `session_id`: The session identifier

**Request**:
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field containing the video file

**Response**:

```typescript
interface VideoFileUploadResponse {
    file_id: string;
    filename: string;
    size: number;
    duration: number; // Video duration in seconds
    url: string; // Playback URL
}
```

**Status Codes**:

- `200 OK`: Video file uploaded successfully
- `400 Bad Request`: Missing or invalid file
- `404 Not Found`: Session does not exist
- `413 Payload Too Large`: File exceeds size limit
- `500 Internal Server Error`: Upload or processing error

---

### `GET /api/video-call/session/:session_id/video-files`

**Description**: Gets a list of video files shared in the session

**Path Parameters**:
- `session_id`: The session identifier

**Response**:

```typescript
interface VideoFilesResponse {
    files: VideoFileInfo[];
}

interface VideoFileInfo {
    file_id: string;
    filename: string;
    uploaded_by: string; // participant_id
    uploaded_at: string;
    size: number;
    duration: number;
    url: string;
}
```

**Status Codes**:

- `200 OK`: Video files retrieved successfully
- `404 Not Found`: Session does not exist
- `500 Internal Server Error`: RealtimeKit API error

---

## WebSocket Events

The control center and participants use WebSocket connections through RealtimeKit for real-time updates. The following events are exchanged:

### Control Center Receives (from RealtimeKit):

- `participant_joined`: New participant connected
- `participant_left`: Participant disconnected
- `participant_muted`: Participant was muted (by self or remotely)
- `participant_unmuted`: Participant was unmuted (by self or remotely)
- `camera_toggled`: Participant camera status changed
- `screen_share_started`: Participant started sharing screen
- `screen_share_stopped`: Participant stopped sharing screen
- `connection_quality_changed`: Participant connection quality changed
- `video_file_shared`: New video file was shared

### Control Center Sends (via RealtimeKit):

- `mute_participant`: Command to mute a specific participant
- `unmute_participant`: Command to unmute a specific participant
- `video_control`: Control video file playback (play, pause, seek)
- `end_session`: Command to end the session

---

## Shared Data Models

### TypeScript Types

```typescript
interface RealtimeKitConfig {
    accountId: string;
    appId: string;
    apiToken: string;
}

interface Session {
    session_id: string;
    name?: string;
    created_at: string;
    status: "active" | "ended";
    participants: ParticipantInfo[];
}

interface ParticipantInfo {
    participant_id: string;
    name?: string;
    joined_at: string;
    is_muted: boolean;
    is_camera_on: boolean;
    is_screen_sharing: boolean;
    connection_quality: "excellent" | "good" | "fair" | "poor";
}

interface ScreenShare {
    share_id: string;
    participant_id: string;
    participant_name?: string;
    started_at: string;
    stream_url: string;
}

interface VideoFileInfo {
    file_id: string;
    filename: string;
    uploaded_by: string;
    uploaded_at: string;
    size: number;
    duration: number;
    url: string;
}

type ConnectionQuality = "excellent" | "good" | "fair" | "poor";
type SessionStatus = "active" | "ended";
```

---

## Error Handling

### Standard Error Response

All errors follow this format:

```typescript
interface ErrorResponse {
    error: string;
    code: string;
}
```

### Error Codes

| Code                   | HTTP Status | When to Use                         |
| ---------------------- | ----------- | ----------------------------------- |
| `INVALID_INPUT`        | 400         | Missing or invalid request fields   |
| `SESSION_NOT_FOUND`    | 404         | Session does not exist              |
| `PARTICIPANT_NOT_FOUND`| 404         | Participant does not exist          |
| `UNAUTHORIZED`         | 401         | Invalid or expired token            |
| `FILE_TOO_LARGE`       | 413         | Uploaded file exceeds size limit    |
| `INVALID_FILE_TYPE`    | 400         | File type not supported             |
| `REALTIMEKIT_ERROR`    | 500         | RealtimeKit API error               |
| `INTERNAL_ERROR`       | 500         | Server error                        |

---

## Authentication/Authorization

- **Required**: Yes (for control center operations)
- **Method**: Token-based authentication via RealtimeKit
- **Control Token**: Required for control center operations (mute/unmute, end session)
- **Participant Token**: Required for participants to join sessions
- **Token Generation**: Backend generates tokens and returns them to frontend
- **Token Validation**: RealtimeKit SDK validates tokens

---

## CORS

- **Allowed Origins**: `https://bahasadri.com`
- **Allowed Methods**: GET, POST, DELETE
- **Allowed Headers**: Content-Type, Authorization

---

## Rate Limiting

- **Session Creation**: 10 per minute per IP
- **Token Generation**: 100 per minute per session
- **Control Commands**: 60 per minute per session

---

## File Size Limits

- **Video Files**: 100 MB maximum per file
- **Total Storage**: Within Cloudflare R2 free tier limits

---

**Note**: This document defines the contract between frontend and backend. Implementation details are in FRONTEND.md and BACKEND.md respectively.
