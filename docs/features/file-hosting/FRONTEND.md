# File Hosting - Frontend Design

**Frontend-specific design and implementation requirements. This document is independent of backend implementation details.**

## Overview

Frontend implementation for the File Hosting utility. Provides a drag-and-drop upload interface, file listing, and access to file analytics.

## Code Location

`frontend/src/pages/file-hosting/`

## API Contract Reference

See `docs/features/file-hosting/API_CONTRACT.md` for the API contract this frontend consumes.

## Pages/Routes

### `/file-hosting`

**Component**: `FileHosting.tsx`

**Description**: Main page for file hosting utility

**Route Configuration**:

```typescript
<Route path="/file-hosting" element={<FileHosting />} />
```

## Components

### FileHosting (Main Page)

**Location**: `FileHosting.tsx`

**Purpose**: Main page component that displays upload zone and file list

**State**:

-   Server state: File list (TanStack Query)
-   Local state: None (stateless page)

**Layout**:

-   Hero section with title and tagline
-   Upload zone section
-   File list section

### UploadZone

**Location**: `components/UploadZone/UploadZone.tsx`

**Purpose**: Handles drag-and-drop file uploads

**Props**:

```typescript
interface UploadZoneProps {
    allowedMimeTypes?: readonly string[];
}
```

**State**:

-   Local state: Upload status (`idle` | `uploading` | `error` | `done`)
-   Local state: Status message (string)
-   Local state: Dragging state (boolean)

**Interactions**:

-   Drag and drop file upload
-   Click to select file
-   Upload progress feedback
-   Error handling and display

**Styling**:

-   CSS Modules: `UploadZone.module.css`
-   Drag-over visual feedback
-   Upload status indicators

### FileList

**Location**: `components/FileList/FileList.tsx`

**Purpose**: Displays list of uploaded files with metadata

**Props**:

```typescript
interface FileListProps {
    files: FileMetadata[];
}
```

**State**:

-   None (presentational component)

**Interactions**:

-   Click download link
-   Display file metadata (size, type, access count)

**Styling**:

-   CSS Modules: `FileList.module.css`
-   Card-based layout
-   Empty state display

## State Management

### Server State (TanStack Query)

```typescript
// Query keys
const queryKeys = {
    files: ["file-hosting", "files"] as const,
    file: (id: string) => ["file-hosting", "file", id] as const,
    accessLogs: (fileId: string) =>
        ["file-hosting", "access-logs", fileId] as const,
};

// TanStack Query hooks
const useFileList = (cursor?: string, limit?: number) => {
    return useQuery({
        queryKey: [...queryKeys.files, cursor, limit],
        queryFn: () => fetchFileList(cursor, limit),
    });
};

const useFileMetadata = (fileId: string) => {
    return useQuery({
        queryKey: queryKeys.file(fileId),
        queryFn: () => fetchFileMetadata(fileId),
        enabled: !!fileId,
    });
};
```

### Local State (React)

```typescript
// Upload status
const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "error" | "done"
>("idle");
const [uploadMessage, setUploadMessage] = useState<string>("");
const [isDragging, setIsDragging] = useState(false);
```

## API Integration

### API Client Functions

**Location**: `lib/api.ts`

```typescript
// Upload file
export const uploadFile = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/file-hosting/upload", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
    }

    return response.json();
};

// Get file list
export const fetchFileList = async (
    cursor?: string,
    limit?: number
): Promise<FileListResponse> => {
    const params = new URLSearchParams();
    if (cursor) params.append("cursor", cursor);
    if (limit) params.append("limit", limit.toString());

    const response = await fetch(`/api/file-hosting/files?${params}`);
    if (!response.ok) throw new Error("Failed to fetch files");
    return response.json();
};

// Get file metadata
export const fetchFileMetadata = async (
    fileId: string
): Promise<FileMetadata> => {
    const response = await fetch(`/api/file-hosting/files/${fileId}`);
    if (!response.ok) throw new Error("Failed to fetch file metadata");
    return response.json();
};

// Get access logs
export const fetchAccessLogs = async (
    fileId: string,
    cursor?: string,
    limit?: number
): Promise<AccessLogResponse> => {
    const params = new URLSearchParams();
    if (cursor) params.append("cursor", cursor);
    if (limit) params.append("limit", limit.toString());

    const response = await fetch(
        `/api/file-hosting/access-logs/${fileId}?${params}`
    );
    if (!response.ok) throw new Error("Failed to fetch access logs");
    return response.json();
};
```

### Error Handling

-   Upload errors: Display inline error message
-   API errors: Show toast notification or inline error
-   Network errors: Retry logic (optional)
-   Loading states: Show upload progress and loading indicators

## User Interactions

### Primary Actions

-   **Upload File**:

    -   Trigger: Drag-drop or click to select
    -   Flow: Validate file → Upload → Show success → Refresh file list
    -   Error handling: Show error message, allow retry

-   **Download File**:

    -   Trigger: Click download link
    -   Flow: Navigate to download URL (opens in new tab)
    -   No error handling needed (browser handles)

-   **View File Details**:
    -   Trigger: Click on file
    -   Flow: Navigate to file detail page with analytics

### Form Handling

-   File validation: Check file size and type before upload
-   Upload progress: Show progress indicator during upload
-   Success feedback: Show success message, refresh file list
-   Error display: Show error message with retry option

## UI/UX Requirements

### Layout

-   Page layout: Full-width main container
-   Hero section: Title and tagline at top
-   Content card: Upload zone and file list in card layout
-   Responsive: Mobile-friendly layout

### Visual Design

-   Upload zone: Large drop area with drag-over feedback
-   File list: Card-based grid layout
-   Status indicators: Visual feedback for upload states
-   Empty state: Friendly message when no files

### User Feedback

-   Loading states: Upload progress spinner
-   Error messages: Inline error display
-   Success notifications: Brief success message
-   Empty states: Message when no files uploaded

## Implementation Checklist

### Components

-   [ ] FileHosting page component
-   [ ] UploadZone component with drag-drop
-   [ ] FileList component
-   [ ] CSS Modules for all components
-   [ ] Component tests

### Pages

-   [ ] Main page route configuration
-   [ ] Page tests

### State Management

-   [ ] TanStack Query setup
-   [ ] API client functions
-   [ ] Error handling
-   [ ] Loading states
-   [ ] Optimistic updates for file list refresh

### Styling

-   [ ] CSS Modules for components
-   [ ] Responsive design
-   [ ] Loading/error states
-   [ ] Empty states
-   [ ] Drag-over visual feedback

### Integration

-   [ ] Connect to backend API (per API_CONTRACT.md)
-   [ ] Test API calls
-   [ ] Handle errors gracefully
-   [ ] Test error scenarios
-   [ ] File upload with progress

## Testing Considerations

### Unit Tests

-   Component rendering
-   User interactions (drag-drop, click)
-   State management
-   API client functions
-   Error handling

### Integration Tests

-   API integration
-   Upload flow
-   File list display
-   Error scenarios
-   Loading states

## Dependencies

### React Libraries

-   `react-router-dom`: Routing
-   `@tanstack/react-query`: Data fetching
-   Standard React hooks

## Performance Considerations

-   Code splitting: Lazy load file list component
-   Optimistic updates: Refresh file list after upload
-   Cache management: Cache file list with TanStack Query
-   Bundle size: Keep upload zone code split

## Accessibility

-   Semantic HTML: Use proper form elements
-   ARIA labels: Label upload zone and buttons
-   Keyboard navigation: Support keyboard file selection
-   Screen reader support: Announce upload status

---

**Note**: This document is independent of backend implementation. Only the API contract in API_CONTRACT.md couples frontend and backend.
