/**
 * File Hosting Utility - D1 Schema
 *
 * D1 schema defining tables for files, access logs, and WHOIS cache used by the
 * File Arsenal utility. Follows repository AI agent standards.
 *
 * @see ../../docs/AI_AGENT_STANDARDS.md
 * @see ../../docs/ARCHITECTURE.md
 * @see ../../docs/UTILITIES.md
 */

-- Files table stores metadata and compression state for every uploaded file.
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    original_size INTEGER NOT NULL,
    compressed_size INTEGER,
    mime_type TEXT NOT NULL,
    upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    compression_status TEXT NOT NULL DEFAULT 'pending',
    original_url TEXT NOT NULL,
    compressed_url TEXT,
    compression_ratio REAL,
    access_count INTEGER NOT NULL DEFAULT 0,
    last_accessed DATETIME,
    deleted INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0, 1))
);

-- Access logs capture every download request with enriched metadata.
CREATE TABLE IF NOT EXISTS access_logs (
    id TEXT PRIMARY KEY,
    file_id TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    referrer TEXT,
    country TEXT,
    organization TEXT,
    asn TEXT,
    FOREIGN KEY (file_id) REFERENCES files (id)
);

-- WHOIS cache stores IP enrichment results to avoid repeated lookups.
CREATE TABLE IF NOT EXISTS whois_cache (
    ip_address TEXT PRIMARY KEY,
    country TEXT,
    organization TEXT,
    asn TEXT,
    cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
);

-- Indexes for query performance.
CREATE INDEX IF NOT EXISTS idx_files_upload_time ON files (upload_time DESC);
CREATE INDEX IF NOT EXISTS idx_files_deleted ON files (deleted);
CREATE INDEX IF NOT EXISTS idx_access_logs_file_timestamp ON access_logs (file_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_whois_cache_expires ON whois_cache (expires_at);

