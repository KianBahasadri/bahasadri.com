# File Hosting - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

**IMPORTANT**: This document is downstream from `API_CONTRACT.yml`. Do NOT duplicate request/response schemas, error codes, or validation rules already defined in the API contract. Reference the contract and focus on implementation-specific details only.

## Overview

Backend implementation for the File Hosting utility. Handles file uploads to R2, metadata storage in D1, access logging, and file downloads.

## Code Location

`backend/src/file-hosting/`

## API Contract Reference

**All request/response schemas, error codes, and validation rules are defined in:**
`docs/features/file-hosting/API_CONTRACT.yml`

This document focuses solely on backend implementation details not covered in the API contract.

## API Endpoints

> **Note**: Request/response schemas are defined in `API_CONTRACT.yml`. This section focuses on implementation details only.

### `POST /api/file-hosting/upload`

**Handler**: `uploadFile()`

**Description**: Accepts multipart file upload, stores in R2, saves metadata to D1

**Implementation Flow**:

1. Parse multipart form data
2. Validate file (size, presence - per API contract)
3. Extract `isPublic` field (default to `true` if not provided)
4. Generate unique file ID (UUID)
5. Sanitize filename
6. Upload to R2 with proper content type
7. Store metadata in D1 (including `isPublic` field)
8. Format response per API contract
9. Return file ID and download URL (uses `/api/file-hosting/public/[fileId]` for public files, `/api/file-hosting/private/[fileId]` for private files)

**Implementation Notes**:

-   File size limit: 100MB (configurable)
-   R2 key format: `{fileId}/{sanitized-filename}`
-   Compression status starts as "pending"

**Error Handling**:

-   Missing file or invalid file → `INVALID_INPUT` (400)
-   R2 upload failure → `INTERNAL_ERROR` (500)
-   Database error → `INTERNAL_ERROR` (500)

### `POST /api/file-hosting/upload-from-url`

**Handler**: `uploadFileFromUrl()`

**Description**: Downloads a file from a URL, stores it in R2, saves metadata to D1

**Implementation Flow**:

1. Parse JSON request body (per API contract)
2. Validate URL format (per API contract)
3. Extract `isPublic` field (default to `true` if not provided)
4. Fetch file from URL
5. Validate response (status 200, content-type, size)
6. Generate unique file ID (UUID)
7. Extract filename from URL or Content-Disposition header
8. Sanitize filename
9. Upload to R2 with proper content type
10. Store metadata in D1 (including `isPublic` field)
11. Format response per API contract
12. Return file ID and download URL (uses `/api/file-hosting/public/[fileId]` for public files, `/api/file-hosting/private/[fileId]` for private files)

**Implementation Notes**:

-   File size limit: 100MB (same as regular upload)
-   URL must return status 200 with downloadable content
-   Filename extracted from URL path or Content-Disposition header

**Error Handling**:

-   Invalid URL, missing URL → `INVALID_INPUT` (400)
-   URL returns 404 → `NOT_FOUND` (404)
-   Download failure, R2 upload failure, database error → `INTERNAL_ERROR` (500)

### `GET /api/file-hosting/public/[fileId]`

**Handler**: `downloadPublicFile()`

**Description**: Retrieves public file from R2, logs access, returns file content. This URL pattern is configured to bypass Cloudflare Zero Trust authentication. Only files marked as public (`isPublic = true`) are accessible at this endpoint.

**Implementation Flow**:

1. Validate fileId format (per API contract)
2. Query D1 for file metadata
3. Check if file exists and not deleted
4. Check access permissions:
    - If file is public (`isPublic = true`): Allow access
    - If file is private (`isPublic = false`): Return 403 Forbidden
5. If access denied, return 403 Forbidden
6. Increment access count in D1
7. Log access entry (IP, timestamp, user agent, referrer, geolocation)
8. Retrieve file from R2
9. Return file with proper headers (Content-Type, Content-Disposition)

**Implementation Notes**:

-   Access control enforced based on `isPublic` field
-   Public files: Accessible at `/api/file-hosting/public/[fileId]` (URL pattern bypasses Zero Trust)
-   Private files: Return 403 Forbidden if accessed via public endpoint

### `GET /api/file-hosting/private/[fileId]`

**Handler**: `downloadPrivateFile()`

**Description**: Retrieves private file from R2, logs access, returns file content. This URL pattern is protected by Cloudflare Zero Trust authentication. Only files marked as private (`isPublic = false`) are accessible at this endpoint.

**Implementation Flow**:

1. Validate fileId format (per API contract)
2. Query D1 for file metadata
3. Check if file exists and not deleted
4. Check access permissions:
    - If file is private (`isPublic = false`): Allow access
    - If file is public (`isPublic = true`): Return 403 Forbidden
5. If access denied, return 403 Forbidden
6. Increment access count in D1
7. Log access entry (IP, timestamp, user agent, referrer, geolocation)
8. Retrieve file from R2
9. Return file with proper headers (Content-Type, Content-Disposition)

**Implementation Notes**:

-   Access control enforced based on `isPublic` field
-   Private files: Accessible at `/api/file-hosting/private/[fileId]` (URL pattern protected by Zero Trust)
-   Public files: Return 403 Forbidden if accessed via private endpoint
-   Access logging includes WHOIS data (country, organization, ASN)
-   Supports compressed file download via query parameter

**Error Handling**:

-   Private file accessed → `FORBIDDEN` (403)
-   File not found or deleted → `NOT_FOUND` (404)
-   R2 retrieval failure or database error → `INTERNAL_ERROR` (500)

### `GET /api/file-hosting/files`

**Handler**: `listFiles()`

**Description**: Returns paginated list of all uploaded files

**Implementation Flow**:

1. Parse query parameters (per API contract)
2. Query D1 for files (exclude deleted)
3. Order by upload_time DESC
4. Apply pagination
5. Format response per API contract
6. Return files and next cursor

### `GET /api/file-hosting/files/[fileId]`

**Handler**: `getFileMetadata()`

**Description**: Returns detailed metadata for a specific file

**Implementation Flow**:

1. Validate fileId (per API contract)
2. Query D1 for file by ID
3. If not found, return 404
4. Format response per API contract
5. Return file metadata

**Error Handling**:

-   File not found → `NOT_FOUND` (404)

### `GET /api/file-hosting/access-logs/[fileId]`

**Handler**: `getAccessLogs()`

**Description**: Returns paginated access logs for a file

**Implementation Flow**:

1. Validate fileId (per API contract)
2. Verify file exists
3. Query D1 for access logs
4. Order by timestamp DESC
5. Apply pagination
6. Format response per API contract
7. Return entries and next cursor

**Error Handling**:

-   File not found → `NOT_FOUND` (404)

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
    deleted INTEGER NOT NULL DEFAULT 0,
    is_public INTEGER NOT NULL DEFAULT 1
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

### Internal TypeScript Types

> Only include types NOT defined in the API contract (e.g., database row types, internal service types)

```typescript
// Database row type (internal representation)
interface FileRow {
    id: string;
    name: string;
    original_size: number;
    compressed_size: number | null;
    mime_type: string;
    upload_time: string;
    compression_status: string;
    original_url: string;
    compressed_url: string | null;
    compression_ratio: number | null;
    access_count: number;
    last_accessed: string | null;
    deleted: number; // 0 or 1 (boolean in SQLite)
    is_public: number; // 0 or 1 (boolean in SQLite)
}

interface AccessLogRow {
    id: string;
    file_id: string;
    ip_address: string;
    timestamp: string;
    user_agent: string | null;
    referrer: string | null;
    country: string | null;
    organization: string | null;
    asn: string | null;
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
    "INSERT INTO files (id, name, original_size, mime_type, original_url, is_public) VALUES (?, ?, ?, ?, ?, ?)"
)
    .bind(id, name, size, mimeType, r2Key, isPublic ? 1 : 0)
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
-   Public/private access control:
    -   Public files (`isPublic = true`): Accessible at `/api/file-hosting/public/[fileId]` (URL pattern bypasses Zero Trust)
    -   Private files (`isPublic = false`): Accessible at `/api/file-hosting/private/[fileId]` (URL pattern protected by Zero Trust)
    -   Default to public (`isPublic = true`) if not specified during upload
    -   Files accessed via wrong endpoint return 403 Forbidden (public file via private endpoint, or vice versa)

## Security Considerations

### Authentication

-   None required (public file hosting)

### Authorization

-   **Public files**: Accessible at `/api/file-hosting/public/[fileId]` (URL pattern bypasses Zero Trust)
-   **Private files**: Accessible at `/api/file-hosting/private/[fileId]` (URL pattern protected by Zero Trust)
-   Access control is enforced in both download endpoints based on `isPublic` field
-   Files accessed via wrong endpoint return 403 Forbidden

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
-   [ ] GET /public/[fileId] endpoint (public files)
-   [ ] GET /private/[fileId] endpoint (private files)
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

## Dependencies

### Workers Libraries

-   Native Workers API (no framework needed)
-   `@cloudflare/workers-types` for types

## Error Codes

> **All error codes are defined in `API_CONTRACT.yml`.** This section explains implementation-specific error mapping only.

### Error Mapping

How to map internal errors to API contract error codes:

-   Invalid file or missing fields → `INVALID_INPUT` (400)
-   Private file accessed → `FORBIDDEN` (403)
-   File not found or deleted → `NOT_FOUND` (404)
-   R2 upload/retrieval failures → `INTERNAL_ERROR` (500)
-   Database errors → `INTERNAL_ERROR` (500)
-   URL download failures → `INTERNAL_ERROR` (500)

## Monitoring & Logging

-   Log all file uploads
-   Log all file downloads
-   Log errors with context
-   Track R2 storage usage
-   Monitor D1 query performance

---

**Note**: This document is downstream from `API_CONTRACT.yml` and independent of frontend implementation.

**Key principles**:

-   **DO NOT** duplicate request/response schemas from the API contract
-   **DO NOT** duplicate error codes or validation rules from the API contract
-   **DO** focus on implementation-specific details (database queries, external services, business logic)
-   **DO** reference the API contract when discussing endpoints or data structures
-   All API responses **MUST** match the contract defined in `API_CONTRACT.yml`
