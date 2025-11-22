# Home Page - Frontend Design

**Frontend-specific design and implementation requirements. This document is independent of backend implementation details.**

## Overview

Frontend implementation for the Home page landing page. The home page serves as the entry point to the application, featuring a terminal/cyberpunk aesthetic with visual effects, a grid of tool cards for navigation, and a chatbox for interacting with the yandere agent.

## Code Location

`frontend/src/pages/Home/`

## API Contract Reference

See `docs/features/home/API_CONTRACT.md` for the API contract this frontend consumes.

## Pages/Routes

### `/`

**Component**: `Home.tsx`

**Description**: Main landing page for the application

**Route Configuration**:

```typescript
<Route path="/" element={<Home />} />
```

## Components

### Home (Main Page)

**Location**: `Home.tsx`

**Purpose**: Landing page that displays the hero section and tools grid

**State**:

-   Server state: Chat messages (TanStack Query)
-   Local state:
    -   `audioContextRef`: Reference to Web Audio API context for sound effects
    -   `heartbeatIntervalRef`: Reference to heartbeat sound interval
    -   Chat input state
    -   Conversation ID for maintaining context

**Layout**:

-   Main container with terminal scanline background
-   Particle system overlay
-   Screen border glow effect
-   Hero section with title
-   Tools grid section
-   Chatbox component

### Visual Effects Components

**Terminal Background**:

-   CSS class: `bgTerminal`
-   Provides terminal-style background effect

**Scanlines**:

-   CSS class: `scanlines`
-   Animated scanline overlay for terminal aesthetic

**Particles**:

-   CSS class: `particles`
-   Container for animated emoji particles (♡, 💊, 🩹, ✨, 💕, 💉, 🔪, 💖)
-   Renders 20 particles with cycling emoji icons

**Screen Border**:

-   CSS class: `screenBorder`
-   Fixed position border with pulsing glow animation

**Hero Section**:

-   CSS class: `hero`
-   Displays the main title: "You entered my domain~ ♡"
-   Uses `data-text` attribute for styling effects

**Tools Grid**:

-   CSS class: `toolsGrid`
-   Grid layout displaying tool cards
-   Each tool card:
    -   Icon emoji
    -   Tool title
    -   Enabled tools: `Link` component (SMS Messenger, Calculator)
    -   Disabled tools: `button` with `disabled` attribute

### Chatbox Component

**Location**: `components/Chatbox/Chatbox.tsx`

**Purpose**: Interactive chat interface for conversing with the yandere agent

**Props**:

```typescript
interface ChatboxProps {
    // Optional props if needed for styling or configuration
}
```

**State**:

-   Server state: Chat messages (TanStack Query)
-   Local state:
    -   Message input value
    -   Conversation ID
    -   Sending status
    -   Message history

**Interactions**:

-   User types message in input field
-   User sends message (click send button or press Enter)
-   Message appears in chat history
-   Agent response appears after processing
-   Scroll to latest message automatically

**Styling**:

-   CSS Modules: `Chatbox.module.css`
-   Terminal/cyberpunk aesthetic matching home page
-   Chat bubble style for messages
-   User messages and agent messages visually distinct

## State Management

### Server State (TanStack Query)

```typescript
// Query keys
const queryKeys = {
    chat: ["home", "chat"] as const,
};

// Send chat message mutation
const useSendChatMessage = () => {
    return useMutation({
        mutationFn: (message: string, conversationId?: string) =>
            sendChatMessage(message, conversationId),
    });
};
```

### Local State (React)

```typescript
// Audio context for sound effects
const audioContextRef = useRef<AudioContext | null>(null);

// Interval reference for heartbeat sound
const heartbeatIntervalRef = useRef<number | null>(null);

// Chat input state
const [messageInput, setMessageInput] = useState<string>("");

// Conversation ID for maintaining context
const [conversationId, setConversationId] = useState<string | undefined>();

// Message history
const [messages, setMessages] = useState<ChatMessage[]>([]);
```

## API Integration

### API Client Functions

**Location**: `lib/api.ts`

```typescript
// Send chat message to yandere agent
export const sendChatMessage = async (
    message: string,
    conversationId?: string
): Promise<ChatResponse> => {
    const response = await fetch("/api/home/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversationId }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
    }

    return response.json();
};
```

### Error Handling

-   Display error messages to user if message sending fails
-   Retry logic for network errors (optional)
-   Graceful degradation if API is unavailable

## User Interactions

### Primary Actions

-   **Navigate to Tool**:
    -   Trigger: Click on enabled tool card (Link component)
    -   Flow: React Router navigation to tool page
    -   Error handling: N/A (client-side routing)

-   **Hover Sound Effect**:
    -   Trigger: Mouse enter on enabled tool card
    -   Flow: Start heartbeat sound interval
    -   Error handling: Gracefully handles missing AudioContext support

-   **Stop Sound Effect**:
    -   Trigger: Mouse leave on enabled tool card
    -   Flow: Clear heartbeat interval
    -   Error handling: Checks for existing interval before clearing

-   **Send Chat Message**:
    -   Trigger: Click send button or press Enter in chat input
    -   Flow: Validate input, send API request, display user message, wait for agent response, display response
    -   Error handling: Display error message if request fails, allow retry

-   **Receive Agent Response**:
    -   Trigger: API response received
    -   Flow: Update conversation ID, add agent message to history, scroll to latest message
    -   Error handling: Handle malformed responses gracefully

### Sound Effects

**Heartbeat Sound**:

-   Uses Web Audio API to generate heartbeat sound
-   Frequency: 60Hz sine wave
-   Duration: 150ms per beat
-   Pattern: Double beat (two beats 150ms apart) every 1500ms
-   Fallback: Silently fails if AudioContext is not available

## UI/UX Requirements

### Layout

-   Centered main container with max-width: 1200px
-   Responsive padding: 3rem 2rem
-   Full viewport height minimum
-   Tools grid with responsive card layout

### Visual Design

-   Terminal/cyberpunk aesthetic:
    -   Dark background (`--dark-void`, `--dark-surface`)
    -   Pink/cyan terminal colors (`--pink-hot`, `--terminal-green`, `--terminal-cyan`)
    -   Scanline effects
    -   Glowing borders
-   Particle system with emoji animations
-   Pulsing screen border glow animation

### User Feedback

-   Loading states: Show loading indicator when sending message and waiting for agent response
-   Error messages: Display error message if chat API call fails
-   Success feedback: Visual hover effects on enabled cards, message appears in chat history
-   Empty states: Show placeholder text in chatbox when no messages
-   Disabled state: Disabled tool cards are visually distinct and non-interactive
-   Typing indicator: Optional typing indicator while waiting for agent response

## Implementation Checklist

### Components

-   [x] Home page component
-   [ ] Chatbox component
-   [x] CSS Modules for styling
-   [ ] Component tests

### Pages

-   [x] Main page route configuration
-   [ ] Page tests

### State Management

-   [x] Audio context management
-   [x] Sound effect interval management
-   [x] Error handling for missing AudioContext
-   [ ] TanStack Query setup for chat
-   [ ] API client functions
-   [ ] Chat message state management
-   [ ] Conversation ID management

### Styling

-   [x] CSS Modules for components
-   [x] Responsive design
-   [x] Visual effects (scanlines, particles, border glow)
-   [x] Hover states for enabled tools
-   [x] Disabled states for coming soon tools

### Integration

-   [x] React Router integration
-   [x] Link components for enabled tools
-   [x] Disabled buttons for coming soon tools
-   [ ] Connect to backend API (per API_CONTRACT.md)
-   [ ] Test API calls
-   [ ] Handle errors gracefully
-   [ ] Test error scenarios

## Testing Considerations

### Unit Tests

-   Component rendering
-   Sound effect triggering on hover
-   Sound effect stopping on mouse leave
-   Navigation to tool pages
-   Disabled tool cards are not clickable
-   Chatbox component rendering
-   Message input handling
-   Message sending functionality
-   Message history display
-   Error handling for failed API calls

### Integration Tests

-   React Router navigation
-   Audio context initialization
-   Interval management
-   API integration for chat
-   Message sending and receiving flow
-   Conversation ID management
-   Error scenarios

## Dependencies

### React Libraries

-   `react-router-dom`: Routing and Link components
-   `@tanstack/react-query`: Data fetching and mutations
-   Standard React hooks (`useRef`, `useState`, `useEffect`)

### Browser APIs

-   Web Audio API: For heartbeat sound effects (with fallback for unsupported browsers)

## Performance Considerations

-   Particle system renders 20 particles (reasonable for performance)
-   Sound effects use Web Audio API (efficient, hardware-accelerated)
-   CSS animations use GPU-accelerated properties (transform, opacity)
-   No unnecessary re-renders (refs used for audio context and intervals)
-   Chat message history: Limit displayed messages or implement virtual scrolling for long conversations
-   API calls: Debounce or throttle if needed, cache conversation ID

## Accessibility

-   Semantic HTML: Uses `<main>`, `<section>`, `<h1>`, `<h3>` elements, proper form elements for chat input
-   ARIA labels: Tool cards should have descriptive labels, chatbox should have proper labels
-   Keyboard navigation: Link components are keyboard accessible, chat input supports Enter to send
-   Screen reader support: Disabled buttons should indicate "coming soon" status, chat messages should be announced
-   Sound effects: Optional enhancement, doesn't block core functionality
-   Chat accessibility: Ensure chat messages are readable by screen readers, proper focus management

---

**Note**: This document is independent of backend implementation. Only the API contract in API_CONTRACT.md couples frontend and backend.

