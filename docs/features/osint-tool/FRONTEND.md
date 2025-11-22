# OSINT Tool - Frontend Design

**Frontend-specific design and implementation requirements. This document is independent of backend implementation details.**

## Overview

Frontend implementation for the OSINT Tool utility. Provides a user interface for searching usernames, email addresses, and domains to gather publicly available information from various sources.

## Code Location

`frontend/src/pages/osint-tool/`

## API Contract Reference

See `docs/features/osint-tool/API_CONTRACT.md` for the API contract this frontend consumes.

## Pages/Routes

### `/osint-tool`

**Component**: `OsintTool.tsx`

**Description**: Main page for OSINT tool utility

**Route Configuration**:

```typescript
<Route path="/osint-tool" element={<OsintTool />} />
```

## Components

### OsintTool (Main Page)

**Location**: `OsintTool.tsx`

**Purpose**: Main page component that provides search interface and displays results for OSINT queries

**State**:

-   Server state: TanStack Query for API calls
-   Local state: Search mode, query input, active results

**Layout**:

-   Header with tool name and description
-   Search mode selector (Username, Email, Domain, Breach Check)
-   Search input form
-   Results display area
-   Loading and error states

### SearchModeSelector

**Location**: `components/SearchModeSelector/SearchModeSelector.tsx`

**Purpose**: Allows users to select the type of search to perform

**Props**:

```typescript
interface SearchModeSelectorProps {
    mode: "username" | "email" | "domain" | "breach";
    onModeChange: (mode: "username" | "email" | "domain" | "breach") => void;
}
```

**State**:

-   Selected mode

**Interactions**:

-   Click to switch between search modes
-   Visual indication of active mode

**Styling**:

-   CSS Modules: `SearchModeSelector.module.css`
-   Tab-style interface with active state highlighting

### SearchForm

**Location**: `components/SearchForm/SearchForm.tsx`

**Purpose**: Input form for entering search queries

**Props**:

```typescript
interface SearchFormProps {
    mode: "username" | "email" | "domain" | "breach";
    onSubmit: (query: string) => void;
    isLoading: boolean;
}
```

**State**:

-   Input value
-   Validation state

**Interactions**:

-   Text input for query
-   Submit button
-   Input validation based on mode (email format, domain format, etc.)

**Styling**:

-   CSS Modules: `SearchForm.module.css`
-   Form layout with input and submit button

### ResultsDisplay

**Location**: `components/ResultsDisplay/ResultsDisplay.tsx`

**Purpose**: Displays search results in an organized, readable format

**Props**:

```typescript
interface ResultsDisplayProps {
    mode: "username" | "email" | "domain" | "breach";
    results: UsernameSearchResponse | EmailLookupResponse | DomainInfoResponse | BreachCheckResponse;
}
```

**State**:

-   Expanded/collapsed sections
-   Export state

**Interactions**:

-   Expand/collapse result sections
-   Copy results to clipboard
-   Export results (JSON/CSV)

**Styling**:

-   CSS Modules: `ResultsDisplay.module.css`
-   Card-based layout for different result types
-   Collapsible sections for large results

## State Management

### Server State (TanStack Query)

```typescript
// Query keys
const queryKeys = {
    usernameSearch: ["osint-tool", "username-search"] as const,
    emailLookup: ["osint-tool", "email-lookup"] as const,
    domainInfo: ["osint-tool", "domain-info"] as const,
    breachCheck: ["osint-tool", "breach-check"] as const,
};

// TanStack Query hooks
const useUsernameSearch = (username: string, enabled: boolean) => {
    return useQuery({
        queryKey: [...queryKeys.usernameSearch, username],
        queryFn: () => searchUsername(username),
        enabled: enabled && username.length > 0,
    });
};

const useEmailLookup = (email: string, enabled: boolean) => {
    return useQuery({
        queryKey: [...queryKeys.emailLookup, email],
        queryFn: () => lookupEmail(email),
        enabled: enabled && email.length > 0,
    });
};

const useDomainInfo = (domain: string, enabled: boolean) => {
    return useQuery({
        queryKey: [...queryKeys.domainInfo, domain],
        queryFn: () => getDomainInfo(domain),
        enabled: enabled && domain.length > 0,
    });
};

const useBreachCheck = (email: string, enabled: boolean) => {
    return useQuery({
        queryKey: [...queryKeys.breachCheck, email],
        queryFn: () => checkBreach(email),
        enabled: enabled && email.length > 0,
    });
};
```

### Local State (React)

```typescript
// Search mode state
const [searchMode, setSearchMode] = useState<"username" | "email" | "domain" | "breach">("username");

// Query input state
const [query, setQuery] = useState<string>("");

// Search trigger state (to control when queries execute)
const [shouldSearch, setShouldSearch] = useState<boolean>(false);
```

## API Integration

### API Client Functions

**Location**: `lib/api.ts`

```typescript
// Username search
export const searchUsername = async (username: string): Promise<UsernameSearchResponse> => {
    const response = await fetch("/api/osint-tool/username-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to search username");
    }

    return response.json();
};

// Email lookup
export const lookupEmail = async (email: string): Promise<EmailLookupResponse> => {
    const response = await fetch("/api/osint-tool/email-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to lookup email");
    }

    return response.json();
};

// Domain info
export const getDomainInfo = async (domain: string): Promise<DomainInfoResponse> => {
    const response = await fetch("/api/osint-tool/domain-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get domain info");
    }

    return response.json();
};

// Breach check
export const checkBreach = async (email: string): Promise<BreachCheckResponse> => {
    const response = await fetch("/api/osint-tool/breach-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to check breach");
    }

    return response.json();
};
```

### Error Handling

-   Display user-friendly error messages
-   Handle rate limit errors with retry suggestions
-   Show validation errors for invalid input
-   Display network errors with retry options

## User Interactions

### Primary Actions

-   **Search**:
    -   Trigger: Submit button click or Enter key
    -   Flow: Validate input → Call API → Display results
    -   Error handling: Show error message, allow retry

-   **Mode Switch**:
    -   Trigger: Click on mode selector
    -   Flow: Update mode → Clear previous results → Update input placeholder/validation

-   **Export Results**:
    -   Trigger: Export button click
    -   Flow: Format results → Download as JSON/CSV

### Form Handling

-   Input validation based on selected mode:
    -   Username: Non-empty string
    -   Email: Valid email format
    -   Domain: Valid domain format
    -   Breach: Valid email format
-   Real-time validation feedback
-   Disable submit button when input is invalid or search is in progress

## UI/UX Requirements

### Layout

-   Centered layout with max-width container
-   Search controls at top
-   Results displayed below search area
-   Responsive design for mobile and desktop

### Visual Design

-   Clear visual separation between search area and results
-   Color-coded results by type (found/not found, breach severity, etc.)
-   Icons for different platforms and result types
-   Loading indicators during searches
-   Empty state when no search has been performed

### User Feedback

-   Loading states: Spinner or skeleton loader during API calls
-   Error messages: Clear, actionable error messages with retry options
-   Success feedback: Results displayed immediately upon completion
-   Empty states: Helpful message when no results found
-   Rate limit feedback: Clear message when rate limited with time until retry

## Implementation Checklist

### Components

-   [ ] OsintTool page component
-   [ ] SearchModeSelector component
-   [ ] SearchForm component
-   [ ] ResultsDisplay component
-   [ ] CSS Modules for all components
-   [ ] Component tests

### Pages

-   [ ] Main page route configuration
-   [ ] Page tests

### State Management

-   [ ] TanStack Query setup for all search types
-   [ ] API client functions
-   [ ] Error handling
-   [ ] Loading states
-   [ ] Input validation

### Styling

-   [ ] CSS Modules for components
-   [ ] Responsive design
-   [ ] Loading/error states
-   [ ] Empty states
-   [ ] Result visualization

### Integration

-   [ ] Connect to backend API (per API_CONTRACT.md)
-   [ ] Test API calls
-   [ ] Handle errors gracefully
-   [ ] Test error scenarios
-   [ ] Handle rate limiting

## Testing Considerations

### Unit Tests

-   Component rendering
-   User interactions (mode switching, form submission)
-   State management
-   API client functions
-   Error handling
-   Input validation

### Integration Tests

-   API integration for each search type
-   Error scenarios (network errors, rate limits, invalid input)
-   Loading states
-   Results display

## Dependencies

### React Libraries

-   `react-router-dom`: Routing
-   `@tanstack/react-query`: Data fetching
-   Standard React hooks

## Performance Considerations

-   Debounce input validation (if real-time validation is implemented)
-   Cache search results to avoid duplicate API calls
-   Lazy load result components if results are large
-   Optimize re-renders with React.memo where appropriate

## Accessibility

-   Semantic HTML: Use proper form elements and labels
-   ARIA labels: Label inputs, buttons, and result sections
-   Keyboard navigation: Support keyboard shortcuts and tab navigation
-   Screen reader support: Announce search results and status changes
-   Focus management: Manage focus after search completion

---

**Note**: This document is independent of backend implementation. Only the API contract in API_CONTRACT.md couples frontend and backend.

