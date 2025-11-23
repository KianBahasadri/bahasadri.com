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

**Route**: `/`

## Components

### Home (Main Page)

**Location**: `Home.tsx`

**Purpose**: Landing page that displays the hero section, welcome message, tools grid, and collapsible chatbox

**State**:

-   Server state:
    -   Welcome message (TanStack Query)
    -   Chat messages (TanStack Query)
-   Local state:
    -   Audio context for sound effects
    -   Heartbeat sound interval management
    -   Chat input state
    -   Conversation ID for maintaining context
    -   Chat open/closed state (default: closed)

**Layout**:

-   Main container with terminal scanline background
-   Particle system overlay
-   Screen border glow effect
-   Hero section with dynamically loaded welcome message
-   Adaptive content layout:
    -   **When chat is closed**: Full-width tools grid, centered
    -   **When chat is open (desktop)**: Split layout with left-justified tools grid (~65-70% width) and chatbox on right side (~30-35% width)
    -   **When chat is open (mobile/tablet)**: Tools grid on top (full width), chatbox below (full width)
-   Chat toggle button (heart emoji ❤️) fixed in bottom-right corner when chat is closed

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
-   Displays a randomly generated welcome message fetched from the backend API
-   Example messages: "You entered my domain~ ♡", "I've been waiting for you~ ♡", etc.
-   Uses `data-text` attribute for styling effects
-   Glitch animation on text
-   Glowing text shadows matching terminal/cyberpunk aesthetic
-   Message is fetched on page load via `GET /api/home/welcome`
-   Different message on each page visit/refresh (randomized by backend)

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

**Purpose**: Collapsible interactive chat interface for conversing with the yandere agent

**Visibility Behavior**:

-   **Default state**: Hidden
-   **Toggle mechanism**: Heart emoji button (❤️) in bottom-right corner
-   **Opening**: Slides in from the right side with smooth animation
-   **Closing**: Heart break emoji button (💔) inside chat panel, slides out to the right with smooth animation

**Layout Behavior**:

-   **Desktop (when open)**:
    -   Chat panel on right side (~30-35% width)
    -   Tools grid becomes left-justified (~65-70% width)
    -   No overlap - content reflows smoothly
-   **Mobile/Tablet (when open)**:
    -   Chat panel appears below tools grid
    -   Both sections full-width, stacked vertically

**State**:

-   Server state: Chat messages (TanStack Query mutation)
-   Local state:
    -   Message input value
    -   Conversation ID (persisted in component state)
    -   Sending status
    -   Message history (local message list)
    -   Open/closed state (managed by parent or internally)

**Interactions**:

-   User clicks heart emoji (❤️) button in bottom-right corner
-   Chat panel slides in from right with smooth animation
-   User types message in input field
-   User sends message (click send button or press Enter)
-   Message appears in chat history immediately with animation
-   API request sent to backend with current conversationId (if exists)
-   Agent response appears after processing with animation
-   ConversationId stored from response and included in all subsequent requests
-   Scroll to latest message automatically
-   User clicks heartbreak emoji (💔) to close chat
-   Chat panel slides out to right with smooth animation

**Styling**:

-   CSS Modules: `Chatbox.module.css`
-   Terminal/cyberpunk aesthetic matching home page
-   Chat bubble style for messages
-   User messages and agent messages visually distinct
-   Loading indicator while waiting for agent response
-   Smooth slide-in/slide-out animations (300-500ms duration)
-   Message appearance animations (fade in, slide up, or similar)
-   Heartbreak close button (💔) positioned prominently (top corner of chat panel)

### Chat Toggle Button

**Location**: Part of `Home.tsx` or separate component

**Purpose**: Toggle button to open/close the chatbox

**Visual Design**:

-   **When chat is closed**: Heart emoji (❤️) button
-   **Position**: Fixed in bottom-right corner of viewport
-   **Size**: Large enough to be easily clickable (~60-80px diameter)
-   **Styling**: 
    -   Circular button with terminal/cyberpunk aesthetic
    -   Glowing border matching theme colors
    -   Pulsing animation to draw attention
    -   Semi-transparent background
    -   Hover effect: Enlarged scale, brighter glow

**Behavior**:

-   Visible when chat is closed
-   Hidden when chat is open (heartbreak emoji takes over as close button)
-   Click toggles chat open
-   Smooth fade-in when chat closes

**Accessibility**:

-   Aria label: "Open chat" or "Chat with agent"
-   Keyboard accessible (focusable, Enter/Space to activate)
-   Screen reader friendly

## State Management

### Server State

-   Welcome message fetched via TanStack Query (GET request on mount)
-   Chat messages managed via TanStack Query mutation
-   Send chat message mutation includes conversationId when available

### Local State

-   Audio context for sound effects
-   Heartbeat sound interval management
-   Chat input value
-   Conversation ID for maintaining context (stored after first message, reused for all subsequent messages)
-   Message history (array of ChatMessage objects)
-   Chat open/closed state (boolean, default: false)

## API Integration

### Welcome Message API

**Endpoint**: `GET /api/home/welcome`

**When to call**: On Home component mount (page load)

**Implementation**:

-   Use TanStack Query's `useQuery` hook
-   Query key: `['welcome']`
-   Fetch welcome message from backend
-   Display in hero section
-   Handle loading state with placeholder or skeleton
-   Handle error state gracefully (show default message)

**Example**:

```typescript
const {
    data: welcomeData,
    isLoading,
    isError,
} = useQuery({
    queryKey: ["welcome"],
    queryFn: async () => {
        const response = await fetch(`${API_BASE_URL}/home/welcome`);
        if (!response.ok) throw new Error("Failed to fetch welcome message");
        return response.json() as Promise<WelcomeResponse>;
    },
});

const welcomeMessage = welcomeData?.message || "Welcome~ ♡"; // fallback
```

### Chat API

**Endpoint**: `POST /api/home/chat`

**When to call**: When user sends a chat message

**Implementation**:

-   Use TanStack Query's `useMutation` hook
-   Include `conversationId` in request if available (from previous response)
-   Store `conversationId` from response for subsequent requests
-   Handle response and update conversation state
-   Add both user message and agent response to local message history

**Conversation ID Management**:

1. Initialize `conversationId` state as `null` or `undefined`
2. On first message: Send request without `conversationId`
3. Backend returns a new `conversationId` in response
4. Store `conversationId` in component state
5. On subsequent messages: Include stored `conversationId` in request
6. Backend returns same `conversationId` in response
7. Continue using same `conversationId` for entire session

**Example**:

```typescript
const [conversationId, setConversationId] = useState<string | undefined>(
    undefined
);

const mutation = useMutation({
    mutationFn: async (message: string) => {
        const response = await fetch(`${API_BASE_URL}/home/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message,
                conversationId, // undefined on first message, populated after
            }),
        });
        if (!response.ok) throw new Error("Failed to send message");
        return response.json() as Promise<ChatResponse>;
    },
    onSuccess: (data) => {
        // Store conversationId from response
        setConversationId(data.conversationId);
        // Add agent response to message history
        addMessageToHistory({ role: "agent", content: data.response });
    },
});
```

### Error Handling

-   Display error messages to user if message sending fails
-   Show user-friendly error message (don't expose technical details)
-   Retry logic for network errors (optional)
-   Graceful degradation if API is unavailable
-   Handle welcome message fetch errors with fallback message

## Welcome Message System

### Message Loading

-   Fetch welcome message from backend API on page load
-   Use TanStack Query for loading state management
-   Display loading skeleton or placeholder while fetching
-   Show fallback message if fetch fails
-   Backend randomizes the message, frontend just displays it

### Visual Effects

**Glitch Animation**:

-   Intermittent glitching effect on hero title text
-   Color shifts and transforms
-   Layered glitch effect

**Glowing Text Shadows**:

-   Multiple text-shadow layers
-   Pink/cyan terminal colors (`--pink-hot`, `--terminal-cyan`)
-   Pulsing glow animation matching screen border effect
-   Enhanced visibility and cyberpunk aesthetic

## User Interactions

### Primary Actions

-   **Navigate to Tool**:

    -   Trigger: Click on enabled tool card
    -   Flow: Navigate to tool page
    -   Error handling: N/A (client-side routing)

-   **Hover Sound Effect**:

    -   Trigger: Mouse enter on enabled tool card
    -   Flow: Start heartbeat sound
    -   Error handling: Gracefully handles missing AudioContext support

-   **Stop Sound Effect**:

    -   Trigger: Mouse leave on enabled tool card
    -   Flow: Stop heartbeat sound

-   **Open Chat**:

    -   Trigger: Click heart emoji (❤️) button in bottom-right corner
    -   Flow:
        1. Set chat open state to true
        2. Hide heart button with fade-out animation
        3. Slide chat panel in from right side (300-500ms smooth animation)
        4. Reflow tools grid to left side on desktop
        5. Focus on chat input field (optional)
    -   Error handling: N/A (local state change)

-   **Close Chat**:

    -   Trigger: Click heartbreak emoji (💔) button in chat panel
    -   Flow:
        1. Set chat open state to false
        2. Slide chat panel out to right side (300-500ms smooth animation)
        3. Reflow tools grid to centered position
        4. Show heart button with fade-in animation
    -   Error handling: N/A (local state change)

-   **Send Chat Message**:

    -   Trigger: Click send button or press Enter in chat input
    -   Flow:
        1. Validate input (non-empty)
        2. Add user message to local history immediately with animation
        3. Send API request with message and conversationId (if available)
        4. Show loading indicator
        5. On success: Store conversationId, add agent response to history with animation
        6. On error: Display error message, allow retry
        7. Scroll to latest message smoothly
    -   Error handling: Display error message if request fails, allow retry

-   **Receive Agent Response**:
    -   Trigger: API response received
    -   Flow: Store conversationId, add agent message to history with animation, scroll to latest message smoothly
    -   Error handling: Handle malformed responses gracefully

### Sound Effects

**Heartbeat Sound**:

-   Generated using Web Audio API
-   Double beat pattern
-   Plays continuously while hovering over enabled tool cards
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

-   Loading states:
    -   Show skeleton/placeholder for welcome message while loading
    -   Show loading indicator when sending message and waiting for agent response
    -   Show typing indicator (optional) while waiting for agent response
-   Error messages:
    -   Display error message if welcome message fetch fails (use fallback)
    -   Display error message if chat API call fails
-   Success feedback:
    -   Visual hover effects on enabled cards
    -   Message appears in chat history immediately
    -   Agent response appears after processing
-   Empty states: Show placeholder text in chatbox when no messages
-   Disabled state: Disabled tool cards are visually distinct and non-interactive

## Implementation Checklist

### Components

-   [x] Home page component
-   [ ] Chatbox component
-   [x] CSS Modules for styling

### Pages

-   [x] Main page route configuration

### State Management

-   [x] Audio context management
-   [x] Sound effect interval management
-   [x] Error handling for missing AudioContext
-   [ ] TanStack Query setup for welcome message
-   [ ] TanStack Query setup for chat
-   [ ] API client functions (welcome, chat)
-   [ ] Welcome message loading/error states
-   [ ] Chat message state management
-   [ ] Conversation ID management (store from first response, reuse in all subsequent requests)

### Styling

-   [x] CSS Modules for components
-   [x] Responsive design
-   [x] Visual effects (scanlines, particles, border glow)
-   [ ] Glitch animation for hero title
-   [ ] Glowing text shadows for hero title
-   [x] Hover states for enabled tools
-   [x] Disabled states for coming soon tools

### Integration

-   [x] React Router integration
-   [x] Link components for enabled tools
-   [x] Disabled buttons for coming soon tools
-   [ ] Connect to backend welcome API (per API_CONTRACT.md)
-   [ ] Connect to backend chat API (per API_CONTRACT.md)
-   [ ] Handle errors gracefully

## Dependencies

### React Libraries

-   `react-router-dom`: Routing and Link components
-   `@tanstack/react-query`: Data fetching and mutations
-   Standard React hooks (`useRef`, `useState`, `useEffect`)

### Browser APIs

-   Web Audio API: For heartbeat sound effects (with fallback for unsupported browsers)

## Performance Considerations

-   Particle system should render reasonable number of particles (20)
-   Sound effects use Web Audio API
-   CSS animations use GPU-accelerated properties
-   Minimize unnecessary re-renders
-   Chat message history: Consider limiting displayed messages or virtual scrolling for long conversations
-   API calls: Cache welcome message, persist conversationId in component state
-   Welcome message: Cache with TanStack Query to avoid refetching on remount

## Accessibility

-   Semantic HTML: Uses `<main>`, `<section>`, `<h1>`, `<h3>` elements, proper form elements for chat input
-   ARIA labels: Tool cards should have descriptive labels, chatbox should have proper labels, welcome message loading state announced
-   Keyboard navigation: Link components are keyboard accessible, chat input supports Enter to send
-   Screen reader support: Disabled buttons should indicate "coming soon" status, chat messages should be announced, welcome message announced when loaded
-   Sound effects: Optional enhancement, doesn't block core functionality
-   Chat accessibility: Ensure chat messages are readable by screen readers, proper focus management
-   Loading states: Properly announced to screen readers

---

**Note**: This document is independent of backend implementation. Only the API contract in API_CONTRACT.md couples frontend and backend.
