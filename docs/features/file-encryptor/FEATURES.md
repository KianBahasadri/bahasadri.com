# File Encryptor - User Features

**User-facing feature description from the user's perspective. This document describes what users can do and what the feature provides.**

## Overview

A secure file encryption and decryption utility that allows users to encrypt files for safe storage or transmission, and decrypt them when needed. Users can choose between password-based encryption or keyfile-based encryption for enhanced security.

**Note**: Encryption/decryption operations are performed server-side for performance (especially important for large files on mobile devices). Files are processed ephemerally - unencrypted data is never stored on the server, only processed in memory and immediately discarded.

## Key Features

### File Encryption

Users can upload any file and encrypt it using either a password or a keyfile. The encrypted file can then be downloaded for secure storage or sharing.

### Text Encryption

Users can paste text directly into the interface instead of uploading a file. The text is encrypted using either a password or a keyfile, and the encrypted result can be downloaded as a file or copied as text.

### File Decryption

Users can upload an encrypted file and decrypt it using the same password or keyfile that was used for encryption, restoring the original file.

### Text Decryption

Users can paste encrypted text directly into the interface to decrypt it. The decrypted result can be downloaded as a file or displayed as text (if the original content was text).

### Password-Based Encryption

Users can encrypt files or text using a password of their choice. The same password must be used to decrypt later.

### Keyfile-Based Encryption

Users can encrypt files or text using a keyfile (a file used as the encryption key). The system can generate a keyfile automatically, or users can provide their own. The same keyfile must be used to decrypt later.

## User Workflows

### Encrypt a File with Password

**Goal**: Encrypt a file using a password for secure storage or sharing

**Steps**:

1. Navigate to the file encryptor page
2. Select "Encrypt" mode
3. Choose "Password" as the encryption method
4. Upload the file to encrypt
5. Enter a password
6. Click "Encrypt"
7. Download the encrypted file

**Result**: Encrypted file is downloaded, ready for secure storage or sharing

### Encrypt a File with Keyfile

**Goal**: Encrypt a file using a keyfile for enhanced security

**Steps**:

1. Navigate to the file encryptor page
2. Select "Encrypt" mode
3. Choose "Keyfile" as the encryption method
4. Upload the file to encrypt
5. Either upload your own keyfile or let the system generate one
6. If system-generated, download the keyfile for safekeeping
7. Click "Encrypt"
8. Download the encrypted file

**Result**: Encrypted file and keyfile (if generated) are available for download

### Encrypt Text with Password

**Goal**: Encrypt text content using a password without creating a file

**Steps**:

1. Navigate to the file encryptor page
2. Select "Encrypt" mode
3. Choose "Password" as the encryption method
4. Select "Text" input mode
5. Paste or type the text to encrypt
6. Enter a password
7. Click "Encrypt"
8. Copy the encrypted text or download as a file

**Result**: Encrypted text is available to copy or download

### Decrypt a File with Password

**Goal**: Decrypt a previously encrypted file using the password

**Steps**:

1. Navigate to the file encryptor page
2. Select "Decrypt" mode
3. Choose "Password" as the decryption method
4. Upload the encrypted file
5. Enter the password used for encryption
6. Click "Decrypt"
7. Download the decrypted file

**Result**: Original file is restored and available for download

### Decrypt a File with Keyfile

**Goal**: Decrypt a previously encrypted file using the keyfile

**Steps**:

1. Navigate to the file encryptor page
2. Select "Decrypt" mode
3. Choose "Keyfile" as the decryption method
4. Upload the encrypted file
5. Upload the keyfile used for encryption
6. Click "Decrypt"
7. Download the decrypted file

**Result**: Original file is restored and available for download

### Decrypt Text with Password

**Goal**: Decrypt encrypted text using the password

**Steps**:

1. Navigate to the file encryptor page
2. Select "Decrypt" mode
3. Choose "Password" as the decryption method
4. Select "Text" input mode
5. Paste the encrypted text
6. Enter the password used for encryption
7. Click "Decrypt"
8. View the decrypted text or download as a file

**Result**: Original text is restored and displayed or available for download

## User Capabilities

-   Encrypt any file type (documents, images, videos, etc.)
-   Encrypt text by pasting directly into the interface
-   Decrypt previously encrypted files
-   Decrypt encrypted text by pasting directly into the interface
-   Choose between password or keyfile encryption methods
-   Generate secure keyfiles automatically
-   Use custom keyfiles for encryption
-   Download encrypted files for secure storage
-   Copy encrypted text to clipboard
-   Download decrypted files to restore originals
-   View decrypted text directly in the interface
-   Server-side processing for performance (handles large files efficiently)
-   Ephemeral processing (unencrypted data never stored on server)

## Use Cases

### Secure File Storage

Encrypt sensitive files before storing them in cloud storage or on external drives, ensuring that even if the storage is compromised, files remain protected.

### Secure File Sharing

Encrypt files before sharing them via email, messaging apps, or file sharing services. Share the password or keyfile separately through a different channel for enhanced security.

### Backup Protection

Encrypt important backups to protect them from unauthorized access, while still maintaining the ability to restore files when needed.

### Privacy Protection

Encrypt personal files to ensure privacy, even if devices are lost, stolen, or accessed by unauthorized parties.

### Quick Text Encryption

Quickly encrypt sensitive text content like passwords, private notes, or confidential messages without needing to create a file first. Perfect for secure sharing of text snippets.

## User Benefits

-   **Secure**: Uses audited cryptographic libraries (`@noble/ciphers`) with AES-256-GCM encryption
-   **Flexible**: Choose between password or keyfile encryption based on security needs
-   **Simple**: Easy-to-use interface for encrypting and decrypting files
-   **Performant**: Server-side processing handles large files efficiently, even on mobile devices
-   **Ephemeral**: Unencrypted data is never stored on the server - only processed in memory and immediately discarded
-   **Universal**: Works with any file type and size
-   **Reliable**: Standard encryption algorithms ensure compatibility and security

**Security Note**: Server-side processing means the server sees unencrypted data during processing. Users must trust the server. The server ensures no unencrypted data is stored or logged.

---

**Note**: This document describes features from the user's perspective. For technical implementation details, see `API_CONTRACT.md`, `FRONTEND.md`, and `BACKEND.md`.
