# File Encryptor - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

**IMPORTANT**: This document is downstream from `API_CONTRACT.yml`. Do NOT duplicate request/response schemas, error codes, or validation rules already defined in the API contract. Reference the contract and focus on implementation-specific details only.

## Overview

Backend implementation for the File Encryptor utility. Since encryption/decryption happens client-side for security, the backend is minimal and only provides optional temporary file storage if needed. Most operations are client-side only and don't require backend interaction.

## Code Location

`backend/src/routes/file-encryptor/`

## API Contract Reference

**All request/response schemas, error codes, and validation rules are defined in:**
`docs/features/file-encryptor/API_CONTRACT.yml`

This document focuses solely on backend implementation details not covered in the API contract.

## API Endpoints

### `POST /api/file-encryptor/upload-temp`

**Handler**: `uploadTempFile()`

**Description**: Upload a file to temporary storage. This is optional - encryption/decryption can happen entirely client-side.

**Request**:

-   Method: `POST`
-   Content-Type: `multipart/form-data`
-   Body: Form data with `file` field

**Validation**:

-   File must be provided
-   File size must be within limits (e.g., 100MB max)
-   Validate file type if needed

**Response**:

```typescript
interface UploadTempResponse {
    fileId: string;
    expiresAt: number; // Unix timestamp
}
```

**Implementation Flow**:

1. Parse multipart form data
2. Extract file from form data
3. Validate file size and type
4. Generate unique file ID
5. Store file in R2 with expiration metadata
6. Return file ID and expiration timestamp

**Error Handling**:

-   `400 Bad Request`: Invalid file or request format
-   `413 Payload Too Large`: File exceeds size limit
-   `500 Internal Server Error`: Storage error

### `GET /api/file-encryptor/download-temp/:fileId`

**Handler**: `downloadTempFile()`

**Description**: Download a temporarily stored file.

**Request**:

-   Method: `GET`
-   Path parameter: `fileId` - The file ID

**Validation**:

-   File ID must be valid format
-   File must exist and not be expired

**Response**:

-   Content-Type: `application/octet-stream` or original file content type
-   Body: File binary data

**Implementation Flow**:

1. Extract file ID from path
2. Validate file ID format
3. Retrieve file from R2
4. Check if file exists and is not expired
5. Return file with appropriate headers

**Error Handling**:

-   `404 Not Found`: File not found or expired
-   `500 Internal Server Error`: Storage error

### `DELETE /api/file-encryptor/temp/:fileId`

**Handler**: `deleteTempFile()`

**Description**: Delete a temporarily stored file.

**Request**:

-   Method: `DELETE`
-   Path parameter: `fileId` - The file ID to delete

**Validation**:

-   File ID must be valid format

**Response**:

```typescript
interface DeleteTempResponse {
    success: boolean;
}
```

**Implementation Flow**:

1. Extract file ID from path
2. Validate file ID format
3. Delete file from R2
4. Return success response

**Error Handling**:

-   `404 Not Found`: File not found (idempotent - return success)
-   `500 Internal Server Error`: Storage error

## Data Models

### TypeScript Types

```typescript
interface UploadTempResponse {
    fileId: string;
    expiresAt: number; // Unix timestamp in seconds
}

interface DeleteTempResponse {
    success: boolean;
}
```

## Cloudflare Services

### R2 (Object Storage)

**Binding**: `R2_BUCKET`

**Usage**:

-   Store temporary files for optional backend-assisted operations
-   Files are automatically cleaned up after expiration

**Operations**:

```typescript
// Store file
await env.R2_BUCKET.put(fileId, fileData, {
    httpMetadata: {
        contentType: file.type,
    },
    customMetadata: {
        expiresAt: expiresAt.toString(),
    },
});

// Retrieve file
const object = await env.R2_BUCKET.get(fileId);

// Delete file
await env.R2_BUCKET.delete(fileId);
```

### KV (Optional - for metadata)

**Binding**: `FILE_ENCRYPTOR_KV` (optional)

**Usage**:

-   Store file metadata and expiration times
-   Quick lookup for file existence

**Operations**:

```typescript
// Store metadata
await env.FILE_ENCRYPTOR_KV.put(
    `file:${fileId}`,
    JSON.stringify({ expiresAt, originalName }),
    { expirationTtl: expirationTimeInSeconds }
);

// Retrieve metadata
const metadata = await env.FILE_ENCRYPTOR_KV.get(`file:${fileId}`);
```

## Workers Logic

### Request Processing Flow

```
1. Receive request
2. Parse request (multipart/form-data for upload, path params for download/delete)
3. Validate input (file size, file ID format)
4. Process operation (store/retrieve/delete from R2)
5. Format response per API contract
6. Return response
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
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    
    if (!file) {
        return { ok: false, error: "File is required" };
    }
    
    if (file.size > MAX_FILE_SIZE) {
        return { ok: false, error: "File too large" };
    }
    
    return { ok: true };
}

function validateFileId(fileId: string): { ok: boolean; error?: string } {
    // Validate file ID format (e.g., UUID)
    if (!fileId || !/^[a-f0-9-]{36}$/.test(fileId)) {
        return { ok: false, error: "Invalid file ID" };
    }
    
    return { ok: true };
}
```

### Business Rules

-   Files expire after 1 hour (configurable)
-   Maximum file size: 100MB (configurable, stay within free tier)
-   File IDs are UUIDs for security
-   Files are stored in R2 with expiration metadata

## Security Considerations

### Authentication

-   **Required**: No
-   Files are temporary and expire automatically

### Authorization

-   **Required**: No
-   File IDs are unguessable (UUIDs) providing some security through obscurity

### Input Sanitization

-   Validate file size to prevent abuse
-   Validate file ID format
-   Sanitize file names if stored

### Data Privacy

-   **Critical**: No encryption keys, passwords, or unencrypted file data should ever be sent to the backend
-   Backend only handles encrypted files if temporary storage is used
-   All encryption/decryption happens client-side

## Performance Optimization

### Caching Strategy

-   No caching needed for temporary files
-   Files are meant to be short-lived

### Edge Computing Benefits

-   Files stored in R2 are served from edge locations
-   Fast upload/download from anywhere

### Cost Management

-   Keep file size limits within free tier (100MB per file)
-   Automatic expiration prevents storage bloat
-   Consider cleanup job for orphaned files (optional)

## Implementation Checklist

### API Endpoints

-   [ ] POST /upload-temp endpoint
-   [ ] GET /download-temp/:fileId endpoint
-   [ ] DELETE /temp/:fileId endpoint
-   [ ] Error handling (per API_CONTRACT.md)

### Data Layer

-   [ ] R2 bucket setup and configuration
-   [ ] File storage operations
-   [ ] File retrieval operations
-   [ ] File deletion operations
-   [ ] Expiration handling

### Business Logic

-   [ ] File validation
-   [ ] File ID generation
-   [ ] Expiration timestamp calculation
-   [ ] Error handling

## Dependencies

### Workers Libraries

-   Native Workers API
-   `@cloudflare/workers-types` for types
-   Multipart form data parsing (native or library)

## Error Codes

> **All error codes are defined in `API_CONTRACT.yml`.** This section explains implementation-specific error mapping only.

### Error Mapping

How to map internal errors to API contract error codes:

-   Invalid file or request format → `INVALID_INPUT` (400)
-   File exceeds maximum size → `FILE_TOO_LARGE` (413)
-   File not found or expired → `NOT_FOUND` (404)
-   R2 storage errors → `INTERNAL_ERROR` (500)
-   Unexpected server errors → `INTERNAL_ERROR` (500)

## Monitoring & Logging

-   Log file uploads (file size, type)
-   Log file downloads
-   Log file deletions
-   Monitor R2 storage usage
-   Alert on storage approaching limits

## Important Notes

**Minimal Backend**: This backend is intentionally minimal. The frontend performs all encryption/decryption operations client-side using the `@noble/ciphers` library (audited, secure) combined with Web Crypto API for key derivation. The backend only provides optional temporary file storage if needed.

**Security First**: No encryption keys, passwords, or unencrypted file data should ever be sent to or stored on the backend. All sensitive operations are client-side only. The frontend uses well-tested, audited cryptographic libraries to ensure security.

**Optional Usage**: The frontend can operate entirely without backend interaction. These endpoints are provided for optional use cases where temporary file storage might be helpful.

---

**Note**: This document is downstream from `API_CONTRACT.yml` and independent of frontend implementation.

**Key principles**:

-   **DO NOT** duplicate request/response schemas from the API contract
-   **DO NOT** duplicate error codes or validation rules from the API contract
-   **DO** focus on implementation-specific details (database queries, external services, business logic)
-   **DO** reference the API contract when discussing endpoints or data structures
-   All API responses **MUST** match the contract defined in `API_CONTRACT.yml`

