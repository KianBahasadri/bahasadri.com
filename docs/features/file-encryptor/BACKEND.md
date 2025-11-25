# File Encryptor - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

**IMPORTANT**: This document is downstream from `API_CONTRACT.yml`. Do NOT duplicate request/response schemas, error codes, or validation rules already defined in the API contract. Reference the contract and focus on implementation-specific details only.

## Overview

Backend implementation for the File Encryptor utility. All encryption/decryption operations are performed server-side for performance (especially important for large files on mobile devices). Files are processed **ephemerally** - unencrypted data is never stored, only processed in memory and immediately discarded after encryption/decryption completes.

**Security Note**: While server-side processing means the server sees unencrypted data during processing, we ensure:
- No unencrypted data is ever stored (ephemeral processing only)
- No logging of file contents or passwords
- Secure handling using audited cryptographic libraries (`@noble/ciphers`)
- Files are processed in memory and immediately discarded

## Code Location

`backend/src/routes/file-encryptor/`

## API Contract Reference

**All request/response schemas, error codes, and validation rules are defined in:**
`docs/features/file-encryptor/API_CONTRACT.yml`

This document focuses solely on backend implementation details not covered in the API contract.

## API Endpoints

### `POST /api/file-encryptor/encrypt`

**Handler**: `encryptFile()`

**Description**: Encrypt a file using password or keyfile. Processing is ephemeral - unencrypted data is never stored.

**Request**:
-   Method: `POST`
-   Content-Type: `multipart/form-data`
-   Body: Form data with:
    -   `file`: File to encrypt (required)
    -   `method`: `"password"` or `"keyfile"` (required)
    -   `password`: Password string (required if method is password)
    -   `keyfile`: Keyfile binary (required if method is keyfile)

**Validation**:
-   File must be provided
-   Method must be `"password"` or `"keyfile"`
-   Password must be provided if method is password
-   Keyfile must be provided if method is keyfile
-   File size must be within limits (e.g., 100MB max)

**Response**:
-   Content-Type: `application/octet-stream`
-   Body: Encrypted file binary data

**Implementation Flow**:
1. Parse multipart form data
2. Extract file, method, and credentials (password or keyfile)
3. Validate all required fields
4. Validate file size
5. **Encrypt file using `@noble/ciphers` library**:
   -   For password: Derive key using PBKDF2 (Web Crypto API)
   -   For keyfile: Derive key from keyfile content using SHA-256
   -   Use AES-256-GCM for encryption
6. Return encrypted file as binary response
7. **Immediately discard unencrypted data from memory**

**Error Handling**:
-   `400 Bad Request`: Missing required fields, invalid method, or invalid file
-   `413 Payload Too Large`: File exceeds size limit
-   `500 Internal Server Error`: Encryption error

### `POST /api/file-encryptor/decrypt`

**Handler**: `decryptFile()`

**Description**: Decrypt an encrypted file using password or keyfile. Processing is ephemeral - unencrypted data is never stored.

**Request**:
-   Method: `POST`
-   Content-Type: `multipart/form-data`
-   Body: Form data with:
    -   `file`: Encrypted file to decrypt (required)
    -   `method`: `"password"` or `"keyfile"` (required)
    -   `password`: Password string (required if method is password)
    -   `keyfile`: Keyfile binary (required if method is keyfile)

**Validation**:
-   File must be provided
-   Method must be `"password"` or `"keyfile"`
-   Password must be provided if method is password
-   Keyfile must be provided if method is keyfile
-   File must be valid encrypted format

**Response**:
-   Content-Type: `application/octet-stream`
-   Body: Decrypted file binary data

**Implementation Flow**:
1. Parse multipart form data
2. Extract encrypted file, method, and credentials
3. Validate all required fields
4. Parse encrypted file format (header + encrypted data)
5. **Decrypt file using `@noble/ciphers` library**:
   -   For password: Derive key using PBKDF2 with salt from file header
   -   For keyfile: Derive key from keyfile content using SHA-256
   -   Use AES-256-GCM for decryption
   -   Verify authentication tag
6. Return decrypted file as binary response
7. **Immediately discard decrypted data from memory**

**Error Handling**:
-   `400 Bad Request`: Missing required fields, invalid method, wrong password/keyfile, or corrupted file
-   `404 Not Found`: Invalid encrypted file format
-   `500 Internal Server Error`: Decryption error

### `POST /api/file-encryptor/upload-temp` (DEPRECATED)

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

-   **Ephemeral Processing**: Unencrypted file data exists only in memory during processing and is immediately discarded
-   **No Storage**: Unencrypted data is never written to disk, logs, or any persistent storage
-   **No Logging**: File contents, passwords, and keyfile contents are never logged
-   **Secure Memory**: Use secure memory handling practices - clear buffers after use when possible
-   **Trust Model**: Users must trust the server with their unencrypted data during processing (this is a trade-off for performance on mobile devices)

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

## Encryption Implementation

### Encryption Algorithm

**Library**: `@noble/ciphers` (audited, secure, minimal bundle size)

**Implementation Details**:
-   Use `@noble/ciphers` AES-256-GCM implementation for encryption/decryption
-   Use Web Crypto API's `crypto.subtle.deriveBits()` with PBKDF2 for password-based key derivation
-   Generate random IV (12 bytes for AES-GCM) for each encryption using `crypto.getRandomValues()`
-   Use authenticated encryption (GCM mode) for integrity - the library handles authentication tag automatically
-   For keyfile-based encryption: derive key from keyfile content using SHA-256 hash

**Key Derivation Parameters** (PBKDF2):
-   Algorithm: PBKDF2 with SHA-256
-   Iterations: 100,000 (configurable, but minimum 100k for security)
-   Salt: Random 16-byte salt generated per encryption
-   Key length: 256 bits (32 bytes) for AES-256-GCM

### File Format

Encrypted files use a custom binary format that includes:
-   **Header** (JSON, length-prefixed):
    -   `version`: File format version (currently `1`)
    -   `method`: `"password"` or `"keyfile"`
    -   `originalFilename`: Original filename (if available)
    -   `salt`: Base64-encoded salt (for password method)
    -   `iv`: Base64-encoded IV
-   **Encrypted Data**: AES-GCM encrypted file content (includes authentication tag automatically)

**Format Structure**:
```
[4 bytes: JSON header length (big-endian)]
[JSON header (UTF-8)]
[Encrypted data + authentication tag]
```

### Security Best Practices

1.   **Never log sensitive data** - No passwords, keyfiles, or file contents in logs
2.   **Ephemeral processing** - Unencrypted data only exists in memory during processing
3.   **Immediate cleanup** - Discard unencrypted data immediately after encryption/decryption
4.   **Use audited libraries** - Always use `@noble/ciphers` for crypto operations
5.   **Unique IV per encryption** - Never reuse IVs
6.   **Strong key derivation** - PBKDF2 with sufficient iterations (100k+)
7.   **Secure random generation** - Use `crypto.getRandomValues()` for all randomness
8.   **Error handling** - Don't leak information about decryption failures (wrong password, etc.)

## Implementation Checklist

### API Endpoints

-   [ ] POST /encrypt endpoint
-   [ ] POST /decrypt endpoint
-   [ ] Error handling (per API_CONTRACT.yml)
-   [ ] Multipart form data parsing
-   [ ] File validation

### Encryption Logic

-   [ ] Install and configure `@noble/ciphers` library
-   [ ] Encryption function using `@noble/ciphers` AES-256-GCM
-   [ ] Decryption function using `@noble/ciphers` AES-256-GCM
-   [ ] PBKDF2 key derivation using Web Crypto API
-   [ ] Keyfile-based key derivation (SHA-256)
-   [ ] File format serialization (header + encrypted data)
-   [ ] File format deserialization (parse header, extract encrypted data)
-   [ ] Error handling for encryption/decryption (wrong password, corrupted file, etc.)

### Data Layer (Optional - for deprecated temp endpoints)

-   [ ] POST /upload-temp endpoint (deprecated)
-   [ ] GET /download-temp/:fileId endpoint (deprecated)
-   [ ] DELETE /temp/:fileId endpoint (deprecated)
-   [ ] R2 bucket setup and configuration (if using temp storage)

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

### Encryption Libraries

-   `@noble/ciphers`: Audited, secure AES-GCM implementation
    -   Package: `@noble/ciphers`
    -   Why: Well-tested, audited, minimal bundle size, actively maintained
    -   Usage: Provides `aes_256_gcm` for encryption/decryption operations
-   Web Crypto API: For PBKDF2 key derivation (available in Workers runtime)
    -   `crypto.subtle.deriveBits()`: PBKDF2 key derivation from passwords
    -   `crypto.getRandomValues()`: Secure random number generation for IVs and salts

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

**Server-Side Encryption**: All encryption/decryption operations are performed server-side for performance, especially important for large files on mobile devices. The backend uses the `@noble/ciphers` library (audited, secure) combined with Web Crypto API for key derivation.

**Ephemeral Processing**: Unencrypted file data is processed in memory only and immediately discarded. No unencrypted data is ever stored, logged, or persisted in any way.

**Security Trade-off**: Server-side processing means the server sees unencrypted data during processing. This is a performance trade-off - users must trust the server. We mitigate this by:
-   Using audited cryptographic libraries
-   Ensuring ephemeral processing (no storage)
-   No logging of sensitive data
-   Secure memory handling practices

**Performance Benefits**: Server-side encryption allows handling of large files that would be problematic on mobile devices due to memory and processing constraints.

---

**Note**: This document is downstream from `API_CONTRACT.yml` and independent of frontend implementation.

**Key principles**:

-   **DO NOT** duplicate request/response schemas from the API contract
-   **DO NOT** duplicate error codes or validation rules from the API contract
-   **DO** focus on implementation-specific details (database queries, external services, business logic)
-   **DO** reference the API contract when discussing endpoints or data structures
-   All API responses **MUST** match the contract defined in `API_CONTRACT.yml`

