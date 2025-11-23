# File Hosting - API Contract

**API contract document defining the interface between frontend and backend. This is the ONLY coupling point between frontend and backend.**

## Purpose

A personal file hosting and sharing utility with automatic compression, detailed access analytics, and WHOIS tracking. Users can upload files, share them via public links, and view comprehensive analytics about file access.

## API Base URL

-   Development: `http://localhost:8787/api`
-   Production: `https://bahasadri.com/api`

## Endpoints

### `POST /api/file-hosting/upload`

**Description**: Upload a file to R2 storage and store metadata in D1

**Request**:

-   Content-Type: `multipart/form-data`
-   Body: Form data with `file` field containing the file

**Response**:

```typescript
interface UploadResponse {
    fileId: string;
    downloadUrl: string;
    compressionStatus: "pending" | "processing" | "done" | "failed";
}
```

**Status Codes**:

-   `200 OK`: File uploaded successfully
-   `400 Bad Request`: Invalid file or missing file payload
-   `500 Internal Server Error`: Server error

**Error Response Format**:

```typescript
interface ErrorResponse {
  error: string;
}
```

### `POST /api/file-hosting/upload-from-url`

**Description**: Download a file from a URL and host it in R2 storage, storing metadata in D1

**Request**:

-   Content-Type: `application/json`
-   Body: JSON with `url` field containing the file URL

```typescript
interface UploadFromUrlRequest {
    url: string;
}
```

**Response**:

```typescript
interface UploadResponse {
    fileId: string;
    downloadUrl: string;
    compressionStatus: "pending" | "processing" | "done" | "failed";
}
```

**Status Codes**:

-   `200 OK`: File downloaded and hosted successfully
-   `400 Bad Request`: Invalid URL, missing URL, or URL does not point to a downloadable file
-   `404 Not Found`: File at URL not found
-   `500 Internal Server Error`: Server error (download failure, upload failure, etc.)

**Error Response Format**:

```typescript
interface ErrorResponse {
  error: string;
}
```

### `GET /api/file-hosting/download/[fileId]`

**Description**: Download a hosted file

**Request**:

-   Path parameter: `fileId` (string, UUID)

**Response**:

-   Content-Type: Based on file mime type
-   Body: File content (binary stream)
-   Headers:
  - `Content-Disposition`: Attachment with filename

**Status Codes**:

-   `200 OK`: File found and returned
-   `404 Not Found`: File not found or deleted
-   `500 Internal Server Error`: Server error

### `GET /api/file-hosting/files`

**Description**: List all uploaded files with metadata

**Request**:
- Query parameters:
  - `cursor` (optional, string): Pagination cursor
  - `limit` (optional, number): Number of files to return

**Response**:
```typescript
interface FileListResponse {
  files: FileMetadata[];
  nextCursor?: string;
}

interface FileMetadata {
  id: string;
  name: string;
  originalSize: number;
  compressedSize?: number | null;
  mimeType: string;
  uploadTime: string;
  compressionStatus: "pending" | "processing" | "done" | "failed";
  originalUrl: string;
  compressedUrl?: string | null;
  compressionRatio?: number | null;
  accessCount: number;
  lastAccessed?: string | null;
  deleted: boolean;
}
````

**Status Codes**:

-   `200 OK`: Success
-   `500 Internal Server Error`: Server error

### `GET /api/file-hosting/files/[fileId]`

**Description**: Get detailed metadata for a specific file

**Request**:

-   Path parameter: `fileId` (string, UUID)

**Response**:

```typescript
interface FileMetadata {
    id: string;
    name: string;
    originalSize: number;
    compressedSize?: number | null;
    mimeType: string;
    uploadTime: string;
    compressionStatus: "pending" | "processing" | "done" | "failed";
    originalUrl: string;
    compressedUrl?: string | null;
    compressionRatio?: number | null;
    accessCount: number;
    lastAccessed?: string | null;
    deleted: boolean;
}
```

**Status Codes**:

-   `200 OK`: File found
-   `404 Not Found`: File not found
-   `500 Internal Server Error`: Server error

### `GET /api/file-hosting/access-logs/[fileId]`

**Description**: Get access logs for a specific file

**Request**:

-   Path parameter: `fileId` (string, UUID)
-   Query parameters:
    -   `cursor` (optional, string): Pagination cursor
    -   `limit` (optional, number): Number of entries to return

**Response**:

```typescript
interface AccessLogResponse {
    entries: AccessLogEntry[];
    nextCursor?: string;
}

interface AccessLogEntry {
    id: string;
    fileId: string;
    ipAddress: string;
    timestamp: string;
    userAgent?: string | null;
    referrer?: string | null;
    country?: string | null;
    organization?: string | null;
    asn?: string | null;
}
```

**Status Codes**:

-   `200 OK`: Success
-   `404 Not Found`: File not found
-   `500 Internal Server Error`: Server error

## Shared Data Models

### TypeScript Types

```typescript
type CompressionStatus = "pending" | "processing" | "done" | "failed";

interface FileMetadata {
    id: string;
    name: string;
    originalSize: number;
    compressedSize?: number | null;
    mimeType: string;
    uploadTime: string;
    compressionStatus: CompressionStatus;
    originalUrl: string;
    compressedUrl?: string | null;
    compressionRatio?: number | null;
    accessCount: number;
    lastAccessed?: string | null;
    deleted: boolean;
}

interface AccessLogEntry {
    id: string;
    fileId: string;
    ipAddress: string;
    timestamp: string;
    userAgent?: string | null;
    referrer?: string | null;
    country?: string | null;
    organization?: string | null;
    asn?: string | null;
}
```

## Error Handling

### Standard Error Response

All errors follow this format:

```typescript
interface ErrorResponse {
    error: string;
}
```

### Error Codes

| Code             | HTTP Status | When to Use                             |
| ---------------- | ----------- | --------------------------------------- |
| `INVALID_INPUT`  | 400         | Invalid file or missing required fields |
| `NOT_FOUND`      | 404         | File doesn't exist                      |
| `INTERNAL_ERROR` | 500         | Server error                            |

## Authentication/Authorization

-   **Required**: No
-   **Method**: None
-   Public file hosting utility

## CORS

-   **Allowed Origins**: `https://bahasadri.com`
-   **Allowed Methods**: GET, POST
-   **Allowed Headers**: Content-Type

---

**Note**: This document defines the contract between frontend and backend. Implementation details are in FRONTEND.md and BACKEND.md respectively.
