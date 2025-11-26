# Remote Browser - Frontend Design

**Frontend-specific design and implementation requirements. This document is independent of backend implementation details.**

## Overview

Frontend implementation for the Remote Browser utility. The frontend provides a web interface for creating, controlling, and managing isolated browser containers. Users can remotely control browsers through an interactive interface with real-time screen streaming.

## Code Location

`frontend/src/pages/remote-browser/`

## API Contract Reference

See `docs/features/remote-browser/API_CONTRACT.yml` for the API contract this frontend consumes.

## Pages/Routes

### `/remote-browser`

**Component**: `RemoteBrowserPage.tsx`

**Description**: Main page for remote browser utility. Displays session list and active browser interface.

**Route Configuration**:

```typescript
<Route path="/remote-browser" element={<RemoteBrowserPage />} />
```

## Components

### RemoteBrowserPage (Main Page)

**Location**: `RemoteBrowserPage.tsx`

**Purpose**: Main page component that manages browser sessions and displays the browser interface.

**State**:

- Server state: Active sessions (TanStack Query)
- Local state: Selected session ID, browser control state, connection status

**Layout**:

- Left sidebar: Session list and controls
- Main area: Browser viewport (WebSocket stream or iframe)
- Top bar: Session controls (pause, resume, terminate, screenshot)
- Bottom bar: Browser address bar and navigation controls

### SessionList

**Location**: `components/SessionList/SessionList.tsx`

**Purpose**: Displays list of browser sessions with status and controls.

**Props**:

```typescript
interface SessionListProps {
    sessions: BrowserSession[];
    selectedSessionId: string | null;
    onSelectSession: (sessionId: string) => void;
    onTerminateSession: (sessionId: string) => void;
    onCreateSession: () => void;
}
```

**State**:

- Local state: Expanded session details

**Interactions**:

- Click session to select and view
- Click "Terminate" to end session
- Click "New Session" to create session
- Click "Pause"/"Resume" to control session state

**Styling**:

- CSS Modules: `SessionList.module.css`
- List view with session cards
- Status indicators (starting, ready, active, paused, terminated)
- Resource usage display (CPU, memory)

### BrowserViewport

**Location**: `components/BrowserViewport/BrowserViewport.tsx`

**Purpose**: Displays the remote browser screen and handles user interactions.

**Props**:

```typescript
interface BrowserViewportProps {
    sessionId: string;
    websocketUrl: string;
    onUrlChange: (url: string) => void;
    onTitleChange: (title: string) => void;
}
```

**State**:

- Local state: WebSocket connection, screen image data, connection status
- Local state: Mouse position, click handlers

**Interactions**:

- Click on browser screen → send click command
- Type in browser → send type command
- Scroll in browser → send scroll command
- Navigate via address bar → send navigate command

**Styling**:

- CSS Modules: `BrowserViewport.module.css`
- Full-screen browser display
- Loading state while connecting
- Connection status indicator
- Cursor overlay for remote control

**Implementation Notes**:

- WebSocket connection for real-time screen streaming
- Canvas or img element for displaying browser screen
- Mouse event handlers to translate clicks to browser coordinates
- Keyboard event handlers for typing

### BrowserControls

**Location**: `components/BrowserControls/BrowserControls.tsx`

**Purpose**: Browser navigation and control buttons (back, forward, refresh, etc.).

**Props**:

```typescript
interface BrowserControlsProps {
    sessionId: string;
    currentUrl: string;
    onNavigate: (url: string) => void;
    onBack: () => void;
    onForward: () => void;
    onRefresh: () => void;
    onScreenshot: () => void;
}
```

**State**:

- Local state: Navigation history (if needed)

**Interactions**:

- Address bar input → navigate to URL
- Back button → browser back
- Forward button → browser forward
- Refresh button → reload page
- Screenshot button → capture screenshot

**Styling**:

- CSS Modules: `BrowserControls.module.css`
- Browser-like toolbar
- Address bar with URL input
- Navigation buttons

### SessionControls

**Location**: `components/SessionControls/SessionControls.tsx`

**Purpose**: Session-level controls (pause, resume, terminate, settings).

**Props**:

```typescript
interface SessionControlsProps {
    session: BrowserSession;
    onPause: () => void;
    onResume: () => void;
    onTerminate: () => void;
    onScreenshot: () => void;
}
```

**State**:

- Local state: None (controlled by props)

**Interactions**:

- Pause button → pause session
- Resume button → resume session
- Terminate button → terminate session
- Screenshot button → capture screenshot
- Settings button → open session settings

**Styling**:

- CSS Modules: `SessionControls.module.css`
- Top bar with action buttons
- Status indicator
- Resource usage display

### CreateSessionDialog

**Location**: `components/CreateSessionDialog/CreateSessionDialog.tsx`

**Purpose**: Dialog for creating a new browser session with configuration options.

**Props**:

```typescript
interface CreateSessionDialogProps {
    open: boolean;
    onClose: () => void;
    onCreate: (config: CreateSessionRequest) => void;
}
```

**State**:

- Local state: Form state (Tor enabled, timeout, resource limits)

**Interactions**:

- Toggle Tor network option
- Set session timeout
- Configure resource limits
- Submit to create session

**Styling**:

- CSS Modules: `CreateSessionDialog.module.css`
- Modal dialog
- Form inputs for configuration
- Validation feedback

## State Management

### Server State (TanStack Query)

```typescript
// Query keys
const queryKeys = {
    sessions: ["remote-browser", "sessions"] as const,
    session: (id: string) => ["remote-browser", "session", id] as const,
};

// List sessions query
const useSessions = (status?: string) => {
    return useQuery({
        queryKey: [...queryKeys.sessions, status],
        queryFn: () => fetchSessions({ status }),
    });
};

// Get session query
const useSession = (sessionId: string) => {
    return useQuery({
        queryKey: queryKeys.session(sessionId),
        queryFn: () => fetchSession(sessionId),
        enabled: !!sessionId,
    });
};

// Create session mutation
const useCreateSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (config: CreateSessionRequest) => createSession(config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
        },
    });
};

// Terminate session mutation
const useTerminateSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (sessionId: string) => terminateSession(sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
        },
    });
};

// Pause session mutation
const usePauseSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (sessionId: string) => pauseSession(sessionId),
        onSuccess: (_, sessionId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.session(sessionId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
        },
    });
};

// Resume session mutation
const useResumeSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (sessionId: string) => resumeSession(sessionId),
        onSuccess: (_, sessionId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.session(sessionId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
        },
    });
};

// Capture screenshot mutation
const useCaptureScreenshot = () => {
    return useMutation({
        mutationFn: (sessionId: string) => captureScreenshot(sessionId),
    });
};
```

### Local State (React)

```typescript
// Selected session
const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

// WebSocket connection state
const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");

// Browser screen data
const [screenImage, setScreenImage] = useState<string | null>(null);

// Create session dialog
const [createDialogOpen, setCreateDialogOpen] = useState(false);
```

## API Integration

### API Client Functions

**Location**: `lib/api.ts`

```typescript
// List sessions
export const fetchSessions = async (params?: { status?: string; limit?: number; offset?: number }): Promise<SessionListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set("status", params.status);
    if (params?.limit) queryParams.set("limit", params.limit.toString());
    if (params?.offset) queryParams.set("offset", params.offset.toString());

    const response = await fetch(`/api/remote-browser/sessions?${queryParams}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch sessions");
    }

    return response.json();
};

// Get session
export const fetchSession = async (sessionId: string): Promise<BrowserSession> => {
    const response = await fetch(`/api/remote-browser/sessions/${sessionId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch session");
    }

    return response.json();
};

// Create session
export const createSession = async (config: CreateSessionRequest): Promise<BrowserSession> => {
    const response = await fetch("/api/remote-browser/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create session");
    }

    return response.json();
};

// Terminate session
export const terminateSession = async (sessionId: string): Promise<void> => {
    const response = await fetch(`/api/remote-browser/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to terminate session");
    }
};

// Pause session
export const pauseSession = async (sessionId: string): Promise<BrowserSession> => {
    const response = await fetch(`/api/remote-browser/sessions/${sessionId}/pause`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to pause session");
    }

    return response.json();
};

// Resume session
export const resumeSession = async (sessionId: string): Promise<BrowserSession> => {
    const response = await fetch(`/api/remote-browser/sessions/${sessionId}/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to resume session");
    }

    return response.json();
};

// Capture screenshot
export const captureScreenshot = async (sessionId: string): Promise<ScreenshotResponse> => {
    const response = await fetch(`/api/remote-browser/sessions/${sessionId}/screenshot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to capture screenshot");
    }

    return response.json();
};

// Control browser
export const controlBrowser = async (sessionId: string, command: BrowserControlMessage): Promise<BrowserControlResponse> => {
    const response = await fetch(`/api/remote-browser/sessions/${sessionId}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to control browser");
    }

    return response.json();
};
```

### WebSocket Integration

**Location**: `lib/websocket.ts`

```typescript
// WebSocket connection for browser control and screen streaming
export const createBrowserWebSocket = (
    websocketUrl: string,
    onMessage: (data: unknown) => void,
    onError: (error: Event) => void,
    onClose: () => void
): WebSocket => {
    const ws = new WebSocket(websocketUrl);

    ws.onopen = () => {
        console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
    };

    ws.onerror = onError;

    ws.onclose = onClose;

    return ws;
};

// Send browser control command via WebSocket
export const sendBrowserCommand = (ws: WebSocket, command: BrowserControlMessage): void => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(command));
    }
};
```

### Error Handling

- Display error messages in toast notifications
- Handle WebSocket connection errors gracefully
- Show retry options for failed operations
- Display session status errors (e.g., "Container not ready")

## User Interactions

### Primary Actions

- **Create Session**:
  - Trigger: Click "New Session" button
  - Flow: Open dialog → Configure options → Submit → Show loading → Display new session
  - Error handling: Show error message if creation fails

- **Select Session**:
  - Trigger: Click session in list
  - Flow: Update selected session → Connect WebSocket → Display browser viewport
  - Error handling: Show error if WebSocket connection fails

- **Control Browser**:
  - Trigger: Click/type/scroll in browser viewport
  - Flow: Translate user action → Send command via WebSocket → Update browser display
  - Error handling: Show error if command fails

- **Navigate**:
  - Trigger: Enter URL in address bar and press Enter
  - Flow: Send navigate command → Update address bar → Show loading state
  - Error handling: Show error if navigation fails

- **Terminate Session**:
  - Trigger: Click "Terminate" button
  - Flow: Confirm action → Call API → Remove from list → Close WebSocket
  - Error handling: Show error if termination fails

### Form Handling

- Create session form validation:
  - Session timeout: 300-28800 seconds
  - Memory limit: 256-2048 MB
  - CPU limit: 25-100%
- Address bar URL validation before navigation

## UI/UX Requirements

### Layout

- Split view: Session list (left) + Browser viewport (right)
- Responsive design: Stack vertically on mobile
- Top bar: Session controls and status
- Bottom bar: Browser navigation controls

### Visual Design

- Browser-like interface for familiarity
- Status indicators with color coding:
  - Starting: Yellow
  - Ready/Active: Green
  - Paused: Blue
  - Terminated: Gray
  - Error: Red
- Resource usage display (CPU, memory) with progress bars
- Loading states for container initialization
- Connection status indicator for WebSocket

### User Feedback

- Loading states: Show spinner while container is starting
- Error messages: Toast notifications for errors
- Success feedback: Toast notifications for successful actions
- Empty states: "No sessions" message when list is empty
- Connection status: Visual indicator for WebSocket connection

## Implementation Checklist

### Components

- [ ] RemoteBrowserPage page component
- [ ] SessionList component
- [ ] BrowserViewport component
- [ ] BrowserControls component
- [ ] SessionControls component
- [ ] CreateSessionDialog component
- [ ] CSS Modules for all components

### Pages

- [ ] Main page route configuration

### State Management

- [ ] TanStack Query setup
- [ ] API client functions
- [ ] WebSocket integration
- [ ] Error handling
- [ ] Loading states

### Styling

- [ ] CSS Modules for components
- [ ] Responsive design
- [ ] Loading/error states
- [ ] Empty states
- [ ] Browser-like interface styling

### Integration

- [ ] Connect to backend API (per API_CONTRACT.yml)
- [ ] WebSocket connection for browser control
- [ ] Handle errors gracefully
- [ ] Real-time screen streaming

## Dependencies

### React Libraries

- `react-router-dom`: Routing
- `@tanstack/react-query`: Data fetching
- Standard React hooks

### WebSocket

- Native WebSocket API for browser control and screen streaming

## Performance Considerations

- Optimize WebSocket message handling (throttle screen updates if needed)
- Lazy load browser viewport component
- Debounce user input in address bar
- Cache session list with appropriate refetch intervals

## Accessibility

- Semantic HTML: Use proper form elements and buttons
- ARIA labels: Label all interactive elements
- Keyboard navigation: Support keyboard shortcuts for browser controls
- Screen reader support: Announce session status changes and errors

---

**Note**: This document is independent of backend implementation. Only the API contract in API_CONTRACT.yml couples frontend and backend.

