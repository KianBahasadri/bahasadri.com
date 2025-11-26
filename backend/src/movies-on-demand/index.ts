/**
 * Movies on Demand API routes
 * Ephemeral movie streaming service using TMDB, NZBGeek, and Cloudflare infrastructure
 */

import { Hono } from "hono";
import type { Env } from "../types/env";
import { withErrorHandling } from "../lib/error-handling";
import {
    validateSearchQuery,
    validateMovieId,
    validatePage,
    validateFetchMode,
    validateQualityPreference,
    validateJobId,
    validateLimit,
    validateOffset,
    parseQualityPreference,
    generateJobId,
} from "./lib/validation";
import {
    searchMovies as tmdbSearchMovies,
    getPopularMovies as tmdbGetPopular,
    getTopRatedMovies as tmdbGetTopRated,
    getMovieDetails as tmdbGetMovieDetails,
    getSimilarMovies as tmdbGetSimilar,
    getMovieImdbId,
} from "./lib/tmdb";
import {
    searchReleases,
    selectBestRelease,
    findReleaseById,
} from "./lib/nzbgeek";
import type {
    ErrorResponse,
    MovieSearchResponse,
    MovieDetails,
    ReleasesResponse,
    FetchMovieRequest,
    FetchMovieResponse,
    JobStatusResponse,
    JobsListResponse,
    StreamResponse,
    WatchHistoryResponse,
    JobRow,
    WatchHistoryRow,
    JobStatus,
} from "./types";

const app = new Hono<{ Bindings: Env }>();

// ============================================================================
// Movie Discovery Endpoints (TMDB)
// ============================================================================

/**
 * GET /api/movies-on-demand/search
 * Search for movies by title
 */
app.get(
    "/search",
    withErrorHandling(
        async (c) => {
            const query = c.req.query("query");
            const pageParam = c.req.query("page");

            // Validate query
            const queryValidation = validateSearchQuery(query);
            if (!queryValidation.ok) {
                return c.json<ErrorResponse>(
                    {
                        error: queryValidation.error ?? "Invalid query",
                        code: "INVALID_INPUT",
                    },
                    400
                );
            }

            const page = validatePage(pageParam);
            const results = await tmdbSearchMovies(
                c.env.TMDB_API_KEY,
                query!,
                page
            );

            return c.json<MovieSearchResponse>(results, 200);
        },
        "/api/movies-on-demand/search",
        "GET"
    )
);

/**
 * GET /api/movies-on-demand/popular
 * Get popular movies
 */
app.get(
    "/popular",
    withErrorHandling(
        async (c) => {
            const pageParam = c.req.query("page");
            const page = validatePage(pageParam);

            const results = await tmdbGetPopular(c.env.TMDB_API_KEY, page);
            return c.json<MovieSearchResponse>(results, 200);
        },
        "/api/movies-on-demand/popular",
        "GET"
    )
);

/**
 * GET /api/movies-on-demand/top
 * Get top-rated movies of all time
 */
app.get(
    "/top",
    withErrorHandling(
        async (c) => {
            const pageParam = c.req.query("page");
            const page = validatePage(pageParam);

            const results = await tmdbGetTopRated(c.env.TMDB_API_KEY, page);
            return c.json<MovieSearchResponse>(results, 200);
        },
        "/api/movies-on-demand/top",
        "GET"
    )
);

/**
 * GET /api/movies-on-demand/movies/:id
 * Get movie details with job status
 */
app.get(
    "/movies/:id",
    withErrorHandling(
        async (c) => {
            const idParam = c.req.param("id");

            // Validate movie ID
            const idValidation = validateMovieId(idParam);
            if (!idValidation.ok) {
                return c.json<ErrorResponse>(
                    {
                        error: idValidation.error ?? "Invalid movie ID",
                        code: "INVALID_INPUT",
                    },
                    400
                );
            }

            const movieId = idValidation.id!;

            // Get movie details from TMDB
            const movieDetails = await tmdbGetMovieDetails(
                c.env.TMDB_API_KEY,
                movieId
            );

            // Check for active job in D1
            const job = (await c.env.MOVIES_D1.prepare(
                `SELECT * FROM jobs WHERE movie_id = ? ORDER BY created_at DESC LIMIT 1`
            )
                .bind(movieId)
                .first()) as JobRow | undefined;

            let jobStatus: MovieDetails["job_status"] = null;
            if (job) {
                jobStatus = {
                    job_id: job.job_id,
                    status: job.status,
                    progress: job.progress,
                    error_message: job.error_message,
                };
            }

            const response: MovieDetails = {
                ...movieDetails,
                job_status: jobStatus,
            };

            return c.json<MovieDetails>(response, 200);
        },
        "/api/movies-on-demand/movies/:id",
        "GET"
    )
);

/**
 * GET /api/movies-on-demand/movies/:id/similar
 * Get similar movies
 */
app.get(
    "/movies/:id/similar",
    withErrorHandling(
        async (c) => {
            const idParam = c.req.param("id");
            const pageParam = c.req.query("page");

            // Validate movie ID
            const idValidation = validateMovieId(idParam);
            if (!idValidation.ok) {
                return c.json<ErrorResponse>(
                    {
                        error: idValidation.error ?? "Invalid movie ID",
                        code: "INVALID_INPUT",
                    },
                    400
                );
            }

            const movieId = idValidation.id!;
            const page = validatePage(pageParam);

            const results = await tmdbGetSimilar(
                c.env.TMDB_API_KEY,
                movieId,
                page
            );
            return c.json<MovieSearchResponse>(results, 200);
        },
        "/api/movies-on-demand/movies/:id/similar",
        "GET"
    )
);

// ============================================================================
// Usenet Release Endpoints
// ============================================================================

/**
 * GET /api/movies-on-demand/movies/:id/releases
 * Get available Usenet releases for a movie
 */
app.get(
    "/movies/:id/releases",
    withErrorHandling(
        async (c) => {
            const idParam = c.req.param("id");

            // Validate movie ID
            const idValidation = validateMovieId(idParam);
            if (!idValidation.ok) {
                return c.json<ErrorResponse>(
                    {
                        error: idValidation.error ?? "Invalid movie ID",
                        code: "INVALID_INPUT",
                    },
                    400
                );
            }

            const movieId = idValidation.id!;

            // Get IMDb ID from TMDB
            const imdbId = await getMovieImdbId(c.env.TMDB_API_KEY, movieId);

            if (!imdbId) {
                // No IMDb ID, return empty releases list
                return c.json<ReleasesResponse>(
                    { releases: [], total: 0 },
                    200
                );
            }

            // Search NZBGeek for releases
            const releases = await searchReleases(
                c.env.NZBGEEK_API_KEY,
                imdbId
            );

            return c.json<ReleasesResponse>(
                { releases, total: releases.length },
                200
            );
        },
        "/api/movies-on-demand/movies/:id/releases",
        "GET"
    )
);

// ============================================================================
// Job Management Endpoints
// ============================================================================

/**
 * POST /api/movies-on-demand/movies/:id/fetch
 * Initiate movie acquisition from Usenet
 */
app.post(
    "/movies/:id/fetch",
    withErrorHandling(
        async (c) => {
            const idParam = c.req.param("id");

            // Validate movie ID
            const idValidation = validateMovieId(idParam);
            if (!idValidation.ok) {
                return c.json<ErrorResponse>(
                    {
                        error: idValidation.error ?? "Invalid movie ID",
                        code: "INVALID_INPUT",
                    },
                    400
                );
            }

            const movieId = idValidation.id!;

            // Parse request body
            const body = await c.req.json<FetchMovieRequest>();

            // Validate fetch mode
            const modeValidation = validateFetchMode(
                body.mode,
                body.release_id
            );
            if (!modeValidation.ok) {
                return c.json<ErrorResponse>(
                    {
                        error: modeValidation.error ?? "Invalid mode",
                        code: "INVALID_INPUT",
                    },
                    400
                );
            }

            // Validate quality preference if provided
            if (body.quality_preference) {
                const qualityValidation = validateQualityPreference(
                    body.quality_preference
                );
                if (!qualityValidation.ok) {
                    return c.json<ErrorResponse>(
                        {
                            error:
                                qualityValidation.error ??
                                "Invalid quality preference",
                            code: "INVALID_INPUT",
                        },
                        400
                    );
                }
            }

            // Check for existing active job for this movie
            const existingJob = (await c.env.MOVIES_D1.prepare(
                `SELECT job_id, status FROM jobs 
                 WHERE movie_id = ? AND status IN ('queued', 'downloading', 'preparing', 'ready') 
                 ORDER BY created_at DESC LIMIT 1`
            )
                .bind(movieId)
                .first()) as JobRow | undefined;

            if (existingJob) {
                // Return existing job
                return c.json<FetchMovieResponse>(
                    { job_id: existingJob.job_id, status: existingJob.status },
                    202
                );
            }

            // Get IMDb ID for release search
            const imdbId = await getMovieImdbId(c.env.TMDB_API_KEY, movieId);

            if (!imdbId) {
                return c.json<ErrorResponse>(
                    {
                        error: "Movie does not have IMDb ID, cannot search releases",
                        code: "NOT_FOUND",
                    },
                    404
                );
            }

            // Get releases from NZBGeek
            const releases = await searchReleases(
                c.env.NZBGEEK_API_KEY,
                imdbId
            );

            if (releases.length === 0) {
                return c.json<ErrorResponse>(
                    {
                        error: "No releases available for this movie",
                        code: "NOT_FOUND",
                    },
                    404
                );
            }

            // Select release based on mode
            let selectedRelease;
            if (body.mode === "manual") {
                selectedRelease = findReleaseById(releases, body.release_id!);
                if (!selectedRelease) {
                    return c.json<ErrorResponse>(
                        { error: "Release ID not found", code: "NOT_FOUND" },
                        404
                    );
                }
            } else {
                // Auto mode: select best release based on quality preference
                const preference = parseQualityPreference(
                    body.quality_preference
                );
                selectedRelease = selectBestRelease(releases, preference);
                if (!selectedRelease) {
                    return c.json<ErrorResponse>(
                        {
                            error: "No suitable release found",
                            code: "NOT_FOUND",
                        },
                        404
                    );
                }
            }

            // Generate job ID
            const jobId = generateJobId();
            const now = new Date().toISOString();

            // Create job record in D1
            await c.env.MOVIES_D1.prepare(
                `INSERT INTO jobs (job_id, movie_id, status, release_title, release_id, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`
            )
                .bind(
                    jobId,
                    movieId,
                    "queued" as JobStatus,
                    selectedRelease.title,
                    selectedRelease.id,
                    now,
                    now
                )
                .run();

            // Enqueue job to Cloudflare Queue for processing
            await c.env.MOVIES_QUEUE.send({
                job_id: jobId,
                movie_id: movieId,
                release_id: selectedRelease.id,
                nzb_url: selectedRelease.nzb_url,
                release_title: selectedRelease.title,
            });

            return c.json<FetchMovieResponse>(
                { job_id: jobId, status: "queued" },
                202
            );
        },
        "/api/movies-on-demand/movies/:id/fetch",
        "POST"
    )
);

/**
 * GET /api/movies-on-demand/jobs/:jobId
 * Get job status
 */
app.get(
    "/jobs/:jobId",
    withErrorHandling(
        async (c) => {
            const jobId = c.req.param("jobId");

            // Validate job ID
            const jobIdValidation = validateJobId(jobId);
            if (!jobIdValidation.ok) {
                return c.json<ErrorResponse>(
                    {
                        error: jobIdValidation.error ?? "Invalid job ID",
                        code: "INVALID_INPUT",
                    },
                    400
                );
            }

            // Query D1 for job details
            const job = (await c.env.MOVIES_D1.prepare(
                `SELECT * FROM jobs WHERE job_id = ?`
            )
                .bind(jobId)
                .first()) as JobRow | undefined;

            if (!job) {
                return c.json<ErrorResponse>(
                    { error: "Job not found", code: "NOT_FOUND" },
                    404
                );
            }

            const response: JobStatusResponse = {
                job_id: job.job_id,
                movie_id: job.movie_id,
                status: job.status,
                progress: job.progress,
                error_message: job.error_message,
                release_title: job.release_title,
                created_at: job.created_at,
                updated_at: job.updated_at,
                ready_at: job.ready_at,
                expires_at: job.expires_at,
                last_watched_at: job.last_watched_at,
            };

            return c.json<JobStatusResponse>(response, 200);
        },
        "/api/movies-on-demand/jobs/:jobId",
        "GET"
    )
);

/**
 * GET /api/movies-on-demand/jobs
 * List active jobs
 */
app.get(
    "/jobs",
    withErrorHandling(
        async (c) => {
            const statusParam = c.req.query("status");

            // Validate status if provided
            const validStatuses = [
                "queued",
                "downloading",
                "preparing",
                "ready",
                "error",
            ];
            if (statusParam && !validStatuses.includes(statusParam)) {
                return c.json<ErrorResponse>(
                    { error: "Invalid status filter", code: "INVALID_INPUT" },
                    400
                );
            }

            let jobs: JobRow[];

            if (statusParam) {
                // Filter by specific status
                const result = await c.env.MOVIES_D1.prepare(
                    `SELECT * FROM jobs WHERE status = ? ORDER BY updated_at DESC LIMIT 50`
                )
                    .bind(statusParam)
                    .all();
                jobs = (result.results ?? []) as JobRow[];
            } else {
                // Get all active jobs (exclude deleted)
                const result = await c.env.MOVIES_D1.prepare(
                    `SELECT * FROM jobs WHERE status IN ('queued', 'downloading', 'preparing', 'ready', 'error') 
                     ORDER BY updated_at DESC LIMIT 50`
                ).all();
                jobs = (result.results ?? []) as JobRow[];
            }

            const response: JobsListResponse = {
                jobs: jobs.map((job) => ({
                    job_id: job.job_id,
                    movie_id: job.movie_id,
                    status: job.status,
                    progress: job.progress,
                    error_message: job.error_message,
                    release_title: job.release_title,
                    created_at: job.created_at,
                    updated_at: job.updated_at,
                    ready_at: job.ready_at,
                    expires_at: job.expires_at,
                    last_watched_at: job.last_watched_at,
                })),
            };

            return c.json<JobsListResponse>(response, 200);
        },
        "/api/movies-on-demand/jobs",
        "GET"
    )
);

// ============================================================================
// Streaming Endpoints
// ============================================================================

/**
 * GET /api/movies-on-demand/movies/:id/stream
 * Get movie stream URL
 */
app.get(
    "/movies/:id/stream",
    withErrorHandling(
        async (c) => {
            const idParam = c.req.param("id");

            let job: JobRow | null = null;

            // Determine if ID is job_id or movie_id
            if (idParam.startsWith("job_")) {
                // It's a job ID
                job = (await c.env.MOVIES_D1.prepare(
                    `SELECT * FROM jobs WHERE job_id = ?`
                )
                    .bind(idParam)
                    .first()) as JobRow | null;
            } else {
                // It's a movie ID - get latest job
                const movieIdValidation = validateMovieId(idParam);
                if (!movieIdValidation.ok) {
                    return c.json<ErrorResponse>(
                        {
                            error:
                                movieIdValidation.error ?? "Invalid movie ID",
                            code: "INVALID_INPUT",
                        },
                        400
                    );
                }

                job = (await c.env.MOVIES_D1.prepare(
                    `SELECT * FROM jobs WHERE movie_id = ? ORDER BY created_at DESC LIMIT 1`
                )
                    .bind(movieIdValidation.id!)
                    .first()) as JobRow | null;
            }

            if (!job) {
                return c.json<ErrorResponse>(
                    { error: "Job not found", code: "NOT_FOUND" },
                    404
                );
            }

            // Verify job status is "ready"
            if (job.status !== "ready") {
                return c.json<ErrorResponse>(
                    {
                        error: `Movie not ready for streaming. Current status: ${job.status}`,
                        code: "INVALID_INPUT",
                    },
                    400
                );
            }

            // Update last_watched_at
            const now = new Date().toISOString();
            await c.env.MOVIES_D1.prepare(
                `UPDATE jobs SET last_watched_at = ?, updated_at = ? WHERE job_id = ?`
            )
                .bind(now, now, job.job_id)
                .run();

            // Get movie file metadata from R2
            const r2Key = `movies/${job.job_id}/movie.mp4`;
            const object = await c.env.MOVIES_R2.head(r2Key);

            if (!object) {
                return c.json<ErrorResponse>(
                    {
                        error: "Movie file not found in storage",
                        code: "STORAGE_ERROR",
                    },
                    502
                );
            }

            // Generate presigned URL for streaming (4 hour expiration)
            // Note: R2 presigned URLs require using the S3 API compatibility
            // For simplicity, we'll return a direct path that can be served via Worker
            const streamUrl = `/api/movies-on-demand/stream/${job.job_id}`;

            const response: StreamResponse = {
                stream_url: streamUrl,
                content_type: object.httpMetadata?.contentType ?? "video/mp4",
                file_size: object.size,
            };

            return c.json<StreamResponse>(response, 200);
        },
        "/api/movies-on-demand/movies/:id/stream",
        "GET"
    )
);

/**
 * GET /api/movies-on-demand/stream/:jobId
 * Direct video stream endpoint (serves video from R2)
 */
app.get(
    "/stream/:jobId",
    withErrorHandling(
        async (c) => {
            const jobId = c.req.param("jobId");

            // Validate job ID
            const jobIdValidation = validateJobId(jobId);
            if (!jobIdValidation.ok) {
                return c.json<ErrorResponse>(
                    {
                        error: jobIdValidation.error ?? "Invalid job ID",
                        code: "INVALID_INPUT",
                    },
                    400
                );
            }

            // Verify job exists and is ready
            const job = (await c.env.MOVIES_D1.prepare(
                `SELECT * FROM jobs WHERE job_id = ? AND status = 'ready'`
            )
                .bind(jobId)
                .first()) as JobRow | undefined;

            if (!job) {
                return c.json<ErrorResponse>(
                    {
                        error: "Movie not found or not ready",
                        code: "NOT_FOUND",
                    },
                    404
                );
            }

            // Get video from R2
            const r2Key = `movies/${jobId}/movie.mp4`;
            const object = await c.env.MOVIES_R2.get(r2Key);

            if (!object) {
                return c.json<ErrorResponse>(
                    {
                        error: "Movie file not found in storage",
                        code: "STORAGE_ERROR",
                    },
                    502
                );
            }

            // Handle Range requests for video seeking
            const rangeHeader = c.req.header("Range");
            const contentType = object.httpMetadata?.contentType ?? "video/mp4";
            const fileSize = object.size;

            if (rangeHeader) {
                // Parse range header
                const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
                if (match) {
                    const start = parseInt(match[1], 10);
                    const end = match[2]
                        ? parseInt(match[2], 10)
                        : fileSize - 1;
                    const contentLength = end - start + 1;

                    // Get partial content from R2
                    const partialObject = await c.env.MOVIES_R2.get(r2Key, {
                        range: { offset: start, length: contentLength },
                    });

                    if (!partialObject) {
                        return c.json<ErrorResponse>(
                            {
                                error: "Failed to read video range",
                                code: "STORAGE_ERROR",
                            },
                            502
                        );
                    }

                    return new Response(partialObject.body, {
                        status: 206,
                        headers: {
                            "Content-Type": contentType,
                            "Content-Length": contentLength.toString(),
                            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                            "Accept-Ranges": "bytes",
                        },
                    });
                }
            }

            // Return full file if no range requested
            return new Response(object.body, {
                status: 200,
                headers: {
                    "Content-Type": contentType,
                    "Content-Length": fileSize.toString(),
                    "Accept-Ranges": "bytes",
                },
            });
        },
        "/api/movies-on-demand/stream/:jobId",
        "GET"
    )
);

// ============================================================================
// Watch History Endpoints
// ============================================================================

/**
 * GET /api/movies-on-demand/history
 * Get watch history
 */
app.get(
    "/history",
    withErrorHandling(
        async (c) => {
            const limitParam = c.req.query("limit");
            const offsetParam = c.req.query("offset");

            // Validate pagination parameters
            const limitValidation = validateLimit(limitParam, 20, 100);
            const offsetValidation = validateOffset(offsetParam, 0);

            const limit = limitValidation.limit;
            const offset = offsetValidation.offset;

            // Query watch history from D1
            const result = await c.env.MOVIES_D1.prepare(
                `SELECT * FROM watch_history ORDER BY last_watched_at DESC LIMIT ? OFFSET ?`
            )
                .bind(limit, offset)
                .all();

            // Get total count
            const countResult = (await c.env.MOVIES_D1.prepare(
                `SELECT COUNT(*) as count FROM watch_history`
            ).first()) as { count: number } | undefined;

            const movies = ((result.results ?? []) as WatchHistoryRow[]).map(
                (row) => ({
                    movie_id: row.movie_id,
                    title: row.title ?? "",
                    poster_path: row.poster_path,
                    last_watched_at: row.last_watched_at,
                    job_id: row.job_id,
                    status: row.status,
                })
            );

            const response: WatchHistoryResponse = {
                movies,
                total: countResult?.count ?? 0,
            };

            return c.json<WatchHistoryResponse>(response, 200);
        },
        "/api/movies-on-demand/history",
        "GET"
    )
);

// ============================================================================
// Internal Endpoints (Container Callbacks)
// ============================================================================

/**
 * POST /api/movies-on-demand/internal/progress
 * Internal endpoint for Container to report job progress
 * Protected by Cloudflare Zero Trust (Access policies configured externally)
 */
app.post(
    "/internal/progress",
    withErrorHandling(
        async (c) => {
            // Log incoming request for debugging
            console.log(
                `[internal/progress] Received callback request from ${
                    c.req.header("CF-Connecting-IP") || "unknown"
                }`
            );

            // Parse request body
            const body = await c.req.json<{
                job_id: string;
                status: JobStatus;
                progress?: number | null;
                error_message?: string | null;
            }>();

            console.log(
                `[internal/progress] Processing callback for job ${body.job_id} with status ${body.status}`
            );

            // Validate required fields
            if (!body.job_id || !body.status) {
                return c.json<ErrorResponse>(
                    {
                        error: "Missing required fields: job_id, status",
                        code: "INVALID_INPUT",
                    },
                    400
                );
            }

            // Validate status
            const validStatuses: JobStatus[] = [
                "queued",
                "downloading",
                "preparing",
                "ready",
                "error",
                "deleted",
            ];
            if (!validStatuses.includes(body.status)) {
                return c.json<ErrorResponse>(
                    { error: "Invalid status", code: "INVALID_INPUT" },
                    400
                );
            }

            // Verify job exists
            const existingJob = (await c.env.MOVIES_D1.prepare(
                `SELECT job_id, status FROM jobs WHERE job_id = ?`
            )
                .bind(body.job_id)
                .first()) as JobRow | undefined;

            if (!existingJob) {
                return c.json<ErrorResponse>(
                    { error: "Job not found", code: "NOT_FOUND" },
                    404
                );
            }

            const now = new Date().toISOString();

            // Build update query based on status
            if (body.status === "ready") {
                // Set ready_at and expires_at (24 hours from now)
                const expiresAt = new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                ).toISOString();

                await c.env.MOVIES_D1.prepare(
                    `UPDATE jobs 
                     SET status = ?, progress = ?, error_message = ?, ready_at = ?, expires_at = ?, updated_at = ?
                     WHERE job_id = ?`
                )
                    .bind(
                        body.status,
                        body.progress ?? 100,
                        body.error_message ?? null,
                        now,
                        expiresAt,
                        now,
                        body.job_id
                    )
                    .run();
            } else if (body.status === "error") {
                await c.env.MOVIES_D1.prepare(
                    `UPDATE jobs 
                     SET status = ?, progress = ?, error_message = ?, updated_at = ?
                     WHERE job_id = ?`
                )
                    .bind(
                        body.status,
                        body.progress ?? null,
                        body.error_message ?? "Unknown error",
                        now,
                        body.job_id
                    )
                    .run();
            } else {
                // Normal progress update
                await c.env.MOVIES_D1.prepare(
                    `UPDATE jobs 
                     SET status = ?, progress = ?, updated_at = ?
                     WHERE job_id = ?`
                )
                    .bind(body.status, body.progress ?? null, now, body.job_id)
                    .run();
            }

            return c.json({ success: true }, 200);
        },
        "/api/movies-on-demand/internal/progress",
        "POST"
    )
);

export default app;
