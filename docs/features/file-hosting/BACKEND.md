# File Hosting - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

## Overview

Backend implementation for the File Hosting utility. Handles file uploads to R2, metadata storage in D1, access logging, and file downloads.

## Code Location

`backend/src/routes/file-hosting/`

## API Contract Reference

See `docs/features/file-hosting/API_CONTRACT.md` for the API contract this backend provides.

## API Endpoints

### `POST /api/file-hosting/upload`

**Handler**: `uploadFile()`

**Description**: Accepts multipart file upload, stores in R2, saves metadata to D1

**Request**:

-   Content-Type: `multipart/form-data`
-   Body: Form data with `file` field

**Validation**:

-   File size limit: 100MB (configurable)
-   File type: Any (no restrictions)
-   Required: File field must be present

**Response**:

```typescript
interface UploadResponse {
    fileId: string;
    downloadUrl: string;
    compressionStatus: "pending" | "processing" | "done" | "failed";
}
```

**Implementation Flow**:

1. Parse multipart form data
2. Validate file (size, presence)
3. Generate unique file ID (UUID)
4. Sanitize filename
5. Upload to R2 with proper content type
6. Store metadata in D1
7. Return file ID and download URL

**Error Handling**:

-   400: Missing file or invalid file
-   500: R2 upload failure or database error

### `POST /api/file-hosting/upload-from-url`

**Handler**: `uploadFileFromUrl()`

**Description**: Downloads a file from a URL, stores it in R2, saves metadata to D1

**Request**:

-   Content-Type: `application/json`
-   Body: JSON with `url` field

**Validation**:

-   URL format: Must be a valid HTTP/HTTPS URL
-   File size limit: 100MB (configurable, same as regular upload)
-   Required: URL field must be present and valid
-   URL accessibility: Must return a downloadable file (status 200)

**Response**:

```typescript
interface UploadResponse {
    fileId: string;
    downloadUrl: string;
    compressionStatus: "pending" | "processing" | "done" | "failed";
}
```

**Implementation Flow**:

1. Parse JSON request body
2. Validate URL format
3. Fetch file from URL
4. Validate response (status 200, content-type, size)
5. Generate unique file ID (UUID)
6. Extract filename from URL or Content-Disposition header
7. Sanitize filename
8. Upload to R2 with proper content type
9. Store metadata in D1
10. Return file ID and download URL

**Error Handling**:

-   400: Invalid URL, missing URL, or URL does not point to a downloadable file
-   404: File at URL not found
-   500: Download failure, R2 upload failure, or database error

### `GET /api/file-hosting/download/[fileId]`

**Handler**: `downloadFile()`

**Description**: Retrieves file from R2, logs access, returns file content

**Request**:

-   Path parameter: `fileId` (UUID)

**Response**:

-   Content-Type: Based on file mime type
-   Body: File content (binary stream)
-   Headers: Content-Disposition with filename

**Implementation Flow**:

1. Validate fileId format
2. Query D1 for file metadata
3. Check if file exists and not deleted
4. Increment access count in D1
5. Log access entry (IP, timestamp, user agent, referrer)
6. Retrieve file from R2
7. Return file with proper headers

**Error Handling**:

-   404: File not found or deleted
-   500: R2 retrieval failure or database error

### `GET /api/file-hosting/files`

**Handler**: `listFiles()`

**Description**: Returns paginated list of all uploaded files

**Request**:

-   Query: `cursor` (optional), `limit` (optional, default: 50)

**Response**:

```typescript
interface FileListResponse {
    files: FileMetadata[];
    nextCursor?: string;
}
```

**Implementation Flow**:

1. Parse query parameters
2. Query D1 for files (exclude deleted)
3. Order by upload_time DESC
4. Apply pagination
5. Return files and next cursor

### `GET /api/file-hosting/files/[fileId]`

**Handler**: `getFileMetadata()`

**Description**: Returns detailed metadata for a specific file

**Request**:

-   Path parameter: `fileId` (UUID)

**Response**:

```typescript
interface FileMetadata {
    // Full file metadata structure
}
```

**Implementation Flow**:

1. Validate fileId
2. Query D1 for file by ID
3. Return file metadata or 404

### `GET /api/file-hosting/access-logs/[fileId]`

**Handler**: `getAccessLogs()`

**Description**: Returns paginated access logs for a file

**Request**:

-   Path parameter: `fileId` (UUID)
-   Query: `cursor` (optional), `limit` (optional)

**Response**:

```typescript
interface AccessLogResponse {
    entries: AccessLogEntry[];
    nextCursor?: string;
}
```

**Implementation Flow**:

1. Validate fileId
2. Verify file exists
3. Query D1 for access logs
4. Order by timestamp DESC
5. Apply pagination
6. Return entries and next cursor

## Data Models

### Database Schema

```sql
-- Files table
CREATE TABLE files (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    original_size INTEGER NOT NULL,
    compressed_size INTEGER,
    mime_type TEXT NOT NULL,
    upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    compression_status TEXT NOT NULL DEFAULT 'pending',
    original_url TEXT NOT NULL,
    compressed_url TEXT,
    compression_ratio REAL,
    access_count INTEGER NOT NULL DEFAULT 0,
    last_accessed DATETIME,
    deleted INTEGER NOT NULL DEFAULT 0
);

-- Access logs table
CREATE TABLE access_logs (
    id TEXT PRIMARY KEY,
    file_id TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    referrer TEXT,
    country TEXT,
    organization TEXT,
    asn TEXT,
    FOREIGN KEY (file_id) REFERENCES files (id)
);

-- Indexes
CREATE INDEX idx_files_upload_time ON files (upload_time DESC);
CREATE INDEX idx_access_logs_file_timestamp ON access_logs (file_id, timestamp DESC);
```

### TypeScript Types

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

## Cloudflare Services

### R2 Storage

**Bucket**: `file_hosting_prod`

**Usage**:

-   Store uploaded files
-   Key format: `{fileId}/{sanitized-filename}`
-   Public access via CDN URLs

**Operations**:

```typescript
// Upload file
await env.file_hosting_prod.put(r2Key, fileBuffer, {
    httpMetadata: { contentType: mimeType },
});

// Get file
const object = await env.file_hosting_prod.get(r2Key);
```

### D1 Database

**Binding**: `FILE_HOSTING_DB`

**Usage**:

-   Store file metadata
-   Store access logs
-   Fast queries with indexes

**Operations**:

```typescript
// Insert file
await env.FILE_HOSTING_DB.prepare(
    "INSERT INTO files (id, name, original_size, mime_type, original_url) VALUES (?, ?, ?, ?, ?)"
)
    .bind(id, name, size, mimeType, r2Key)
    .run();

// Query files
const result = await env.FILE_HOSTING_DB.prepare(
    "SELECT * FROM files WHERE deleted = 0 ORDER BY upload_time DESC LIMIT ?"
)
    .bind(limit)
    .all();
```

## Workers Logic

### Request Processing Flow

```
1. Receive request
2. Parse request (multipart/form-data or JSON)
3. Validate input (file size, format, required fields)
4. Generate file ID (UUID)
5. Upload to R2 (if upload endpoint)
6. Store metadata in D1
7. Log access (if download endpoint)
8. Format response per API contract
9. Return response
```

### Error Handling

```typescript
try {
    // Operation
} catch (error) {
    if (error instanceof ValidationError) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
    if (error instanceof NotFoundError) {
        return new Response(JSON.stringify({ error: "File not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
    }
    return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
    });
}
```

## Validation

### Input Validation

```typescript
function validateFile(file: File): { ok: boolean; error?: string } {
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB

    if (!file) {
        return { ok: false, error: "Missing file" };
    }

    if (file.size > MAX_SIZE) {
        return { ok: false, error: "File too large" };
    }

    return { ok: true };
}

function validateUrl(url: string): { ok: boolean; error?: string } {
    try {
        const urlObj = new URL(url);
        if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
            return { ok: false, error: "URL must use HTTP or HTTPS" };
        }
        return { ok: true };
    } catch {
        return { ok: false, error: "Invalid URL format" };
    }
}
```

### Business Rules

-   File size limit: 100MB (applies to both direct uploads and URL downloads)
-   Filename sanitization: Remove special characters
-   Filename extraction: From URL path or Content-Disposition header
-   Access logging: Log every download
-   Access count: Increment on download
-   URL validation: Must be valid HTTP/HTTPS URL

## Security Considerations

### Authentication

-   None required (public file hosting)

### Authorization

-   None (all files are public)

### Input Sanitization

-   Filename sanitization to prevent path traversal
-   File size limits
-   MIME type validation (optional)

## Performance Optimization

### Caching Strategy

-   R2 CDN caching for file downloads
-   D1 query caching (automatic)
-   Access log pagination to limit query size

### Edge Computing Benefits

-   Files served from edge locations globally
-   Low latency file downloads
-   Automatic scaling

## Implementation Checklist

### API Endpoints

-   [ ] POST /upload endpoint
-   [ ] POST /upload-from-url endpoint
-   [ ] GET /download/[fileId] endpoint
-   [ ] GET /files endpoint (list)
-   [ ] GET /files/[fileId] endpoint (metadata)
-   [ ] GET /access-logs/[fileId] endpoint
-   [ ] Error handling (per API_CONTRACT.md)

### Data Layer

-   [ ] D1 database schema
-   [ ] R2 bucket operations
-   [ ] Database query helpers
-   [ ] Access log insertion

### Business Logic

-   [ ] File upload processing
-   [ ] File download from URL processing
-   [ ] URL validation and fetching
-   [ ] File download with logging
-   [ ] Filename sanitization
-   [ ] Access count increment
-   [ ] Pagination logic

### Testing

-   [ ] Unit tests for handlers
-   [ ] Integration tests with R2/D1
-   [ ] Error scenario testing

## Testing Considerations

### Unit Tests

-   Handler function testing
-   Validation logic testing
-   Error handling testing

### Integration Tests

-   API endpoint testing (must match API_CONTRACT.md contract)
-   R2 upload/download testing
-   D1 query testing
-   End-to-end flow testing

## Dependencies

### Workers Libraries

-   Native Workers API (no framework needed)
-   `@cloudflare/workers-types` for types

## Error Codes

Must match error codes defined in API_CONTRACT.md:

| Code             | HTTP Status | When to Use                    |
| ---------------- | ----------- | ------------------------------ |
| `INVALID_INPUT`  | 400         | Invalid file or missing fields |
| `NOT_FOUND`      | 404         | File doesn't exist             |
| `INTERNAL_ERROR` | 500         | Server error                   |

## Monitoring & Logging

-   Log all file uploads
-   Log all file downloads
-   Log errors with context
-   Track R2 storage usage
-   Monitor D1 query performance

---

**Note**: This document is independent of frontend implementation. Only the API contract in API_CONTRACT.md couples frontend and backend. All API responses must match the contract defined in API_CONTRACT.md.
