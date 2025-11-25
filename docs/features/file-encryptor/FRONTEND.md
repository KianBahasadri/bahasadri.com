# File Encryptor - Frontend Design

**Frontend-specific design and implementation requirements. This document is independent of backend implementation details.**

## Overview

Frontend implementation for the File Encryptor utility. This feature provides client-side file encryption and decryption capabilities using the `@noble/ciphers` library (audited, secure) combined with Web Crypto API for key derivation. Users can encrypt files with passwords or keyfiles, and decrypt them later.

**Security Note**: We use well-tested, audited cryptographic libraries rather than implementing encryption manually. This reduces the risk of security vulnerabilities from implementation errors.

## Code Location

`frontend/src/pages/file-encryptor/`

## API Contract Reference

See `docs/features/file-encryptor/API_CONTRACT.md` for the API contract this frontend consumes. Note that most operations are client-side only and don't require backend interaction.

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

-   Server state: None (all operations are client-side)
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

### Encryption Functions

**Location**: `lib/encryption.ts`

**Library Usage**: All encryption/decryption operations use `@noble/ciphers` for the actual cryptographic operations. This ensures we're using well-tested, audited code rather than implementing crypto primitives manually.

```typescript
import { aes_256_gcm } from '@noble/ciphers/aes';
import { randomBytes } from '@noble/ciphers/utils';

// Encrypt file with password
// Uses PBKDF2 (Web Crypto API) to derive key from password
// Uses @noble/ciphers AES-256-GCM for encryption
export async function encryptWithPassword(
    file: File,
    password: string
): Promise<Blob>;

// Encrypt file with keyfile
// Derives key from keyfile content using SHA-256
// Uses @noble/ciphers AES-256-GCM for encryption
export async function encryptWithKeyfile(
    file: File,
    keyfile: File
): Promise<Blob>;

// Decrypt file with password
// Uses PBKDF2 to derive key, then @noble/ciphers for decryption
export async function decryptWithPassword(
    encryptedFile: File,
    password: string
): Promise<Blob>;

// Decrypt file with keyfile
// Derives key from keyfile, then @noble/ciphers for decryption
export async function decryptWithKeyfile(
    encryptedFile: File,
    keyfile: File
): Promise<Blob>;

// Generate a random keyfile
// Creates a secure random 256-bit (32-byte) keyfile
export async function generateKeyfile(): Promise<Blob>;
```

### Implementation Approach

**Why `@noble/ciphers`?**
-   **Audited**: The library has undergone security audits
-   **Minimal**: Small bundle size, important for free tier constraints
-   **Well-maintained**: Actively maintained by security experts
-   **Type-safe**: Full TypeScript support
-   **No dependencies**: Self-contained, reducing attack surface

**Security Best Practices**:
1.   **Never implement crypto primitives manually** - Always use well-tested libraries
2.   **Use authenticated encryption** - AES-GCM provides both confidentiality and integrity
3.   **Unique IV per encryption** - Never reuse IVs
4.   **Strong key derivation** - PBKDF2 with sufficient iterations (100k+)
5.   **Secure random generation** - Use `crypto.getRandomValues()` for all randomness
6.   **Error handling** - Don't leak information about decryption failures
7.   **Client-side only** - All encryption/decryption happens in the browser, never on the server

### Encryption Algorithm

**Library**: `@noble/ciphers` (audited, secure, minimal bundle size)

**Implementation Details**:
-   Use `@noble/ciphers` AES-GCM implementation for encryption/decryption
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

**Note**: The `@noble/ciphers` library handles IV and authentication tag management internally. Our file format wraps the encrypted output with metadata needed for decryption.

## API Integration

### API Client Functions (Optional)

**Location**: `lib/api.ts`

```typescript
// Upload temporary file (optional)
export const uploadTempFile = async (file: File): Promise<UploadTempResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/file-encryptor/upload-temp', {
        method: 'POST',
        body: formData,
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
    }
    
    return response.json();
};

// Download temporary file (optional)
export const downloadTempFile = async (fileId: string): Promise<Blob> => {
    const response = await fetch(`/api/file-encryptor/download-temp/${fileId}`);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Download failed');
    }
    
    return response.blob();
};

// Delete temporary file (optional)
export const deleteTempFile = async (fileId: string): Promise<void> => {
    const response = await fetch(`/api/file-encryptor/temp/${fileId}`, {
        method: 'DELETE',
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
    }
};
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

### Encryption Logic

-   [ ] Install and configure `@noble/ciphers` library
-   [ ] Encryption functions (password and keyfile) using `@noble/ciphers`
-   [ ] Decryption functions (password and keyfile) using `@noble/ciphers`
-   [ ] PBKDF2 key derivation using Web Crypto API
-   [ ] Keyfile generation function (random secure keyfile)
-   [ ] File format serialization (header + encrypted data)
-   [ ] File format deserialization (parse header, extract encrypted data)
-   [ ] Error handling for encryption/decryption (wrong password, corrupted file, etc.)

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

-   [ ] `@noble/ciphers` library integration
-   [ ] Web Crypto API integration for PBKDF2
-   [ ] File format serialization/deserialization
-   [ ] File download functionality
-   [ ] Error handling gracefully

## Dependencies

### React Libraries

-   `react-router-dom`: Routing
-   Standard React hooks

### Encryption Libraries

-   `@noble/ciphers`: Audited, secure AES-GCM implementation
    -   Package: `@noble/ciphers`
    -   Why: Well-tested, audited, minimal bundle size, actively maintained
    -   Usage: Provides `aes_256_gcm` for encryption/decryption operations
-   Web Crypto API: For PBKDF2 key derivation and random number generation
    -   `crypto.subtle.deriveBits()`: PBKDF2 key derivation from passwords
    -   `crypto.getRandomValues()`: Secure random number generation for IVs and salts

## Performance Considerations

-   Use streaming for large files if possible
-   Show progress for large file encryption/decryption
-   Handle memory efficiently for large files
-   Consider Web Workers for encryption/decryption to avoid blocking UI

## Accessibility

-   Semantic HTML: Use proper form elements
-   ARIA labels: Label inputs and buttons
-   Keyboard navigation: Support keyboard shortcuts
-   Screen reader support: Announce processing states and errors
-   File input: Properly labeled and accessible

---

**Note**: This document is independent of backend implementation. Only the API contract in API_CONTRACT.md couples frontend and backend. Most operations are client-side only and don't require backend interaction.

