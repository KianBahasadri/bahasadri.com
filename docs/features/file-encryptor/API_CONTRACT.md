# File Encryptor - API Contract

**API contract document defining the interface between frontend and backend. This is the ONLY coupling point between frontend and backend.**

## Purpose

This feature provides file encryption and decryption capabilities. Since encryption/decryption happens client-side for security, the backend is minimal and primarily handles optional temporary file storage if needed. Most operations are client-side only.

## API Base URL

-   Development: `http://localhost:8787/api`
-   Production: `https://bahasadri.com/api`

## Endpoints

### `POST /api/file-encryptor/upload-temp`

**Description**: Optionally upload a file to temporary storage for processing. This endpoint is optional - encryption/decryption can happen entirely client-side without backend interaction.

**Request**:

-   Method: `POST`
-   Content-Type: `multipart/form-data`
-   Body: Form data with `file` field containing the file to upload

**Response**:

```typescript
interface UploadTempResponse {
    fileId: string;
    expiresAt: number; // Unix timestamp
}
```

**Status Codes**:

-   `200 OK`: File uploaded successfully
-   `400 Bad Request`: Invalid file or request
-   `413 Payload Too Large`: File too large
-   `500 Internal Server Error`: Server error

### `GET /api/file-encryptor/download-temp/:fileId`

**Description**: Download a temporarily stored file. Used if files are stored on backend during processing.

**Request**:

-   Method: `GET`
-   Path parameter: `fileId` - The file ID from upload response

**Response**:

-   Content-Type: `application/octet-stream` or file's original content type
-   Body: File binary data

**Status Codes**:

-   `200 OK`: File downloaded successfully
-   `404 Not Found`: File not found or expired
-   `500 Internal Server Error`: Server error

### `DELETE /api/file-encryptor/temp/:fileId`

**Description**: Delete a temporarily stored file. Used to clean up after processing.

**Request**:

-   Method: `DELETE`
-   Path parameter: `fileId` - The file ID to delete

**Response**:

```typescript
interface DeleteTempResponse {
    success: boolean;
}
```

**Status Codes**:

-   `200 OK`: File deleted successfully
-   `404 Not Found`: File not found
-   `500 Internal Server Error`: Server error

## Shared Data Models

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

## Error Handling

### Standard Error Response

All errors follow this format:

```typescript
interface ErrorResponse {
    error: string;
}
```

### Error Codes

| Code             | HTTP Status | When to Use                          |
| ---------------- | ----------- | ------------------------------------ |
| `INVALID_INPUT`  | 400         | Invalid file or request format       |
| `FILE_TOO_LARGE` | 413         | File exceeds maximum size limit      |
| `NOT_FOUND`      | 404         | File not found or expired            |
| `INTERNAL_ERROR` | 500         | Server error during processing       |

## Authentication/Authorization

-   **Required**: No
-   **Method**: None
-   Files are stored temporarily and expire automatically

## CORS

-   **Allowed Origins**: `https://bahasadri.com`
-   **Allowed Methods**: `GET`, `POST`, `DELETE`
-   **Allowed Headers**: `Content-Type`

## Important Notes

**Client-Side Encryption**: The actual encryption and decryption operations happen entirely in the browser using Web Crypto API. The backend endpoints above are optional and only used if temporary file storage is needed. The frontend can perform all encryption/decryption operations without any backend interaction.

**Security**: No encryption keys, passwords, or unencrypted file data should ever be sent to the backend. All sensitive operations are performed client-side.

---

**Note**: This document defines the contract between frontend and backend. Implementation details are in FRONTEND.md and BACKEND.md respectively. Note that most encryption/decryption operations are client-side only and don't require backend interaction.

