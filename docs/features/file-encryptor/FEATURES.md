# File Encryptor - User Features

**User-facing feature description from the user's perspective. This document describes what users can do and what the feature provides.**

## Overview

A secure file encryption and decryption utility that allows users to encrypt files for safe storage or transmission, and decrypt them when needed. Users can choose between password-based encryption or keyfile-based encryption for enhanced security.

## Key Features

### File Encryption

Users can upload any file and encrypt it using either a password or a keyfile. The encrypted file can then be downloaded for secure storage or sharing.

### File Decryption

Users can upload an encrypted file and decrypt it using the same password or keyfile that was used for encryption, restoring the original file.

### Password-Based Encryption

Users can encrypt files using a password of their choice. The same password must be used to decrypt the file later.

### Keyfile-Based Encryption

Users can encrypt files using a keyfile (a file used as the encryption key). The system can generate a keyfile automatically, or users can provide their own. The same keyfile must be used to decrypt the file later.

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

## User Capabilities

-   Encrypt any file type (documents, images, videos, etc.)
-   Decrypt previously encrypted files
-   Choose between password or keyfile encryption methods
-   Generate secure keyfiles automatically
-   Use custom keyfiles for encryption
-   Download encrypted files for secure storage
-   Download decrypted files to restore originals
-   All encryption/decryption happens client-side for maximum security

## Use Cases

### Secure File Storage

Encrypt sensitive files before storing them in cloud storage or on external drives, ensuring that even if the storage is compromised, files remain protected.

### Secure File Sharing

Encrypt files before sharing them via email, messaging apps, or file sharing services. Share the password or keyfile separately through a different channel for enhanced security.

### Backup Protection

Encrypt important backups to protect them from unauthorized access, while still maintaining the ability to restore files when needed.

### Privacy Protection

Encrypt personal files to ensure privacy, even if devices are lost, stolen, or accessed by unauthorized parties.

## User Benefits

-   **Secure**: Client-side encryption ensures files are never transmitted or stored in unencrypted form
-   **Flexible**: Choose between password or keyfile encryption based on security needs
-   **Simple**: Easy-to-use interface for encrypting and decrypting files
-   **Private**: All encryption/decryption happens in the browser - no server-side processing
-   **Universal**: Works with any file type and size
-   **Reliable**: Standard encryption algorithms ensure compatibility and security

---

**Note**: This document describes features from the user's perspective. For technical implementation details, see `API_CONTRACT.md`, `FRONTEND.md`, and `BACKEND.md`.

