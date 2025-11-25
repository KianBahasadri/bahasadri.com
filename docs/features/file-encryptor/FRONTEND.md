# File Encryptor - Frontend Design

**Frontend-specific design and implementation requirements. This document is independent of backend implementation details.**

## Overview

Frontend implementation for the File Encryptor utility. This feature provides file encryption and decryption by calling server-side APIs. All encryption/decryption operations are performed on the server for performance (especially important for large files on mobile devices). The server processes files ephemerally - unencrypted data is never stored.

**Security Note**: Server-side processing means the server sees unencrypted data during processing. Users must trust the server. The server uses well-tested, audited cryptographic libraries (`@noble/ciphers`) and ensures ephemeral processing (no storage of unencrypted data).

## Code Location

`frontend/src/pages/file-encryptor/`

## API Contract Reference

See `docs/features/file-encryptor/API_CONTRACT.yml` for the API contract this frontend consumes. All encryption/decryption operations require backend interaction via API calls.

## Pages/Routes

### `/file-encryptor`

**Component**: `FileEncryptor.tsx`

**Description**: Main page for file encryption and decryption utility

**Route Configuration**:

```typescript
<Route path="/file-encryptor" element={<FileEncryptor />} />
```

## Components

### FileEncryptor (Main Page)

**Location**: `FileEncryptor.tsx`

**Purpose**: Main component that handles file encryption and decryption operations

**State**:

-   Server state: API calls for encryption/decryption operations
-   Local state:
    -   `mode`: `'encrypt' | 'decrypt'`
    -   `method`: `'password' | 'keyfile'`
    -   `inputFile`: `File | null`
    -   `outputFile`: `Blob | null`
    -   `password`: `string`
    -   `keyfile`: `File | null`
    -   `isProcessing`: `boolean`
    -   `error`: `string | null`

**Layout**:

-   Mode selector (Encrypt/Decrypt)
-   Method selector (Password/Keyfile)
-   File upload area
-   Password input (if password method)
-   Keyfile upload (if keyfile method)
-   Action button (Encrypt/Decrypt)
-   Download button (when output is ready)
-   Error display area

### FileUpload

**Location**: `components/FileUpload/FileUpload.tsx`

**Purpose**: Handles file selection via drag-and-drop or click

**Props**:

```typescript
interface FileUploadProps {
    onFileSelect: (file: File) => void;
    accept?: string;
    disabled?: boolean;
}
```

**State**:

-   `isDragging`: `boolean`

**Interactions**:

-   Drag and drop file
-   Click to select file
-   Visual feedback for drag state

**Styling**:

-   CSS Modules: `FileUpload.module.css`
-   Drag-and-drop visual states
-   File input styling

### EncryptionControls

**Location**: `components/EncryptionControls/EncryptionControls.tsx`

**Purpose**: Displays controls for encryption method (password or keyfile input)

**Props**:

```typescript
interface EncryptionControlsProps {
    method: 'password' | 'keyfile';
    password: string;
    keyfile: File | null;
    onPasswordChange: (password: string) => void;
    onKeyfileChange: (file: File | null) => void;
    onGenerateKeyfile: () => void;
    disabled?: boolean;
}
```

**State**:

-   Local state for password visibility toggle

**Interactions**:

-   Password input
-   Keyfile upload
-   Generate keyfile button
-   Show/hide password toggle

**Styling**:

-   CSS Modules: `EncryptionControls.module.css`
-   Form input styling
-   File upload button styling

## State Management

### Local State (React)

```typescript
// Mode: encrypt or decrypt
const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');

// Method: password or keyfile
const [method, setMethod] = useState<'password' | 'keyfile'>('password');

// Input file
const [inputFile, setInputFile] = useState<File | null>(null);

// Output file (encrypted or decrypted)
const [outputFile, setOutputFile] = useState<Blob | null>(null);

// Password for password-based encryption
const [password, setPassword] = useState<string>('');

// Keyfile for keyfile-based encryption
const [keyfile, setKeyfile] = useState<File | null>(null);

// Processing state
const [isProcessing, setIsProcessing] = useState<boolean>(false);

// Error state
const [error, setError] = useState<string | null>(null);
```

## Encryption/Decryption Logic

### API Client Functions

**Location**: `lib/api.ts`

All encryption/decryption operations are performed by calling server APIs. The frontend sends files and credentials to the server and receives encrypted/decrypted files back.

```typescript
// Encrypt file with password
export async function encryptWithPassword(
    file: File,
    password: string
): Promise<Blob>;

// Encrypt file with keyfile
export async function encryptWithKeyfile(
    file: File,
    keyfile: File
): Promise<Blob>;

// Decrypt file with password
export async function decryptWithPassword(
    encryptedFile: File,
    password: string
): Promise<Blob>;

// Decrypt file with keyfile
export async function decryptWithKeyfile(
    encryptedFile: File,
    keyfile: File
): Promise<Blob>;

// Generate a random keyfile (client-side)
// Creates a secure random 256-bit (32-byte) keyfile
export async function generateKeyfile(): Promise<Blob>;
```

### Implementation Details

**API Endpoints**:
-   `POST /api/file-encryptor/encrypt` - Encrypt a file
-   `POST /api/file-encryptor/decrypt` - Decrypt a file

**Request Format**:
-   Content-Type: `multipart/form-data`
-   Fields:
    -   `file`: File to encrypt/decrypt (binary)
    -   `method`: `"password"` or `"keyfile"` (string)
    -   `password`: Password string (if method is password)
    -   `keyfile`: Keyfile binary (if method is keyfile)

**Response Format**:
-   Content-Type: `application/octet-stream`
-   Body: Encrypted/decrypted file as binary data

**Example Implementation**:

```typescript
export async function encryptWithPassword(
    file: File,
    password: string
): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('method', 'password');
    formData.append('password', password);
    
    const response = await fetch('/api/file-encryptor/encrypt', {
        method: 'POST',
        body: formData,
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Encryption failed');
    }
    
    return response.blob();
}
```

### Security Considerations

**Server-Side Processing**:
-   The server sees unencrypted data during processing
-   Users must trust the server
-   Server ensures ephemeral processing (no storage)

**Client-Side Responsibilities**:
-   Validate user input before sending to server
-   Handle errors gracefully (wrong password, network errors, etc.)
-   Show clear loading states during processing
-   Display security notice about server-side processing

**Keyfile Generation**:
-   Keyfile generation happens client-side using `crypto.getRandomValues()`
-   Generated keyfiles are never sent to the server (only used for encryption requests)

## API Integration

### API Client Functions

**Location**: `lib/api.ts`

All encryption/decryption operations are performed via server API calls.

```typescript
// Encrypt file with password
export async function encryptWithPassword(
    file: File,
    password: string
): Promise<Blob>;

// Encrypt file with keyfile
export async function encryptWithKeyfile(
    file: File,
    keyfile: File
): Promise<Blob>;

// Decrypt file with password
export async function decryptWithPassword(
    encryptedFile: File,
    password: string
): Promise<Blob>;

// Decrypt file with keyfile
export async function decryptWithKeyfile(
    encryptedFile: File,
    keyfile: File
): Promise<Blob>;

// Generate a random keyfile (client-side)
export async function generateKeyfile(): Promise<Blob>;
```

### Error Handling

-   Display user-friendly error messages
-   Handle encryption/decryption errors gracefully
-   Validate password/keyfile before processing
-   Show loading states during processing

## User Interactions

### Primary Actions

-   **Encrypt File**:
    -   Trigger: Click "Encrypt" button
    -   Flow: Validate input → Encrypt file → Generate download
    -   Error handling: Display error if encryption fails

-   **Decrypt File**:
    -   Trigger: Click "Decrypt" button
    -   Flow: Validate input → Decrypt file → Generate download
    -   Error handling: Display error if decryption fails (wrong password/keyfile)

-   **Download Result**:
    -   Trigger: Click "Download" button
    -   Flow: Create download link → Trigger browser download
    -   Error handling: Handle download errors

### Form Handling

-   Validate file is selected before processing
-   Validate password is provided (if password method)
-   Validate keyfile is provided (if keyfile method)
-   Show validation errors inline

## UI/UX Requirements

### Layout

-   Centered layout with clear sections
-   Mode selector at top (Encrypt/Decrypt tabs)
-   Method selector below mode
-   File upload area prominently displayed
-   Controls section for password/keyfile
-   Action button and download button
-   Error messages displayed clearly

### Visual Design

-   Clear visual distinction between encrypt and decrypt modes
-   Drag-and-drop area with visual feedback
-   Progress indicator during encryption/decryption
-   Success state when file is ready for download

### User Feedback

-   Loading states: Show spinner/progress during encryption/decryption
-   Error messages: Display in error area with clear messaging
-   Success feedback: Show success message and enable download button
-   Empty states: Guide user to upload file and select method

## Implementation Checklist

### Components

-   [ ] FileEncryptor page component
-   [ ] FileUpload component
-   [ ] EncryptionControls component
-   [ ] CSS Modules for all components

### Pages

-   [ ] Main page route configuration

### API Integration

-   [ ] API client functions for encrypt/decrypt endpoints
-   [ ] FormData construction for multipart requests
-   [ ] Error handling for API calls (network errors, server errors)
-   [ ] Response handling (binary blob conversion)
-   [ ] Keyfile generation function (client-side, using crypto.getRandomValues)

### State Management

-   [ ] Local state management
-   [ ] File handling
-   [ ] Error handling
-   [ ] Loading states

### Styling

-   [ ] CSS Modules for components
-   [ ] Responsive design
-   [ ] Loading/error states
-   [ ] Drag-and-drop visual feedback

### Integration

-   [ ] Server API integration (encrypt/decrypt endpoints)
-   [ ] FormData handling for file uploads
-   [ ] Binary response handling (Blob conversion)
-   [ ] File download functionality
-   [ ] Error handling gracefully (network errors, wrong password, etc.)
-   [ ] Security notice UI (inform users about server-side processing)

## Dependencies

### React Libraries

-   `react-router-dom`: Routing
-   Standard React hooks

### Client-Side Libraries

-   **No encryption libraries needed** - All encryption/decryption happens server-side
-   Web Crypto API: For keyfile generation only
    -   `crypto.getRandomValues()`: Secure random number generation for keyfile creation

## Performance Considerations

-   Show progress for large file uploads/downloads
-   Handle network errors gracefully (timeouts, connection issues)
-   Display file size information to users
-   Consider chunked uploads for very large files (if needed)
-   Server-side processing handles large files efficiently (no client memory constraints)

## Accessibility

-   Semantic HTML: Use proper form elements
-   ARIA labels: Label inputs and buttons
-   Keyboard navigation: Support keyboard shortcuts
-   Screen reader support: Announce processing states and errors
-   File input: Properly labeled and accessible

## Security Notice

**Important**: This feature performs encryption/decryption on the server. While the server processes files ephemerally (no storage of unencrypted data), the server does see unencrypted files during processing. Users must trust the server with their data. This is a performance trade-off that allows handling of large files on mobile devices.

The UI should display a clear security notice informing users about server-side processing.

---

**Note**: This document is independent of backend implementation. Only the API contract in API_CONTRACT.yml couples frontend and backend. All encryption/decryption operations require backend interaction.

