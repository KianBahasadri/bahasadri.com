# File Encryptor - Frontend Design

**Frontend-specific design and implementation requirements. This document is independent of backend implementation details.**

## Overview

Frontend implementation for the File Encryptor utility. This feature provides client-side file encryption and decryption capabilities using the Web Crypto API. Users can encrypt files with passwords or keyfiles, and decrypt them later.

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

// Generate a random keyfile
export async function generateKeyfile(): Promise<Blob>;
```

### Encryption Algorithm

-   Use Web Crypto API with AES-GCM algorithm
-   Generate random IV for each encryption
-   Derive key from password using PBKDF2
-   Include IV and metadata in encrypted file format
-   Use authenticated encryption (GCM mode) for integrity

### File Format

Encrypted files should include:
-   IV (Initialization Vector)
-   Encrypted data
-   Metadata (original filename, encryption method)
-   Authentication tag

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
-   [ ] Component tests

### Pages

-   [ ] Main page route configuration
-   [ ] Page tests

### Encryption Logic

-   [ ] Encryption functions (password and keyfile)
-   [ ] Decryption functions (password and keyfile)
-   [ ] Keyfile generation function
-   [ ] File format handling
-   [ ] Error handling for encryption/decryption

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

-   [ ] Web Crypto API integration
-   [ ] File download functionality
-   [ ] Error handling gracefully
-   [ ] Test encryption/decryption flow

## Testing Considerations

### Unit Tests

-   Component rendering
-   User interactions
-   State management
-   Encryption/decryption functions
-   Error handling

### Integration Tests

-   End-to-end encryption flow
-   End-to-end decryption flow
-   Password-based encryption/decryption
-   Keyfile-based encryption/decryption
-   Error scenarios (wrong password, invalid file, etc.)
-   File download functionality

## Dependencies

### React Libraries

-   `react-router-dom`: Routing
-   Standard React hooks

### Encryption Libraries

-   Web Crypto API (native browser API)
-   No external encryption libraries needed

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

