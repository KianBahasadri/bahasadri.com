/**
 * Internal types for movies-on-demand feature
 * Note: Request/response types are defined in API_CONTRACT.yml
 * This file only contains internal types not in the API contract
 */

// ============================================================================
// Database Row Types (D1)
// ============================================================================

export interface JobRow {
    job_id: string;
    movie_id: number;
    status: JobStatus;
    progress: number | null;
    release_title: string | null;
    release_id: string | null;
    created_at: string;
    updated_at: string;
    ready_at: string | null;
    expires_at: string | null;
    last_watched_at: string | null;
    error_message: string | null;
}

export interface WatchHistoryRow {
    id: number;
    movie_id: number;
    title: string | null;
    poster_path: string | null;
    last_watched_at: string;
    job_id: string | null;
    status: string | null;
}

export interface MovieMetadataRow {
    movie_id: number;
    title: string | null;
    poster_path: string | null;
    backdrop_path: string | null;
    overview: string | null;
    updated_at: string | null;
}

// ============================================================================
// Job Types
// ============================================================================

export type JobStatus =
    | "queued"
    | "starting"
    | "downloading"
    | "ready"
    | "error"
    | "deleted";

export interface JobQueueMessage {
    job_id: string;
    movie_id: number;
    release_id: string;
    nzb_url: string;
    release_title: string;
}

// ============================================================================
// TMDB API Response Types
// ============================================================================

export interface TMDBMovie {
    id: number;
    title: string;
    overview?: string;
    release_date?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average?: number;
    vote_count?: number;
    popularity?: number;
    genre_ids?: number[];
}

export interface TMDBMovieDetails extends TMDBMovie {
    runtime?: number;
    genres?: { id: number; name: string }[];
    production_companies?: {
        id: number;
        name: string;
        logo_path: string | null;
    }[];
    budget?: number;
    revenue?: number;
    imdb_id?: string;
    credits?: {
        cast: {
            id: number;
            name: string;
            character: string;
            profile_path: string | null;
        }[];
        crew: {
            id: number;
            name: string;
            job: string;
            profile_path: string | null;
        }[];
    };
}

export interface TMDBSearchResponse {
    page: number;
    results: TMDBMovie[];
    total_pages: number;
    total_results: number;
}

// ============================================================================
// NZBGeek Types
// ============================================================================

export interface NZBGeekRelease {
    id: string;
    title: string;
    size: number;
    nzb_url: string;
}

export interface ParsedReleaseMetadata {
    quality: string | undefined;
    resolution: string | undefined;
    codec: string | undefined;
    source: string | undefined;
    group: string | undefined;
}

export interface UsenetRelease extends NZBGeekRelease, ParsedReleaseMetadata {}

// ============================================================================
// API Response Types (matching API_CONTRACT.yml)
// ============================================================================

export interface ErrorResponse {
    error: string;
    code: string;
}

export interface Movie {
    id: number;
    title: string;
    overview?: string;
    release_date?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average?: number;
    vote_count?: number;
    popularity?: number;
    genre_ids?: number[];
}

export interface MovieDetails extends Movie {
    runtime?: number;
    genres?: { id: number; name: string }[];
    production_companies?: {
        id: number;
        name: string;
        logo_path: string | null;
    }[];
    budget?: number;
    revenue?: number;
    imdb_id?: string;
    credits?: {
        cast: {
            id: number;
            name: string;
            character: string;
            profile_path: string | null;
        }[];
        crew: {
            id: number;
            name: string;
            job: string;
            profile_path: string | null;
        }[];
    };
    job_status?: {
        job_id: string;
        status: JobStatus;
        progress: number | null;
        error_message: string | null;
    };
}

export interface MovieSearchResponse {
    results: Movie[];
    total_results: number;
    page: number;
    total_pages: number;
}

export interface ReleasesResponse {
    releases: UsenetRelease[];
    total: number;
}

export interface JobStatusResponse {
    job_id: string;
    movie_id: number;
    status: JobStatus;
    progress: number | null;
    error_message: string | null;
    release_title: string | null;
    created_at: string;
    updated_at: string;
    ready_at: string | null;
    expires_at: string | null;
    last_watched_at: string | null;
}

export interface JobsListResponse {
    jobs: JobStatusResponse[];
}

export interface FetchMovieRequest {
    mode: "auto" | "manual";
    release_id?: string;
    quality_preference?: "720p" | "1080p" | "4K";
}

export interface FetchMovieResponse {
    job_id: string;
    status: JobStatus;
}

export interface StreamResponse {
    stream_url: string;
    content_type: string;
    file_size?: number;
}

export interface WatchHistoryItem {
    movie_id: number;
    title: string;
    poster_path: string | null;
    last_watched_at: string;
    job_id: string | null;
    status: string | null;
}

export interface WatchHistoryResponse {
    movies: WatchHistoryItem[];
    total: number;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationResult {
    ok: boolean;
    error?: string;
}

export type QualityPreference = "720p" | "1080p" | "4K";
