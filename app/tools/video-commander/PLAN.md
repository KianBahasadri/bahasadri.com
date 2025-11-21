# Video Commander - Planning & Documentation

**Display Name Options**: "Video Commander" or "Face-to-Face Interrogation Protocol" or "The UN Hates This One"

## Implementation Status

### ✅ Completed (Latest Rework)

- **API Routes**: All three routes rewritten with correct RealtimeKit API response structures
  - `GET /api/tools/video-commander/global-room` - Creates/returns global room ID
  - `POST /api/tools/video-commander/session` - Creates new meeting sessions
  - `POST /api/tools/video-commander/token` - Generates participant authentication tokens
  
- **Type System**: Comprehensive TypeScript interfaces for type safety
  - `RealtimeKitConfig`, `RealtimeKitMeetingResponse`, `RealtimeKitTokenResponse`
  - `Participant`, `RoomState` for state management
  - All `any` types eliminated, strict mode enabled

- **VideoRoom Component**: Complete rewrite with proper lifecycle management
  - Media permission request flow
  - Global room ID fetching
  - Token generation
  - Placeholder for RealtimeKit SDK initialization
  - Proper error handling and recovery
  - State machine pattern for room connection states
  - Resource cleanup on disconnect

- **Content Style**: Fixed all error messages to match repo standards
  - Removed memetic content from error messages
  - Proper professional error reporting
  - Page description updated

- **Code Quality**:
  - ✅ TypeScript compilation passes (`pnpm tsc --noEmit`)
  - ✅ Linting passes (`pnpm lint`)
  - ✅ All standards from `AI_AGENT_STANDARDS.md` followed
  - ✅ Full JSDoc documentation on all files/functions
  - ✅ Proper imports and type exports

### 🚧 Next Steps (Requires RealtimeKit SDK)

- **RealtimeKit SDK Integration**: Once SDK is available, implement:
  - Import and initialize RealtimeKit browser SDK
  - Handle remote participant joins/leaves
  - Stream remote tracks to video elements
  - Event handlers for connection state changes
  - Proper SDK cleanup on disconnect

- **Remote Participant Management**: Add handlers for:
  - Remote participant join events
  - Remote participant leave events
  - Remote media track management
  - Dynamic participant grid updates

### ❌ Known Limitations

- RealtimeKit SDK initialization is currently a placeholder
- No actual peer-to-peer connections until SDK is available
- Remote participants can't join yet (SDK needed)
- No data channel communication

## Purpose

A utility for real-time video and voice communication using Cloudflare RealtimeKit. This allows you to:

-   Create and join video conference rooms
-   Real-time video and audio streaming
-   Toggle camera and microphone
-   See all participants in a grid layout
-   Leave rooms gracefully

Perfect for video calls that don't leak your data to Zoom, proving that WebRTC doesn't have to be a nightmare, or just streaming your face across Cloudflare's global edge network because you can.

## Planning

### Features

#### Phase 1: Core Functionality

-   **Create/Join Rooms**: Generate room IDs and join existing rooms

    -   Room ID input/display
    -   Create new room button
    -   Join room by ID
    -   Share room link functionality

-   **Video Conferencing**: Real-time video and audio

    -   Camera and microphone access
    -   Display local video feed
    -   Display remote participant feeds
    -   Grid layout for multiple participants

-   **Media Controls**: Toggle camera and microphone

    -   Mute/unmute microphone button
    -   Enable/disable camera button
    -   Visual feedback for mute/video states
    -   Leave room button

-   **Error Handling**: Graceful error handling

    -   Media permission denied
    -   Network failures
    -   Room not found
    -   Browser compatibility checks

#### Phase 2: Enhanced Features (Future)

-   Screen sharing
-   Chat during calls
-   Recording (if enabled in RealtimeKit)
-   Waiting room
-   Participant management (kick, mute others)
-   Virtual backgrounds
-   Breakout rooms

### Design Decisions

#### 1. RealtimeKit Integration

**Decision**: Use Cloudflare RealtimeKit REST API for server-side operations, browser SDK for client-side

-   **Rationale**:
    -   RealtimeKit abstracts WebRTC complexity
    -   Built for Cloudflare's network (perfect for Workers)
    -   Pre-built UI components available
    -   Automatic track management
-   **Implementation**:
    -   Server-side: REST API calls to create meetings and generate participant tokens
    -   Client-side: RealtimeKit browser SDK for WebRTC connections
    -   API routes handle meeting creation and token generation

#### 2. Room Management

**Decision**: Ephemeral rooms (created on-demand, no persistence)

-   **Rationale**:
    -   Simpler initial implementation
    -   No need for room storage/database
    -   Rooms can be recreated if needed
    -   Follows RealtimeKit's meeting model
-   **Future**: Add room persistence with Cloudflare KV if needed

#### 3. API Route Structure

**Decision**: Use Next.js Route Handlers in utility-specific directory

-   **Structure**:
    -   `/api/tools/video-commander/session` - POST endpoint for creating meetings
    -   `/api/tools/video-commander/token` - POST endpoint for generating participant tokens
-   **Rationale**:
    -   Keeps API routes decoupled with the utility
    -   Follows Next.js App Router patterns
    -   Easy to find and maintain

#### 4. UI Architecture

**Decision**: Client Component for interactivity, Server Component for initial render

-   **Structure**:
    -   `page.tsx` - Server Component (initial render, room ID input)
    -   `components/VideoRoom.tsx` - Client Component (RealtimeKit integration, WebRTC)
    -   `components/ParticipantGrid.tsx` - Client Component (video grid layout)
    -   `components/Controls.tsx` - Client Component (media controls)
-   **Rationale**:
    -   Server Components for SEO and initial load
    -   Client Components only where interactivity is needed
    -   WebRTC requires browser APIs (camera, microphone, WebRTC)
    -   Follows Next.js best practices

#### 5. RealtimeKit SDK vs Raw API

**Decision**: Use RealtimeKit browser SDK (via CDN or npm if available)

-   **Rationale**:
    -   SDK handles WebRTC complexity
    -   Automatic track management
    -   Better error handling
    -   If SDK not available, use raw WebRTC API with RealtimeKit signaling
-   **Implementation**:
    -   Check for SDK availability
    -   Fallback to raw WebRTC if needed
    -   Use REST API for meeting/participant management

### Edge Cases

1. **Media Permission Denied**

    - Show clear error message
    - Guide user to enable permissions
    - Provide fallback (audio-only mode)
    - Handle permission state changes

2. **Network Failures**

    - Retry connection logic
    - Show connection status
    - Graceful degradation
    - Reconnection on network restore

3. **Room Not Found**

    - Validate room ID format
    - Show helpful error message
    - Allow room creation
    - Handle expired rooms

4. **Browser Compatibility**

    - Check WebRTC support
    - Show compatibility message
    - Suggest modern browser
    - Handle unsupported browsers gracefully

5. **Multiple Participants**

    - Grid layout adapts to participant count
    - Handle participant join/leave events
    - Update UI in real-time
    - Handle participant disconnections

6. **Empty State**
    - Show helpful message when no participants
    - Guide user on how to join/create rooms
    - Display room ID prominently

### User Experience

-   **Join Flow**:

    1. User enters or generates room ID. Don't mess this up, dumbass.
    2. Clicks "Join Interrogation" or similar hostile button text
    3. Browser requests camera/microphone permissions. The UN is watching.
    4. Loading state shows. We pray WebRTC doesn't break.
    5. Video feeds appear. Or we scream at the browser.
    6. User can toggle mute/video. Don't break it, fed.

-   **Create Flow**:

    1. User clicks "Create Room" or "Start Interrogation"
    2. Server creates meeting via RealtimeKit API
    3. Room ID generated and displayed
    4. User can share room ID
    5. User joins automatically
    6. Waiting for other participants

-   **Video Display**:
    -   Clear visual distinction: local vs remote participants
    -   Grid layout adapts to participant count (1, 2, 3, 4+)
    -   Participant names/avatars (if available)
    -   Connection status indicators

## Documentation Links

### External Resources

-   [Cloudflare Realtime LLMs Full Documentation](https://developers.cloudflare.com/realtime/llms-full.txt) - **PRIMARY REFERENCE** - Complete Realtime documentation in LLM-friendly format
-   [Cloudflare Realtime Overview](https://developers.cloudflare.com/realtime/) - Complete Realtime documentation
-   [RealtimeKit Documentation](https://developers.cloudflare.com/realtime/realtimekit/) - RealtimeKit guide
-   [RealtimeKit Concepts](https://developers.cloudflare.com/realtime/realtimekit/concepts/) - Core concepts
-   [RealtimeKit Getting Started](https://developers.cloudflare.com/realtime/realtimekit/getting-started/) - Setup guide
-   [Build Your Own UI Guide](https://developers.cloudflare.com/realtime/realtimekit/build-your-own-ui/) - Custom UI implementation

### APIs/Libraries Used

-   **Cloudflare RealtimeKit REST API**

    -   Purpose: Create meetings, generate participant tokens
    -   Endpoint: `https://api.cloudflare.com/client/v4/accounts/{account_id}/realtime/kit/{app_id}/meetings`
    -   Documentation: https://developers.cloudflare.com/realtime/realtimekit/
    -   **LLM Reference**: [Realtime LLMs Full Documentation](https://developers.cloudflare.com/realtime/llms-full.txt)

-   **RealtimeKit Browser SDK** (if available)

    -   Purpose: WebRTC connection management, track handling
    -   CDN: `https://cdn.jsdelivr.net/npm/@cloudflare/realtimekit@latest/dist/browser.js`
    -   Documentation: https://developers.cloudflare.com/realtime/realtimekit/

-   **WebRTC API** (fallback)

    -   Purpose: Direct WebRTC implementation if SDK unavailable
    -   Documentation: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API

### Related Documentation

-   [Project Architecture](../../../docs/ARCHITECTURE.md) - System architecture
-   [Development Guide](../../../docs/DEVELOPMENT.md) - Development guidelines
-   [Utilities Architecture](../../../docs/UTILITIES.md) - Utility patterns
-   [Component Patterns](../../../docs/COMPONENTS.md) - Component guidelines

## Implementation Notes

### Technical Details

#### 1. Cloudflare RealtimeKit Setup

-   RealtimeKit app created: `ce2b8163-4fa1-472a-8ec3-6bdb226ff873`
-   Account ID: `3d463c39c94a3084cea36fc6ffde8931`
-   API Token: Stored in Wrangler secrets

#### 2. Environment Variables

Required secrets (use Wrangler secrets):

-   `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account identifier
-   `CLOUDFLARE_REALTIME_APP_ID` - RealtimeKit app identifier
-   `CLOUDFLARE_REALTIME_API_TOKEN` - API token for RealtimeKit operations

#### 3. API Route Implementation

**Create Meeting Route** (`/api/tools/video-commander/session/route.ts`):

```typescript
export async function POST(request: Request) {
    // 1. Get credentials from environment
    // 2. Call RealtimeKit API to create meeting
    // 3. Return meeting ID and configuration
}
```

**Generate Token Route** (`/api/tools/video-commander/token/route.ts`):

```typescript
export async function POST(request: Request) {
    // 1. Get meeting ID and participant name from request
    // 2. Call RealtimeKit API to add participant
    // 3. Return participant auth token
}
```

#### 4. RealtimeKit API Structure

**Create Meeting**:

```typescript
POST https://api.cloudflare.com/client/v4/accounts/{account_id}/realtime/kit/apps/{app_id}/meetings
Headers:
  Authorization: Bearer {api_token}
  Content-Type: application/json
Body:
  {
    "name": "Meeting Name"
  }
Response:
  {
    "meeting_id": "...",
    ...
  }
```

**Add Participant**:

```typescript
POST https://api.cloudflare.com/client/v4/accounts/{account_id}/realtime/kit/apps/{app_id}/meetings/{meeting_id}/participants
Headers:
  Authorization: Bearer {api_token}
  Content-Type: application/json
Body:
  {
    "name": "Participant Name",
    "preset_name": "group_call_participant"
  }
Response:
  {
    "auth_token": "...",
    ...
  }
```

#### 5. Client-Side Integration

**RealtimeKit SDK** (if available):

```typescript
const meeting = await RealtimeKitClient.init({
    authToken: participantAuthToken,
});
await meeting.join();
```

**Raw WebRTC** (fallback):

-   Use WebRTC API directly
-   Handle signaling via RealtimeKit
-   Manage media tracks manually

### Gotchas

1. **RealtimeKit SDK Availability**

    - SDK may not be published to npm yet
    - May need to use CDN version
    - Fallback to raw WebRTC if SDK unavailable
    - Test SDK compatibility early

2. **Media Permissions**

    - Browser requires user permission for camera/microphone
    - Handle permission denied gracefully
    - Show clear error messages
    - Provide fallback (audio-only)

3. **HTTPS Requirement**

    - WebRTC requires secure context (HTTPS)
    - Cloudflare provides HTTPS automatically
    - Local development may need HTTPS setup
    - Use `localhost` exception for development

4. **Room Lifecycle**

    - Rooms are ephemeral (no persistence)
    - Rooms may expire after inactivity
    - Handle room expiration gracefully
    - Allow room recreation

5. **Network Failures**
    - WebRTC connections can fail
    - Implement reconnection logic
    - Show connection status
    - Handle network state changes

### Cloudflare Workers Compatibility

#### ✅ Compatible

-   **API Routes**: Next.js Route Handlers work perfectly in Workers
-   **Fetch API**: All RealtimeKit API calls use fetch (Workers compatible)
-   **Environment Variables**: Wrangler secrets work in Workers

#### ⚠️ Considerations

-   **Client-Side Only**: WebRTC APIs are browser-only (expected)
-   **Media Permissions**: Requires user permission for camera/microphone
-   **HTTPS Required**: WebRTC requires secure context (Cloudflare provides HTTPS)

### Type Safety

#### Interfaces

```typescript
interface CreateMeetingRequest {
    name?: string;
}

interface CreateMeetingResponse {
    meeting_id: string;
    // ... other fields
}

interface AddParticipantRequest {
    meeting_id: string;
    name: string;
    preset_name?: string;
}

interface AddParticipantResponse {
    auth_token: string;
    participant_id: string;
    // ... other fields
}

interface Participant {
    id: string;
    name: string;
    videoEnabled: boolean;
    audioEnabled: boolean;
    stream?: MediaStream;
}
```

## Testing Considerations

-   **Unit Tests**:

    -   Room ID validation
    -   API request formatting
    -   Error handling logic

-   **Integration Tests**:

    -   Session creation flow
    -   Token generation
    -   API error handling

-   **Manual Testing**:

    -   Real video call between browsers
    -   Media permission flows
    -   Network failure scenarios
    -   Multiple participants
    -   Room join/leave flows

## Future Enhancements

1. **Screen Sharing**

    - Share screen during calls
    - Toggle between camera and screen
    - Handle screen share permissions

2. **Chat**

    - Text chat during calls
    - Message history
    - File sharing

3. **Recording**

    - Record calls (if enabled in RealtimeKit)
    - Download recordings
    - Recording management

4. **Waiting Room**

    - Host controls who joins
    - Waiting room UI
    - Participant approval

5. **Participant Management**

    - Host can mute/kick participants
    - Participant list
    - Permission management

6. **Virtual Backgrounds**

    - Background blur
    - Custom backgrounds
    - Background effects

7. **Room Persistence**
    - Save room configurations
    - Room history
    - Scheduled rooms

## Changelog

### 2025-01-27 - Initial Planning

-   Created utility plan
-   Defined architecture and features
-   Documented technical approach
-   Saved RealtimeKit credentials

---

**Last Updated**: 2025-01-27
