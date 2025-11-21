# Video Conferencing Utility - Architecture Proposal

## Overview

This document proposes adding a video conferencing utility using **Cloudflare RealtimeKit** to the Bahasadri.com arsenal. This utility will enable real-time video and voice communication directly in the browser, leveraging Cloudflare's global edge network.

## Why Cloudflare RealtimeKit?

Based on the [Cloudflare Realtime documentation](https://developers.cloudflare.com/realtime/llms-full.txt), RealtimeKit is the best choice because:

1. **Low Effort to Get Started**: Just a few lines of code with UI Kit and Core SDK
2. **No WebRTC Expertise Required**: Abstracts away WebRTC complexities
3. **Cloudflare Native**: Built for Cloudflare's network, perfect for Workers deployment
4. **Pre-built UI Components**: Faster development with UI Kit
5. **Automatic Track Management**: Handles media tracks, peer management automatically

### Comparison with Alternatives

| Option             | Effort | WebRTC Knowledge | Best For                              |
| ------------------ | ------ | ---------------- | ------------------------------------- |
| **RealtimeKit** ✅ | Low    | None             | Quick integration, standard use cases |
| Realtime SFU       | High   | Expert           | Custom WebRTC architectures           |
| TURN Service       | Low    | None             | Relay only (not full solution)        |

## Proposed Architecture

### Directory Structure

```
app/
└── tools/
    └── video-commander/          # Utility name (edgy, hostile)
        ├── page.tsx              # Server Component (initial render)
        ├── page.module.css       # Utility-specific styles
        ├── PLAN.md               # Planning & documentation
        └── components/
            ├── VideoRoom/        # Main video conferencing component
            │   ├── VideoRoom.tsx
            │   └── VideoRoom.module.css
            ├── ParticipantGrid/  # Grid layout for participants
            │   ├── ParticipantGrid.tsx
            │   └── ParticipantGrid.module.css
            └── Controls/         # Media controls (mute, video, etc.)
                ├── Controls.tsx
                └── Controls.module.css
```

### API Routes

```
app/
└── api/
    └── tools/
        └── video-commander/
            ├── session/
            │   └── route.ts      # Create/join session
            └── token/
                └── route.ts      # Generate auth tokens (if needed)
```

## Technical Implementation

### Phase 1: Core Video Conferencing

#### 1. Setup & Configuration

**Environment Variables** (Wrangler secrets):

-   `CLOUDFLARE_REALTIME_APP_ID` - RealtimeKit app identifier
-   `CLOUDFLARE_REALTIME_API_KEY` - API key for server-side operations

**Cloudflare Realtime Setup**:

1. Create RealtimeKit app in Cloudflare dashboard
2. Configure app settings (recording, transcription, etc.)
3. Get App ID and generate API keys

#### 2. Client-Side Implementation

**VideoRoom Component** (Client Component):

-   Uses Cloudflare RealtimeKit Core SDK
-   Handles WebRTC media streams (camera, microphone)
-   Manages participant connections
-   Displays video feeds in grid layout

**Key Features**:

-   Join/create rooms with room ID
-   Toggle camera/microphone
-   Display participant video feeds
-   Leave room functionality
-   Error handling for media permissions

#### 3. Server-Side API Routes

**Session Route** (`/api/tools/video-commander/session/route.ts`):

-   Creates new sessions (meetings)
-   Validates room access
-   Returns session configuration

**Token Route** (if needed):

-   Generates authentication tokens
-   Validates user permissions

### Phase 2: Enhanced Features (Future)

-   Screen sharing
-   Chat during calls
-   Recording (if enabled in RealtimeKit)
-   Waiting room
-   Participant management (kick, mute)
-   Virtual backgrounds
-   Breakout rooms

## Component Architecture

### VideoRoom Component

```typescript
"use client";

/**
 * VideoRoom Component
 *
 * Main video conferencing interface using Cloudflare RealtimeKit.
 * Handles WebRTC connections, media streams, and participant management.
 *
 * Type: Client Component (requires browser APIs: WebRTC, MediaDevices)
 */
interface VideoRoomProps {
    roomId: string;
    onLeave?: () => void;
}

export default function VideoRoom({ roomId, onLeave }: VideoRoomProps) {
    // RealtimeKit SDK integration
    // Media stream management
    // Participant state
    // Error handling
}
```

### ParticipantGrid Component

```typescript
"use client";

/**
 * ParticipantGrid Component
 *
 * Displays video feeds in a responsive grid layout.
 * Adapts to number of participants (1, 2, 3, 4+).
 *
 * Type: Client Component (requires video element rendering)
 */
interface ParticipantGridProps {
    participants: Participant[];
}

export default function ParticipantGrid({
    participants,
}: ParticipantGridProps) {
    // Grid layout logic
    // Video element rendering
    // Responsive design
}
```

### Controls Component

```typescript
'use client';

/**
 * Controls Component
 *
 * Media controls for video conferencing (mute, video toggle, leave).
 *
 * Type: Client Component (requires interactivity)
 */
interface ControlsProps {
    onToggleMute: () => void;
    onToggleVideo: () => void;
    onLeave: () => void;
    isMuted: boolean;
    isVideoEnabled: boolean;
}

export default function Controls({ ... }: ControlsProps) {
    // Control buttons
    // State management
    // Visual feedback
}
```

## Cloudflare Workers Compatibility

### ✅ Compatible

-   **RealtimeKit SDK**: Browser-based, works in client components
-   **API Routes**: Next.js Route Handlers work perfectly in Workers
-   **Fetch API**: All RealtimeKit API calls use fetch (Workers compatible)
-   **WebRTC**: Browser API, not Workers runtime (expected)

### ⚠️ Considerations

-   **Client-Side Only**: WebRTC APIs are browser-only (expected)
-   **Media Permissions**: Requires user permission for camera/microphone
-   **HTTPS Required**: WebRTC requires secure context (Cloudflare provides HTTPS)

## Dependencies

### Required Packages

```json
{
    "@cloudflare/realtime": "^1.0.0" // RealtimeKit SDK (when available)
}
```

**Note**: Check Cloudflare RealtimeKit SDK availability. May need to use raw API calls initially.

### Alternative: Raw API Integration

If SDK not available, use raw fetch API:

```typescript
// Create session
const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/realtime/sessions`,
    {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            appId: appId,
            // ... session config
        }),
    }
);
```

## Security Considerations

1. **Room Access Control**: Validate room IDs, prevent unauthorized access
2. **API Key Security**: Store in Wrangler secrets, never expose to client
3. **HTTPS Only**: WebRTC requires secure context (enforced by Cloudflare)
4. **Media Permissions**: Browser handles camera/microphone permissions
5. **Rate Limiting**: Cloudflare automatically provides DDoS protection

## Error Handling

### Common Scenarios

1. **Media Permission Denied**

    - Show clear error message
    - Guide user to enable permissions
    - Provide fallback (audio-only mode)

2. **Network Failures**

    - Retry connection logic
    - Show connection status
    - Graceful degradation

3. **Room Not Found**

    - Validate room ID format
    - Show helpful error message
    - Allow room creation

4. **Browser Compatibility**
    - Check WebRTC support
    - Show compatibility message
    - Suggest modern browser

## Testing Strategy

### Unit Tests

-   Room ID validation
-   API request formatting
-   Error handling logic

### Integration Tests

-   Session creation flow
-   Media stream handling
-   Participant management

### Manual Testing

-   Real video call between browsers
-   Media permission flows
-   Network failure scenarios
-   Multiple participants

## Cost Considerations

### Cloudflare RealtimeKit Pricing

-   **Pricing Model**: By minute (see [Cloudflare Workers pricing](https://workers.cloudflare.com/pricing#media))
-   **Free Tier**: None (unlike SFU which has 1,000 GB free)
-   **Cost**: Pay-per-use, scales with usage

### Cost Optimization

-   Implement session timeouts
-   Auto-disconnect idle participants
-   Monitor usage in Cloudflare dashboard
-   Set usage alerts

## Content Style Guide Compliance

Following [CONTENT_STYLE.md](./CONTENT_STYLE.md):

### Utility Name

-   **"Video Commander"** or **"Face-to-Face Interrogation Protocol"** or **"The UN Hates This One"**

### Descriptions

-   "Pipe video through Cloudflare's edge network, watch the Feds squirm, and blame WebRTC when it breaks."
-   "Real-time video calls powered by Cloudflare's global network. Because Zoom is for NPCs."

### Error Messages

-   "Camera permission denied? Typical. The UN is watching, dumbass."
-   "Connection failed. The Blue Helmets are jamming your signal. Try again, fed."

### Success Messages

-   "Room created. Don't invite the Feds, or I will scream."
-   "Connected. Your face is now being streamed across Cloudflare's edge network. Cope."

## Implementation Checklist

### Phase 1: Foundation

-   [ ] Create utility directory structure
-   [ ] Write PLAN.md with full documentation
-   [ ] Set up Cloudflare RealtimeKit app
-   [ ] Configure environment variables
-   [ ] Create basic VideoRoom component
-   [ ] Implement session creation API route
-   [ ] Add to dashboard (app/page.tsx)

### Phase 2: Core Features

-   [ ] Media stream handling (camera, microphone)
-   [ ] Participant grid layout
-   [ ] Media controls (mute, video toggle)
-   [ ] Leave room functionality
-   [ ] Error handling and user feedback
-   [ ] Responsive design

### Phase 3: Polish

-   [ ] Loading states
-   [ ] Connection status indicators
-   [ ] Participant names/avatars
-   [ ] Room ID sharing
-   [ ] Documentation updates

## Next Steps

1. **Review this proposal** - Confirm approach and architecture
2. **Set up Cloudflare RealtimeKit** - Create app, get credentials
3. **Implement Phase 1** - Basic structure and documentation
4. **Test integration** - Verify SDK/API compatibility
5. **Build core features** - Video room, participants, controls
6. **Add to dashboard** - Register utility in home page

## Questions to Resolve

1. **SDK Availability**: Is Cloudflare RealtimeKit SDK available for npm? Or do we use raw API?
2. **Authentication**: Does RealtimeKit require token-based auth, or can we use API keys?
3. **Room Management**: Should rooms be persistent or ephemeral?
4. **Recording**: Enable recording feature in RealtimeKit app settings?
5. **Max Participants**: What's the limit? Should we enforce a limit?

## References

-   [Cloudflare Realtime LLMs Full Documentation](https://developers.cloudflare.com/realtime/llms-full.txt) - **PRIMARY REFERENCE** - Complete Realtime documentation in LLM-friendly format
-   [Cloudflare Realtime Overview](https://developers.cloudflare.com/realtime/)
-   [RealtimeKit Documentation](https://developers.cloudflare.com/realtime/realtimekit/)
-   [RealtimeKit Concepts](https://developers.cloudflare.com/realtime/realtimekit/concepts/)
-   [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
-   [MediaDevices API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)

---

**Status**: Proposal - Awaiting Review  
**Last Updated**: 2025-01-27
