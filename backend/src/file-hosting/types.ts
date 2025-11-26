// Types for file hosting feature
// Note: Request/response types are defined in API_CONTRACT.yml
// This file only contains internal types not in the API contract

export interface FileRow {
    id: string;
    name: string;
    original_size: number;
    compressed_size: number | null;
    mime_type: string;
    upload_time: string;
    compression_status: string;
    original_url: string;
    compressed_url: string | null;
    compression_ratio: number | null;
    access_count: number;
    last_accessed: string | null;
    deleted: number; // 0 or 1 (boolean in SQLite)
    is_public: number; // 0 or 1 (boolean in SQLite)
}

export interface AccessLogRow {
    id: string;
    file_id: string;
    ip_address: string;
    timestamp: string;
    user_agent: string | null;
    referrer: string | null;
    country: string | null;
    organization: string | null;
    asn: string | null;
}

