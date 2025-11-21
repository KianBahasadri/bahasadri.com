/**
 * File Hosting Utility - D1 Helpers
 *
 * Helper functions for interacting with the FILE_HOSTING_DB binding. All query
 * helpers return typed data structures defined in ./types.
 *
 * @see ../../../docs/AI_AGENT_STANDARDS.md
 * @see ../../../docs/DEVELOPMENT.md
 * @see ../../../docs/ARCHITECTURE.md
 */

import type { D1Database } from "@cloudflare/workers-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type {
    AccessLogEntry,
    NewAccessLogEntry,
    FileMetadata,
    NewFileRecord,
    WhoisRecord,
} from "./types";

let cachedDb: D1Database | null = null;
let warnedMissingDb = false;

async function resolveDatabase(): Promise<D1Database | null> {
    if (cachedDb) {
        return cachedDb;
    }

    try {
        const { env } = await getCloudflareContext({ async: true });
        const typedEnv = env as
            | { FILE_HOSTING_DB?: D1Database; file_hosting?: D1Database }
            | undefined;
        const db = typedEnv?.FILE_HOSTING_DB ?? typedEnv?.file_hosting ?? null;

        if (!db) {
            throw new Error("FILE_HOSTING_DB binding missing");
        }

        cachedDb = db;
        return db;
    } catch (error) {
        if (!warnedMissingDb) {
            console.warn(
                "File Hosting: FILE_HOSTING_DB binding unavailable. Database operations are disabled.",
                error instanceof Error ? error.message : error
            );
            warnedMissingDb = true;
        }

        return null;
    }
}

function mapFileRow(row: Record<string, unknown>): FileMetadata {
    return {
        id: String(row.id),
        name: String(row.name),
        originalSize: Number(row.original_size),
        compressedSize: row.compressed_size == null ? null : Number(row.compressed_size),
        mimeType: String(row.mime_type),
        uploadTime: String(row.upload_time),
        compressionStatus: row.compression_status as FileMetadata["compressionStatus"],
        originalUrl: String(row.original_url),
        compressedUrl: row.compressed_url == null ? null : String(row.compressed_url),
        compressionRatio: row.compression_ratio == null ? null : Number(row.compression_ratio),
        accessCount: Number(row.access_count ?? 0),
        lastAccessed: row.last_accessed == null ? null : String(row.last_accessed),
        deleted: Boolean(row.deleted),
    };
}

function mapAccessLogRow(row: Record<string, unknown>): AccessLogEntry {
    return {
        id: String(row.id),
        fileId: String(row.file_id),
        ipAddress: String(row.ip_address),
        timestamp: String(row.timestamp),
        userAgent: row.user_agent == null ? null : String(row.user_agent),
        referrer: row.referrer == null ? null : String(row.referrer),
        country: row.country == null ? null : String(row.country),
        organization: row.organization == null ? null : String(row.organization),
        asn: row.asn == null ? null : String(row.asn),
    };
}

function mapWhoisRow(row: Record<string, unknown>): WhoisRecord {
    return {
        ipAddress: String(row.ip_address),
        country: row.country == null ? null : String(row.country),
        organization: row.organization == null ? null : String(row.organization),
        asn: row.asn == null ? null : String(row.asn),
        cachedAt: String(row.cached_at),
        expiresAt: String(row.expires_at),
    };
}

/**
 * Insert a new file record.
 */
export async function insertFile(record: NewFileRecord): Promise<void> {
    const db = await resolveDatabase();
    if (!db) {
        throw new Error("Database binding is missing.");
    }

    await db
        .prepare(
            `INSERT INTO files (
                id,
                name,
                original_size,
                mime_type,
                original_url
            ) VALUES (?1, ?2, ?3, ?4, ?5)`
        )
        .bind(
            record.id,
            record.name,
            record.originalSize,
            record.mimeType,
            record.originalUrl
        )
        .run();
}

/**
 * Retrieve a single file by ID.
 */
export async function getFileById(id: string): Promise<FileMetadata | null> {
    const db = await resolveDatabase();
    if (!db) {
        return null;
    }

    const result = await db
        .prepare(`SELECT * FROM files WHERE id = ?1 AND deleted = 0`)
        .bind(id)
        .first<Record<string, unknown>>();

    return result ? mapFileRow(result) : null;
}

/**
 * List the most recent files.
 */
export async function listRecentFiles(limit = 25): Promise<FileMetadata[]> {
    const db = await resolveDatabase();
    if (!db) {
        return [];
    }

    const result = await db
        .prepare(
            `SELECT * FROM files WHERE deleted = 0 ORDER BY upload_time DESC LIMIT ?1`
        )
        .bind(limit)
        .all<Record<string, unknown>>();

    return result.results?.map(mapFileRow) ?? [];
}

/**
 * Increment access count and update last accessed timestamp.
 */
export async function incrementAccessCount(fileId: string): Promise<void> {
    const db = await resolveDatabase();
    if (!db) {
        return;
    }

    await db
        .prepare(
            `UPDATE files
             SET access_count = access_count + 1,
                 last_accessed = CURRENT_TIMESTAMP
             WHERE id = ?1`
        )
        .bind(fileId)
        .run();
}

/**
 * Insert an access log entry.
 */
export async function insertAccessLog(entry: NewAccessLogEntry): Promise<void> {
    const db = await resolveDatabase();
    if (!db) {
        return;
    }

    await db
        .prepare(
            `INSERT INTO access_logs (
                id,
                file_id,
                ip_address,
                user_agent,
                referrer,
                country,
                organization,
                asn
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`
        )
        .bind(
            entry.id,
            entry.fileId,
            entry.ipAddress,
            entry.userAgent ?? null,
            entry.referrer ?? null,
            entry.country ?? null,
            entry.organization ?? null,
            entry.asn ?? null
        )
        .run();
}

/**
 * Retrieve access logs for a file ordered by latest first.
 */
export async function getAccessLogs(
    fileId: string,
    limit = 50
): Promise<AccessLogEntry[]> {
    const db = await resolveDatabase();
    if (!db) {
        return [];
    }

    const result = await db
        .prepare(
            `SELECT * FROM access_logs WHERE file_id = ?1 ORDER BY timestamp DESC LIMIT ?2`
        )
        .bind(fileId, limit)
        .all<Record<string, unknown>>();

    return result.results?.map(mapAccessLogRow) ?? [];
}

/**
 * Cache WHOIS data for a specific IP address.
 */
export async function cacheWhoisRecord(record: WhoisRecord): Promise<void> {
    const db = await resolveDatabase();
    if (!db) {
        return;
    }

    await db
        .prepare(
            `INSERT OR REPLACE INTO whois_cache (
                ip_address,
                country,
                organization,
                asn,
                cached_at,
                expires_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
        )
        .bind(
            record.ipAddress,
            record.country ?? null,
            record.organization ?? null,
            record.asn ?? null,
            record.cachedAt,
            record.expiresAt
        )
        .run();
}

/**
 * Retrieve WHOIS data for an IP if still valid.
 */
export async function getWhoisRecord(
    ipAddress: string
): Promise<WhoisRecord | null> {
    const db = await resolveDatabase();
    if (!db) {
        return null;
    }

    const result = await db
        .prepare(
            `SELECT * FROM whois_cache
             WHERE ip_address = ?1 AND expires_at > CURRENT_TIMESTAMP`
        )
        .bind(ipAddress)
        .first<Record<string, unknown>>();

    return result ? mapWhoisRow(result) : null;
}
