# WhatsApp Messenger - Frontend Design

**Frontend-specific design and implementation requirements. This document is independent of backend implementation details.**

## Overview

Frontend implementation for the WhatsApp Messenger utility. Provides a chat-style interface for sending and receiving WhatsApp messages, managing contacts, and viewing conversation threads.

## Code Location

`frontend/src/pages/whatsapp-messenger/`

## API Contract Reference

See `docs/features/whatsapp-messenger/API_CONTRACT.md` for the API contract this frontend consumes.

## Pages/Routes

### `/whatsapp-messenger`

**Component**: `WhatsAppMessenger.tsx`

**Description**: Main page for WhatsApp messaging utility

**Route Configuration**:

```typescript
<Route path="/whatsapp-messenger" element={<WhatsAppMessenger />} />
```

## Components

### WhatsAppMessenger (Main Page)

**Location**: `WhatsAppMessenger.tsx`

**Purpose**: Main page component that renders the WhatsApp interface

**State**:

-   Server state: Initial threads, messages, contacts (TanStack Query)
-   Local state: None (delegates to WhatsAppInterface)

### WhatsAppInterface

**Location**: `components/WhatsAppInterface/WhatsAppInterface.tsx`

**Purpose**: Main chat interface component

**Props**:

```typescript
interface WhatsAppInterfaceProps {
    initialThreads: ThreadSummary[];
    initialMessages: Message[];
    initialContacts: Contact[];
    initialCounterpart: string | null;
}
```

**State**:

-   Local state: Threads, contacts, message cache, active counterpart
-   Local state: Draft number, message body, sending status
-   Local state: Polling state and counter

**Interactions**:

-   Select thread from sidebar
-   Send WhatsApp message
-   Poll for new messages (2-second interval, max 1000 attempts)
-   Manage contacts (create, update)
-   Message deduplication

**Styling**:

-   CSS Modules: `WhatsAppInterface.module.css`
-   Chat-style layout with sidebar and main area

### MessageList

**Location**: `components/MessageList/MessageList.tsx`

**Purpose**: Displays messages in a chat bubble format

**Props**:

```typescript
interface MessageListProps {
    messages: Message[];
    contacts: Contact[];
    counterpart: string;
}
```

**State**:

-   None (presentational component)

**Interactions**:

-   Display messages with proper formatting
-   Show sent vs received styling
-   Display contact names when available

**Styling**:

-   CSS Modules: `MessageList.module.css`
-   Chat bubble layout
-   Sent/received message styling

## State Management

### Server State (TanStack Query)

```typescript
// Query keys
const queryKeys = {
    threads: ["whatsapp-messenger", "threads"] as const,
    messages: (counterpart: string) =>
        ["whatsapp-messenger", "messages", counterpart] as const,
    contacts: ["whatsapp-messenger", "contacts"] as const,
};

// TanStack Query hooks
const useThreads = () => {
    return useQuery({
        queryKey: queryKeys.threads,
        queryFn: () => fetchThreads(),
    });
};

const useMessages = (counterpart: string, cursor?: string) => {
    return useQuery({
        queryKey: [...queryKeys.messages(counterpart), cursor],
        queryFn: () => fetchMessages(counterpart, cursor),
        enabled: !!counterpart,
    });
};
```

### Local State (React)

```typescript
// Message cache
const [messageCache, setMessageCache] = useState<Record<string, Message[]>>({});

// Active conversation
const [activeCounterpart, setActiveCounterpart] = useState<string | null>(null);

// Polling state
const [pollCounter, setPollCounter] = useState(0);
const POLL_MAX_ATTEMPTS = 1000;
```

## API Integration

### API Client Functions

**Location**: `lib/api.ts`

```typescript
// Send WhatsApp message
export const sendWhatsApp = async (
    phoneNumber: string,
    message: string
): Promise<SendWhatsAppResponse> => {
    const response = await fetch("/api/whatsapp-messenger/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, message }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send WhatsApp message");
    }

    return response.json();
};

// Get messages
export const fetchMessages = async (
    counterpart: string,
    cursor?: string,
    limit?: number
): Promise<MessagesResponse> => {
    const params = new URLSearchParams({ counterpart });
    if (cursor) params.append("cursor", cursor);
    if (limit) params.append("limit", limit.toString());

    const response = await fetch(`/api/whatsapp-messenger/messages?${params}`);
    if (!response.ok) throw new Error("Failed to fetch messages");
    return response.json();
};

// Poll for new messages
export const pollMessagesSince = async (
    since: number
): Promise<MessagesSinceResponse> => {
    const response = await fetch(
        `/api/whatsapp-messenger/messages-since?since=${since}`
    );
    if (!response.ok) throw new Error("Failed to poll messages");
    return response.json();
};

// Get threads
export const fetchThreads = async (): Promise<ThreadListResponse> => {
    const response = await fetch("/api/whatsapp-messenger/threads");
    if (!response.ok) throw new Error("Failed to fetch threads");
    return response.json();
};

// Get contacts
export const fetchContacts = async (): Promise<ContactListResponse> => {
    const response = await fetch("/api/whatsapp-messenger/contacts");
    if (!response.ok) throw new Error("Failed to fetch contacts");
    return response.json();
};

// Create contact
export const createContact = async (
    phoneNumber: string,
    displayName: string
): Promise<ContactMutationResult> => {
    const response = await fetch("/api/whatsapp-messenger/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, displayName }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create contact");
    }

    return response.json();
};
```

### Error Handling

-   Send errors: Display inline error message
-   Poll errors: Log but don't interrupt polling
-   API errors: Show toast notification
-   Network errors: Retry logic for polling

## User Interactions

### Primary Actions

-   **Send WhatsApp Message**:

    -   Trigger: Submit form or Enter key
    -   Flow: Validate → Send → Update cache → Clear input
    -   Error handling: Show error, allow retry

-   **Select Thread**:

    -   Trigger: Click thread in sidebar
    -   Flow: Load messages → Update active counterpart → Display messages

-   **Poll for Updates**:

    -   Trigger: Automatic (every 2 seconds)
    -   Flow: Fetch new messages → Update cache → Refresh threads
    -   Limit: Max 1000 attempts (~33 hours)

-   **Create Contact**:
    -   Trigger: Click create contact button
    -   Flow: Show form → Submit → Update contacts list

### Form Handling

-   Phone number validation: E.164 format
-   Message validation: Non-empty, length limits
-   Contact form: Phone number and display name validation
-   Error display: Inline errors for forms

## UI/UX Requirements

### Layout

-   Full-screen chat interface
-   Sidebar: Thread list on left
-   Main area: Messages and composer on right
-   Responsive: Mobile-friendly layout

### Visual Design

-   Chat bubbles: Sent (right) vs received (left)
-   Thread sidebar: Last message preview, unread indicators
-   Contact names: Display when available, fallback to phone number
-   Status indicators: Sending, sent, failed

### User Feedback

-   Loading states: Sending indicator, message loading
-   Error messages: Inline errors, toast notifications
-   Success feedback: Message appears in chat
-   Empty states: No messages, no threads

## Implementation Checklist

### Components

-   [ ] WhatsAppMessenger page component
-   [ ] WhatsAppInterface component
-   [ ] MessageList component
-   [ ] CSS Modules for all components

### Pages

-   [ ] Main page route configuration

### State Management

-   [ ] TanStack Query setup
-   [ ] API client functions
-   [ ] Polling logic with max attempts
-   [ ] Message cache management
-   [ ] Error handling

### Styling

-   [ ] CSS Modules for components
-   [ ] Responsive design
-   [ ] Chat bubble styling
-   [ ] Loading/error states
-   [ ] Empty states

### Integration

-   [ ] Connect to backend API (per API_CONTRACT.md)
-   [ ] Handle errors gracefully

## Dependencies

### React Libraries

-   `react-router-dom`: Routing
-   `@tanstack/react-query`: Data fetching
-   Standard React hooks

## Performance Considerations

-   Message caching: Cache messages per counterpart
-   Polling optimization: Only poll when page is active
-   Message deduplication: Prevent duplicate messages
-   Code splitting: Lazy load message list component

## Accessibility

-   Semantic HTML: Use proper form elements
-   ARIA labels: Label inputs and buttons
-   Keyboard navigation: Support keyboard shortcuts
-   Screen reader support: Announce new messages

---

**Note**: This document is independent of backend implementation. Only the API contract in API_CONTRACT.md couples frontend and backend.

