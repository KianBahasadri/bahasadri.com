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
-   URL upload form section
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
-   Local state: Is public toggle (boolean, default: `true`)

**Interactions**:

-   Drag and drop file upload
-   Click to select file
-   Toggle public/private file sharing
-   Upload progress feedback
-   Error handling and display

**Styling**:

-   CSS Modules: `UploadZone.module.css`
-   Drag-over visual feedback
-   Upload status indicators

### UrlUploadForm

**Location**: `components/UrlUploadForm/UrlUploadForm.tsx`

**Purpose**: Handles file hosting from external URLs

**Props**:

```typescript
interface UrlUploadFormProps {
    // No props needed
}
```

**State**:

-   Local state: URL input value (string)
-   Local state: Upload status (`idle` | `uploading` | `error` | `done`)
-   Local state: Status message (string)
-   Local state: Is public toggle (boolean, default: `true`)

**Interactions**:

-   Enter URL in text input
-   Toggle public/private file sharing
-   Click "Download and Host" button
-   Upload progress feedback
-   Error handling and display
-   URL validation

**Styling**:

-   CSS Modules: `UrlUploadForm.module.css`
-   Form input styling
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

-   Click download link (with `uiAccess=true` query parameter for UI access)
-   Display file metadata (size, type, access count, sharing status)
-   Generate QR code for download link (only for public files)
-   Display sharing status indicator (public/private)

**Styling**:

-   CSS Modules: `FileList.module.css`
-   Card-based layout
-   Empty state display

### QRCodeGenerator

**Location**: `components/QRCodeGenerator/QRCodeGenerator.tsx`

**Purpose**: Generates and displays QR codes for download links

**Props**:

```typescript
interface QRCodeGeneratorProps {
    url: string;
    fileName?: string;
}
```

**State**:

-   Local state: QR code data URL (string)
-   Local state: Loading state (boolean)

**Interactions**:

-   Generate QR code from URL
-   Download QR code as PNG image
-   Display QR code in modal or inline

**Styling**:

-   CSS Modules: `QRCodeGenerator.module.css`
-   Modal overlay for QR code display
-   Download button styling

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
const [isPublic, setIsPublic] = useState<boolean>(true);
```

## API Integration

### API Client Functions

**Location**: `lib/api.ts`

```typescript
// Upload file
export const uploadFile = async (
    file: File,
    isPublic: boolean = true
): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("isPublic", isPublic.toString());

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

// Upload file from URL
export const uploadFileFromUrl = async (
    url: string,
    isPublic: boolean = true
): Promise<UploadResponse> => {
    const response = await fetch("/api/file-hosting/upload-from-url", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, isPublic }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload from URL failed");
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

### QR Code Generation

**Location**: `lib/qrcode.ts` (utility functions)

```typescript
import QRCode from "qrcode";

// Generate QR code as data URL
export const generateQRCode = async (
    url: string,
    options?: QRCode.QRCodeToDataURLOptions
): Promise<string> => {
    return QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
            dark: "#000000",
            light: "#FFFFFF",
        },
        ...options,
    });
};

// Generate QR code as image blob for download
export const generateQRCodeBlob = async (url: string): Promise<Blob> => {
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, url, {
        width: 400,
        margin: 2,
    });
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
        }, "image/png");
    });
};
```

### Error Handling

-   Upload errors: Display inline error message
-   API errors: Show toast notification or inline error
-   Network errors: Retry logic (optional)
-   Loading states: Show upload progress and loading indicators
-   QR code generation errors: Show error message if generation fails

## User Interactions

### Primary Actions

-   **Upload File**:

    -   Trigger: Drag-drop or click to select
    -   Flow: Set public/private toggle → Validate file → Upload with `isPublic` flag → Show success → Refresh file list
    -   Error handling: Show error message, allow retry

-   **Upload File from URL**:

    -   Trigger: Enter URL and click "Download and Host" button
    -   Flow: Set public/private toggle → Validate URL → Download file → Upload with `isPublic` flag → Show success → Refresh file list
    -   Error handling: Show error message, allow retry

-   **Download File**:

    -   Trigger: Click download link
    -   Flow:
        -   **Public files**: Navigate to download URL (opens in new tab)
        -   **Private files**: Navigate to download URL with `uiAccess=true` query parameter
    -   Error handling: Handle 403 Forbidden for private files accessed directly

-   **Generate QR Code**:

    -   Trigger: Click "Generate QR Code" button on file
    -   Flow: Check if file is public → Generate QR code from download URL → Display QR code → Allow download
    -   Error handling: Show error message if generation fails or if file is private (QR codes only for public files)

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
-   Public/private toggle: Toggle switch or checkbox near upload area
-   File list: Card-based grid layout
-   Status indicators: Visual feedback for upload states and sharing status (public/private badge)
-   Empty state: Friendly message when no files
-   QR code display: Modal overlay with QR code image and download button (only for public files)

### User Feedback

-   Loading states: Upload progress spinner
-   Error messages: Inline error display
-   Success notifications: Brief success message
-   Empty states: Message when no files uploaded

## Implementation Checklist

### Components

-   [ ] FileHosting page component
-   [ ] UploadZone component with drag-drop and public/private toggle
-   [ ] UrlUploadForm component with public/private toggle
-   [ ] FileList component with sharing status display
-   [ ] QRCodeGenerator component (only for public files)
-   [ ] CSS Modules for all components

### Pages

-   [ ] Main page route configuration

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
-   [ ] Handle errors gracefully
-   [ ] File upload with progress

## Dependencies

### React Libraries

-   `react-router-dom`: Routing
-   `@tanstack/react-query`: Data fetching
-   Standard React hooks

### QR Code Libraries

-   `qrcode`: QR code generation library
-   Alternative: `qrcode.react` for React component wrapper

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
