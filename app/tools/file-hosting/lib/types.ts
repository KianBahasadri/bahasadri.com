/**
 * File Hosting Utility - Shared Types
 *
 * Centralized TypeScript interfaces used across API routes, components, and
 * utilities for the File Arsenal feature.
 *
 * @see ../../../docs/AI_AGENT_STANDARDS.md
 * @see ../../../docs/DEVELOPMENT.md
 * @see ../../../docs/ARCHITECTURE.md
 */

export type CompressionStatus = "pending" | "processing" | "done" | "failed";

/**
 * File metadata persisted in the D1 database.
 */
export interface FileMetadata {
    id: string;
    name: string;
    originalSize: number;
    compressedSize?: number | null;
    mimeType: string;
    uploadTime: string;
    compressionStatus: CompressionStatus;
    originalUrl: string;
    compressedUrl?: string | null;
    compressionRatio?: number | null;
    accessCount: number;
    lastAccessed?: string | null;
    deleted: boolean;
}

/**
 * Minimal shape for inserting new files.
 */
export interface NewFileRecord {
    id: string;
    name: string;
    originalSize: number;
    mimeType: string;
    originalUrl: string;
}

/**
 * Access log entry capturing request metadata.
 */
export interface AccessLogEntry {
    id: string;
    fileId: string;
    ipAddress: string;
    timestamp: string;
    userAgent?: string | null;
    referrer?: string | null;
    country?: string | null;
    organization?: string | null;
    asn?: string | null;
}

/**
 * Payload used when storing new access log entries.
 */
export interface NewAccessLogEntry {
    id: string;
    fileId: string;
    ipAddress: string;
    userAgent?: string;
    referrer?: string;
    country?: string;
    organization?: string;
    asn?: string;
}

/**
 * Cached WHOIS information for an IP address.
 */
export interface WhoisRecord {
    ipAddress: string;
    country?: string | null;
    organization?: string | null;
    asn?: string | null;
    cachedAt: string;
    expiresAt: string;
}

/**
 * Structure for compression jobs dispatched to Queues.
 */
export interface CompressionJob {
    fileId: string;
    fileName: string;
    mimeType: string;
    r2Key: string;
    originalSize: number;
}

/**
 * Request body expected by the upload route.
 */
export interface UploadRequest {
    file: File;
}

/**
 * Response payload returned by the upload route.
 */
export interface UploadResponse {
    fileId: string;
    downloadUrl: string;
    compressionStatus: CompressionStatus;
}

/**
 * Simplified type for paginated access log responses.
 */
export interface AccessLogResult {
    entries: AccessLogEntry[];
    nextCursor?: string;
}

