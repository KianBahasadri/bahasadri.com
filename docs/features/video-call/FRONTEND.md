# Video Call - Frontend Design

**Frontend-specific design and implementation requirements. This document is independent of backend implementation details.**

## Overview

Frontend implementation for the Video Call utility. Provides video conferencing interface using Cloudflare RealtimeKit SDK for WebRTC connections.

## Code Location

`frontend/src/pages/video-call/`

## API Contract Reference

See `docs/features/video-call/API_CONTRACT.yml` for the API contract this frontend consumes.

## Pages/Routes

### `/video-call`

**Component**: `VideoCall.tsx`

**Description**: Main page for video conferencing utility

**Route Configuration**:

```typescript
<Route path="/video-call" element={<VideoCall />} />
```

## Components

### VideoCall (Main Page)

**Location**: `VideoCall.tsx`

**Purpose**: Main page component that renders the video room

**State**:

-   Server state: None (all client-side)
-   Local state: Delegates to VideoRoom

### VideoRoom

**Location**: `components/VideoRoom/VideoRoom.tsx`

**Purpose**: Main video conferencing component

**Props**: None

**State**:

-   Local state: Room state (`idle` | `connecting` | `connected` | `error` | `disconnected`)
-   Local state: Participants array
-   Local state: Media stream (local video/audio)
-   Local state: Video/audio enabled flags

**Interactions**:

-   Request media permissions
-   Create new meeting session or join existing meeting
-   Generate participant token for meeting
-   Join meeting with token using RealtimeKit SDK
-   Handle remote participants
-   Toggle camera/microphone
-   Leave room

**Styling**:

-   CSS Modules: `VideoRoom.module.css`
-   Full-screen video layout

### ParticipantGrid

**Location**: `components/ParticipantGrid/ParticipantGrid.tsx`

**Purpose**: Displays all participants in a grid layout

**Props**:

```typescript
interface ParticipantGridProps {
    participants: Participant[];
}
```

**State**:

-   None (presentational component)

**Interactions**:

-   Display video streams
-   Show participant names
-   Show mute/video-off indicators

**Styling**:

-   CSS Modules: `ParticipantGrid.module.css`
-   Responsive grid layout

### Controls

**Location**: `components/Controls/Controls.tsx`

**Purpose**: Media controls (mute, video toggle, leave)

**Props**:

```typescript
interface ControlsProps {
    videoEnabled: boolean;
    audioEnabled: boolean;
    onToggleVideo: () => void;
    onToggleAudio: () => void;
    onLeave: () => void;
}
```

**State**:

-   None (controlled component)

**Interactions**:

-   Toggle camera
-   Toggle microphone
-   Leave room

**Styling**:

-   CSS Modules: `Controls.module.css`
-   Bottom control bar

## State Management

### Server State (TanStack Query)

```typescript
// Query keys
const queryKeys = {
    globalRoom: ["video-call", "global-room"] as const,
    session: (name?: string) => ["video-call", "session", name] as const,
};

// TanStack Query hooks
const useGlobalRoom = () => {
    return useQuery({
        queryKey: queryKeys.globalRoom,
        queryFn: () => fetchGlobalRoom(),
    });
};

const useCreateSession = () => {
    return useMutation({
        mutationFn: (name?: string) => createSession(name),
    });
};

const useGenerateToken = () => {
    return useMutation({
        mutationFn: (params: GenerateTokenRequest) => generateToken(
            params.meeting_id,
            params.name,
            params.custom_participant_id,
            params.preset_name
        ),
    });
};
```

### Local State (React)

```typescript
// Room state
const [roomState, setRoomState] = useState<RoomState>("idle");

// Participants
const [participants, setParticipants] = useState<Participant[]>([]);

// Media state
const [videoEnabled, setVideoEnabled] = useState(true);
const [audioEnabled, setAudioEnabled] = useState(true);
const [localStream, setLocalStream] = useState<MediaStream | null>(null);
```

## API Integration

### API Client Functions

**Location**: `lib/api.ts`

```typescript
// Get global room ID
export const fetchGlobalRoom = async (): Promise<GlobalRoomResponse> => {
    const response = await fetch("/api/video-call/global-room");
    if (!response.ok) throw new Error("Failed to fetch global room");
    return response.json();
};

// Create session
export const createSession = async (
    name?: string
): Promise<CreateSessionResponse> => {
    const response = await fetch("/api/video-call/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create session");
    }

    return response.json();
};

// Generate token
export const generateToken = async (
    meetingId: string,
    name?: string,
    customParticipantId?: string,
    presetName?: string
): Promise<GenerateTokenResponse> => {
    const response = await fetch("/api/video-call/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            meeting_id: meetingId,
            name,
            custom_participant_id: customParticipantId,
            preset_name: presetName,
        }),
    });

    if (!response.ok) {
        const error: ErrorResponse = await response.json();
        throw new Error(error.error || "Failed to generate token");
    }

    return response.json();
};
```

### RealtimeKit SDK Integration

```typescript
import RealtimeKit from "@cloudflare/realtimekit";

// Initialize SDK
const meeting = await RealtimeKit.init({
    accountId: config.accountId,
    appId: config.appId,
    authToken: authToken, // From backend
});

// Join meeting
await meeting.join(meetingId);

// Handle events
meeting.on("participantJoined", (participant) => {
    // Add remote participant
});

meeting.on("participantLeft", (participantId) => {
    // Remove participant
});
```

### Error Handling

All API errors follow the ErrorResponse schema from the API contract:

```typescript
interface ErrorResponse {
    error: string;
    code: "INVALID_INPUT" | "NOT_FOUND" | "INTERNAL_ERROR" | "REALTIMEKIT_ERROR";
}
```

Error handling strategies:

-   **API errors**: Display error message from `error.error` field, allow retry
-   **Connection errors**: Show error state, allow retry
-   **Media permission errors**: Show permission request UI
-   **Network errors**: Handle reconnection
-   **404 errors**: Show "Meeting does not exist" message (code: NOT_FOUND)
-   **400 errors**: Show validation error message (code: INVALID_INPUT)

## User Interactions

### Primary Actions

-   **Create New Call** (per feature spec):

    -   Trigger: "Create New Call" button click
    -   Flow: Create session → Generate token → Request permissions → Join meeting with token
    -   Error handling: Show error, allow retry

-   **Join Existing Call** (per feature spec):

    -   Trigger: Click on existing call (if viewing ongoing calls)
    -   Flow: Generate token for meeting ID → Request permissions → Join meeting with token
    -   Error handling: Show error if meeting not found (404), allow retry

-   **Toggle Camera**:

    -   Trigger: Click camera button
    -   Flow: Enable/disable video track → Update UI
    -   Error handling: Show error if track fails

-   **Toggle Microphone**:

    -   Trigger: Click microphone button
    -   Flow: Enable/disable audio track → Update UI
    -   Error handling: Show error if track fails

-   **Leave Room**:
    -   Trigger: Click leave button
    -   Flow: Stop tracks → Disconnect → Cleanup → Navigate away

### Form Handling

-   Participant name: Optional input for display name
-   Meeting name: Optional input when creating session
-   Error display: Inline errors for forms

## UI/UX Requirements

### Layout

-   Full-screen video interface
-   Participant grid: Responsive grid layout
-   Controls: Fixed bottom control bar
-   Responsive: Mobile-friendly layout

### Visual Design

-   Video grid: Equal-sized video tiles
-   Participant names: Overlay on video tiles
-   Status indicators: Mute icon, video-off icon
-   Controls: Large, accessible buttons

### User Feedback

-   Loading states: Connecting indicator
-   Error messages: Error state display
-   Permission prompts: Browser permission UI
-   Empty states: No participants message

## Implementation Checklist

### Components

-   [ ] VideoCall page component
-   [ ] VideoRoom component
-   [ ] ParticipantGrid component
-   [ ] Controls component
-   [ ] CSS Modules for all components

### Pages

-   [ ] Main page route configuration

### State Management

-   [ ] TanStack Query setup
-   [ ] API client functions
-   [ ] RealtimeKit SDK integration
-   [ ] Participant state management
-   [ ] Media stream management
-   [ ] Error handling

### Styling

-   [ ] CSS Modules for components
-   [ ] Responsive design
-   [ ] Video grid layout
-   [ ] Control bar styling
-   [ ] Loading/error states

### Integration

-   [ ] Connect to backend API (per API_CONTRACT.yml)
-   [ ] Integrate RealtimeKit SDK
-   [ ] Handle media permissions
-   [ ] Handle errors gracefully

## Dependencies

### React Libraries

-   `react-router-dom`: Routing
-   `@tanstack/react-query`: Data fetching
-   `@cloudflare/realtimekit`: RealtimeKit SDK
-   Standard React hooks

## Performance Considerations

-   Media stream optimization: Limit video quality
-   Participant limit: Handle large participant counts
-   Code splitting: Lazy load video components
-   Resource cleanup: Properly dispose of media streams

## Accessibility

-   Semantic HTML: Use proper video elements
-   ARIA labels: Label controls and participants
-   Keyboard navigation: Support keyboard shortcuts
-   Screen reader support: Announce participant changes

---

**Note**: This document is independent of backend implementation. Only the API contract in API_CONTRACT.yml couples frontend and backend.
