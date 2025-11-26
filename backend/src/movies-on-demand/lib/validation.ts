/**
 * Validation utilities for movies-on-demand feature
 */

import type { ValidationResult, QualityPreference } from "../types";

/**
 * Validate search query parameter
 */
export function validateSearchQuery(
    query: string | null | undefined
): ValidationResult {
    if (!query || query.trim().length === 0) {
        return { ok: false, error: "Query parameter 'query' is required" };
    }
    return { ok: true };
}

/**
 * Validate movie ID from path parameter
 */
export function validateMovieId(
    id: string | null | undefined
): ValidationResult & { id?: number } {
    if (!id) {
        return { ok: false, error: "Movie ID is required" };
    }
    const movieId = parseInt(id, 10);
    if (isNaN(movieId) || movieId <= 0) {
        return { ok: false, error: "Invalid movie ID" };
    }
    return { ok: true, id: movieId };
}

/**
 * Validate and parse page number, defaulting to 1 if invalid
 */
export function validatePage(page: string | null | undefined): number {
    if (!page) return 1;
    const pageNum = parseInt(page, 10);
    return isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
}

/**
 * Validate fetch mode and release_id requirement
 */
export function validateFetchMode(
    mode: string | undefined,
    releaseId?: string
): ValidationResult {
    if (mode !== "auto" && mode !== "manual") {
        return { ok: false, error: "Mode must be 'auto' or 'manual'" };
    }
    if (mode === "manual" && !releaseId) {
        return {
            ok: false,
            error: "Manual mode requires 'release_id'. Use GET /releases endpoint first to get available releases.",
        };
    }
    return { ok: true };
}

/**
 * Validate quality preference
 */
export function validateQualityPreference(quality?: string): ValidationResult {
    if (!quality) return { ok: true }; // Optional
    if (!["720p", "1080p", "4K"].includes(quality)) {
        return {
            ok: false,
            error: "Quality preference must be '720p', '1080p', or '4K'",
        };
    }
    return { ok: true };
}

/**
 * Validate job ID format (job_{timestamp}_{random})
 */
export function validateJobId(
    jobId: string | null | undefined
): ValidationResult {
    if (!jobId) {
        return { ok: false, error: "Job ID is required" };
    }
    // Job IDs should start with "job_" and have reasonable format
    if (!jobId.startsWith("job_") || jobId.length < 10) {
        return { ok: false, error: "Invalid job ID format" };
    }
    return { ok: true };
}

/**
 * Validate limit parameter for pagination
 */
export function validateLimit(
    limit: string | null | undefined,
    defaultValue: number = 20,
    maxValue: number = 100
): ValidationResult & { limit: number } {
    if (!limit) {
        return { ok: true, limit: defaultValue };
    }
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1) {
        return {
            ok: false,
            error: "Invalid limit parameter",
            limit: defaultValue,
        };
    }
    if (limitNum > maxValue) {
        return { ok: true, limit: maxValue };
    }
    return { ok: true, limit: limitNum };
}

/**
 * Validate offset parameter for pagination
 */
export function validateOffset(
    offset: string | null | undefined,
    defaultValue: number = 0
): ValidationResult & { offset: number } {
    if (!offset) {
        return { ok: true, offset: defaultValue };
    }
    const offsetNum = parseInt(offset, 10);
    if (isNaN(offsetNum) || offsetNum < 0) {
        return {
            ok: false,
            error: "Invalid offset parameter",
            offset: defaultValue,
        };
    }
    return { ok: true, offset: offsetNum };
}

/**
 * Parse quality preference with default fallback
 */
export function parseQualityPreference(quality?: string): QualityPreference {
    if (quality && ["720p", "1080p", "4K"].includes(quality)) {
        return quality as QualityPreference;
    }
    return "1080p"; // Default preference
}

/**
 * Generate unique job ID
 */
export function generateJobId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `job_${timestamp}_${random}`;
}
