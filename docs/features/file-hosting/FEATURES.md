# File Hosting - User Features

**User-facing feature description from the user's perspective. This document describes what users can do and what the feature provides.**

## Overview

A personal file hosting and sharing utility that allows users to upload files, compress them, share them via public or private links, and view detailed analytics about who has accessed their files. Users can control whether files are accessible to anyone with the link (public) or only accessible through the UI (private).

## Key Features

### File Upload

Users can upload files through a simple drag-and-drop interface or by clicking to select files. Files are automatically stored and made available for sharing. During upload, users can choose whether the file should be public or private.

### Public/Private File Sharing

Users can control the accessibility of their uploaded files:

-   **Public Files**: Anyone with the download link can access the file. No authentication required - the link can be shared freely and accessed from anywhere.
-   **Private Files**: Only accessible through the file hosting UI. Direct download links will not work - users must access the file through the main file hosting page interface.

Users can toggle between public and private sharing when uploading files, allowing them to choose the appropriate access level for each file.

### Access Analytics

Users can view detailed analytics about file access, including:

-   Who accessed the file (IP address)
-   When files were accessed (timestamp)
-   Access count and frequency
-   Geographic location (country, organization)
-   User agent information

### Automatic Compression

Files are automatically compressed in the background to save storage space and improve download speeds, while maintaining the original file.

### QR Code Generation

Users can generate QR codes for their file download links, making it easy to share files by simply showing the QR code. Recipients can scan the QR code with their phone camera to instantly access the file download link.

### URL-Based File Upload

Users can provide a URL to a file, and the system will download that file and host it. This allows users to host files from external sources without needing to download them locally first. This feature will check the link and will use yt-dlp to download the file if necessary.

## User Workflows

### Upload and Share a File

**Goal**: Upload a file and share it with others

**Steps**:

1. Navigate to the file hosting page
2. Choose whether the file should be public or private using the sharing toggle
3. Drag and drop a file into the upload zone (or click to select)
4. Wait for upload to complete
5. Copy the download link or generate a QR code
6. Share the link or QR code with others (if public)

**Result**:

-   **Public files**: File is accessible to anyone with the link or QR code
-   **Private files**: File is only accessible through the UI, direct links will not work

### Host a File from URL

**Goal**: Download a file from a URL and host it

**Steps**:

1. Navigate to the file hosting page
2. Choose whether the file should be public or private using the sharing toggle
3. Enter a URL to a file in the URL input field
4. Click "Download and Host" button
5. Wait for the file to be downloaded and uploaded
6. Copy the download link or generate a QR code
7. Share the link or QR code with others (if public)

**Result**:

-   **Public files**: File from the external URL is downloaded, hosted, and accessible to anyone with the link or QR code
-   **Private files**: File is downloaded and hosted, but only accessible through the UI

### Generate QR Code for File Link

**Goal**: Create a QR code for a file download link to make sharing easier

**Steps**:

1. Navigate to the file hosting page
2. View the list of uploaded files
3. Click on a file to view its details
4. Click "Generate QR Code" button
5. View the QR code containing the download link
6. Download the QR code as an image or display it for others to scan

**Result**: QR code is generated and can be shared or downloaded for easy file access

### View File Analytics

**Goal**: See who has accessed a shared file

**Steps**:

1. Navigate to the file hosting page
2. View the list of uploaded files
3. Click on a file to view its details
4. Review access logs showing IP addresses, timestamps, and geographic data

**Result**: Understanding of file access patterns and who has viewed the file

### Download a Shared File

**Goal**: Access a file shared via link

**Steps**:

1. Receive a file sharing link
2. Click the link or paste it in a browser
3. **For public files**: File downloads automatically
4. **For private files**: Access is denied - user must access the file through the file hosting UI

**Result**:

-   **Public files**: File is downloaded to the user's device
-   **Private files**: Access is denied when using direct link, file must be accessed through the UI

## User Capabilities

-   Upload files of any type (images, documents, videos, etc.)
-   Choose between public and private file sharing for each upload
-   Host files from external URLs by providing a link
-   Share files instantly via public links (for public files)
-   Restrict file access to UI-only (for private files)
-   Generate QR codes for download links (for public files)
-   Download QR codes as images for sharing
-   Track file access with detailed analytics
-   View access history and patterns
-   Download files directly from shared links (for public files)
-   See file metadata (size, type, upload date, sharing status)

## Use Cases

### Personal File Sharing

Share photos, documents, or other files with friends, family, or colleagues without needing to set up accounts or deal with email attachments.

### Content Distribution

Distribute files to a wide audience by sharing a single link or QR code. Useful for sharing resources, media files, or documents. QR codes make it especially easy to share files in person or in printed materials.

### QR Code Sharing

Generate QR codes for file links to share files quickly in person. Recipients can scan the QR code with their phone camera to instantly access the file, eliminating the need to type or copy long URLs.

### Access Monitoring

Track who has accessed shared files and when, useful for understanding content reach and engagement.

### File Backup

Upload important files as a backup solution, with the ability to access them from anywhere via the download link.

### External File Hosting

Host files from external sources by providing a URL. The system downloads the file and hosts it, making it useful for creating permanent links to files that might otherwise become unavailable or for consolidating file hosting in one place.

## User Benefits

-   **Simple**: Drag-and-drop interface makes uploading effortless
-   **Fast**: Files are served from edge locations globally for quick downloads
-   **Convenient Sharing**: Generate QR codes for download links to make sharing easier
-   **Transparent**: Detailed analytics show exactly who accessed files and when
-   **No Account Required**: Share files without requiring recipients to sign up
-   **Automatic Optimization**: Files are compressed automatically to save space and improve performance
-   **Reliable**: Files are stored in durable cloud storage with high availability

---

**Note**: This document describes features from the user's perspective. For technical implementation details, see `API_CONTRACT.md`, `FRONTEND.md`, and `BACKEND.md`.
