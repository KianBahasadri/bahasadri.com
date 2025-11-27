/**
 * Job Management Routes
 * Handles job creation, status queries, and job listing
 */

import { Hono } from "hono";
import type { Env } from "../../types/env";
import { withErrorHandling } from "../../lib/error-handling";
import {
    validateMovieId,
    validateFetchMode,
    validateQualityPreference,
    validateJobId,
    parseQualityPreference,
    generateJobId,
} from "../lib/validation";
import { getMovieImdbId } from "../lib/tmdb";
import {
    searchReleases,
    selectBestRelease,
    findReleaseById,
} from "../lib/nzbgeek";
import type {
    ErrorResponse,
    FetchMovieRequest,
    FetchMovieResponse,
    JobStatusResponse,
    JobsListResponse,
    JobRow,
    JobStatus,
    UsenetRelease,
} from "../types";

const app = new Hono<{ Bindings: Env }>();

/**
 * POST /api/movies-on-demand/movies/:id/fetch
 * Initiate movie acquisition from Usenet
 */
app.post(
    "/movies/:id/fetch",
    withErrorHandling(
        async (c) => {
            const endpoint = "/api/movies-on-demand/movies/:id/fetch";
            const idParam = c.req.param("id");

            // Log request start
            console.error(
                JSON.stringify({
                    timestamp: new Date().toISOString(),
                    endpoint,
                    method: "POST",
                    level: "info",
                    message: "Fetch movie request received",
                    movie_id_param: idParam,
                })
            );

            // Validate movie ID
            const idValidation = validateMovieId(idParam);
            if (!idValidation.ok) {
                console.error(
                    JSON.stringify({
                        timestamp: new Date().toISOString(),
                        endpoint,
                        method: "POST",
                        level: "warn",
                        message: "Invalid movie ID",
                        movie_id_param: idParam,
                        validation_error: idValidation.error,
                    })
                );
                return c.json<ErrorResponse>(
                    {
                        error: idValidation.error ?? "Invalid movie ID",
                        code: "INVALID_INPUT",
                    },
                    400
                );
            }

            const movieId = idValidation.id;
            if (!movieId) {
                return c.json<ErrorResponse>(
                    {
                        error: "Invalid movie ID",
                        code: "INVALID_INPUT",
                    },
                    400
                );
            }

            // Parse request body with error handling
            let body: FetchMovieRequest;
            try {
                body = await c.req.json<FetchMovieRequest>();
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                console.error(
                    JSON.stringify({
                        timestamp: new Date().toISOString(),
                        endpoint,
                        method: "POST",
                        level: "error",
                        message: "Failed to parse request body",
                        movie_id: movieId,
                        error: errorMessage,
                    })
                );
                return c.json<ErrorResponse>(
                    {
                        error: "Invalid request body format",
                        code: "INVALID_INPUT",
                    },
                    400
                );
            }

            // Validate fetch mode
            const modeValidation = validateFetchMode(
                body.mode,
                body.release_id
            );
            if (!modeValidation.ok) {
                console.error(
                    JSON.stringify({
                        timestamp: new Date().toISOString(),
                        endpoint,
                        method: "POST",
                        level: "warn",
                        message: "Invalid fetch mode",
                        movie_id: movieId,
                        mode: body.mode,
                        release_id: body.release_id,
                        validation_error: modeValidation.error,
                    })
                );
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
                    console.error(
                        JSON.stringify({
                            timestamp: new Date().toISOString(),
                            endpoint,
                            method: "POST",
                            level: "warn",
                            message: "Invalid quality preference",
                            movie_id: movieId,
                            quality_preference: body.quality_preference,
                            validation_error: qualityValidation.error,
                        })
                    );
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
            let existingJob: JobRow | undefined;
            try {
                const existingJobResult = await c.env.MOVIES_D1.prepare(
                    `SELECT job_id, status FROM jobs 
                     WHERE movie_id = ? AND status IN ('queued', 'downloading', 'preparing', 'ready') 
                     ORDER BY created_at DESC LIMIT 1`
                )
                    .bind(Number(movieId))
                    .first();
                existingJob = existingJobResult as JobRow | undefined;
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                console.error(
                    JSON.stringify({
                        timestamp: new Date().toISOString(),
                        endpoint,
                        method: "POST",
                        level: "error",
                        message: "Failed to query existing job from D1",
                        movie_id: movieId,
                        error: errorMessage,
                    })
                );
                return c.json<ErrorResponse>(
                    {
                        error: "Database error while checking existing jobs",
                        code: "INTERNAL_ERROR",
                    },
                    500
                );
            }

            if (existingJob) {
                console.error(
                    JSON.stringify({
                        timestamp: new Date().toISOString(),
                        endpoint,
                        method: "POST",
                        level: "info",
                        message: "Existing active job found, returning it",
                        movie_id: movieId,
                        job_id: existingJob.job_id,
                        status: existingJob.status,
                    })
                );
                return c.json<FetchMovieResponse>(
                    { job_id: existingJob.job_id, status: existingJob.status },
                    202
                );
            }

            // Get IMDb ID for release search
            let imdbId: string | undefined;
            try {
                imdbId = await getMovieImdbId(c.env.TMDB_API_KEY, movieId);
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                console.error(
                    JSON.stringify({
                        timestamp: new Date().toISOString(),
                        endpoint,
                        method: "POST",
                        level: "error",
                        message: "Failed to get IMDb ID from TMDB",
                        movie_id: movieId,
                        error: errorMessage,
                    })
                );
                return c.json<ErrorResponse>(
                    {
                        error: "Failed to retrieve movie information",
                        code: "INTERNAL_ERROR",
                    },
                    502
                );
            }

            if (!imdbId) {
                console.error(
                    JSON.stringify({
                        timestamp: new Date().toISOString(),
                        endpoint,
                        method: "POST",
                        level: "warn",
                        message: "Movie does not have IMDb ID",
                        movie_id: movieId,
                    })
                );
                return c.json<ErrorResponse>(
                    {
                        error: "Movie does not have IMDb ID, cannot search releases",
                        code: "NOT_FOUND",
                    },
                    404
                );
            }

            // Get releases from NZBGeek
            let releases: UsenetRelease[];
            try {
                releases = await searchReleases(c.env.NZBGEEK_API_KEY, String(imdbId));
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                console.error(
                    JSON.stringify({
                        timestamp: new Date().toISOString(),
                        endpoint,
                        method: "POST",
                        level: "error",
                        message: "Failed to search releases from NZBGeek",
                        movie_id: movieId,
                        imdb_id: imdbId,
                        error: errorMessage,
                    })
                );
                return c.json<ErrorResponse>(
                    {
                        error: "Failed to search for releases",
                        code: "INTERNAL_ERROR",
                    },
                    502
                );
            }

            if (releases.length === 0) {
                console.error(
                    JSON.stringify({
                        timestamp: new Date().toISOString(),
                        endpoint,
                        method: "POST",
                        level: "warn",
                        message: "No releases found for movie",
                        movie_id: movieId,
                        imdb_id: imdbId,
                    })
                );
                return c.json<ErrorResponse>(
                    {
                        error: "No releases available for this movie",
                        code: "NOT_FOUND",
                    },
                    404
                );
            }

            // Select release based on mode
            let selectedRelease: UsenetRelease | undefined;
            if (body.mode === "manual") {
                const releaseId = body.release_id;
                if (!releaseId) {
                    return c.json<ErrorResponse>(
                        {
                            error: "Release ID required for manual mode",
                            code: "INVALID_INPUT",
                        },
                        400
                    );
                }
                selectedRelease = findReleaseById(releases, String(releaseId));
                if (!selectedRelease) {
                    console.error(
                        JSON.stringify({
                            timestamp: new Date().toISOString(),
                            endpoint,
                            method: "POST",
                            level: "warn",
                            message: "Release ID not found in search results",
                            movie_id: movieId,
                            release_id: releaseId,
                            total_releases: releases.length,
                        })
                    );
                    return c.json<ErrorResponse>(
                        { error: "Release ID not found", code: "NOT_FOUND" },
                        404
                    );
                }
                console.error(
                    JSON.stringify({
                        timestamp: new Date().toISOString(),
                        endpoint,
                        method: "POST",
                        level: "info",
                        message: "Manual release selected",
                        movie_id: movieId,
                        release_id: selectedRelease.id,
                        release_title: selectedRelease.title,
                    })
                );
            } else {
                // Auto mode: select best release based on quality preference
                const preference = parseQualityPreference(
                    body.quality_preference
                );
                selectedRelease = selectBestRelease(releases, preference);
                if (!selectedRelease) {
                    console.error(
                        JSON.stringify({
                            timestamp: new Date().toISOString(),
                            endpoint,
                            method: "POST",
                            level: "warn",
                            message: "No suitable release found for auto mode",
                            movie_id: movieId,
                            quality_preference: body.quality_preference,
                            total_releases: releases.length,
                        })
                    );
                    return c.json<ErrorResponse>(
                        {
                            error: "No suitable release found",
                            code: "NOT_FOUND",
                        },
                        404
                    );
                }
                console.error(
                    JSON.stringify({
                        timestamp: new Date().toISOString(),
                        endpoint,
                        method: "POST",
                        level: "info",
                        message: "Auto release selected",
                        movie_id: movieId,
                        release_id: selectedRelease.id,
                        release_title: selectedRelease.title,
                        quality_preference: body.quality_preference,
                    })
                );
            }

            // Generate job ID
            const jobId = generateJobId();
            const now = new Date().toISOString();

            if (!selectedRelease) {
                return c.json<ErrorResponse>(
                    {
                        error: "No release selected",
                        code: "INTERNAL_ERROR",
                    },
                    500
                );
            }

            // Create job record in D1
            try {
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
                console.error(
                    JSON.stringify({
                        timestamp: new Date().toISOString(),
                        endpoint,
                        method: "POST",
                        level: "info",
                        message: "Job record created in D1",
                        movie_id: movieId,
                        job_id: jobId,
                        release_id: selectedRelease.id,
                    })
                );
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                console.error(
                    JSON.stringify({
                        timestamp: new Date().toISOString(),
                        endpoint,
                        method: "POST",
                        level: "error",
                        message: "Failed to create job record in D1",
                        movie_id: movieId,
                        job_id: jobId,
                        release_id: selectedRelease.id,
                        error: errorMessage,
                    })
                );
                return c.json<ErrorResponse>(
                    {
                        error: "Failed to create job record",
                        code: "INTERNAL_ERROR",
                    },
                    500
                );
            }

            // Enqueue job to Cloudflare Queue for processing
            try {
                await c.env.MOVIES_QUEUE.send({
                    job_id: jobId,
                    movie_id: movieId,
                    release_id: selectedRelease.id,
                    nzb_url: selectedRelease.nzb_url,
                    release_title: selectedRelease.title,
                });
                console.error(
                    JSON.stringify({
                        timestamp: new Date().toISOString(),
                        endpoint,
                        method: "POST",
                        level: "info",
                        message: "Job enqueued successfully",
                        movie_id: movieId,
                        job_id: jobId,
                        release_id: selectedRelease.id,
                    })
                );
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                console.error(
                    JSON.stringify({
                        timestamp: new Date().toISOString(),
                        endpoint,
                        method: "POST",
                        level: "error",
                        message: "Failed to enqueue job to queue",
                        movie_id: movieId,
                        job_id: jobId,
                        release_id: selectedRelease.id,
                        error: errorMessage,
                    })
                );
                // Try to clean up the job record if queue send fails
                try {
                    await c.env.MOVIES_D1.prepare(
                        `UPDATE jobs SET status = 'error', error_message = ?, updated_at = ? WHERE job_id = ?`
                    )
                        .bind(
                            "Failed to enqueue job",
                            new Date().toISOString(),
                            jobId
                        )
                        .run();
                } catch (cleanupError) {
                    const cleanupErrorMessage =
                        cleanupError instanceof Error
                            ? cleanupError.message
                            : String(cleanupError);
                    console.error(
                        JSON.stringify({
                            timestamp: new Date().toISOString(),
                            endpoint,
                            method: "POST",
                            level: "error",
                            message:
                                "Failed to update job status after queue send failure",
                            movie_id: movieId,
                            job_id: jobId,
                            error: cleanupErrorMessage,
                        })
                    );
                }
                return c.json<ErrorResponse>(
                    {
                        error: "Failed to enqueue job for processing",
                        code: "INTERNAL_ERROR",
                    },
                    500
                );
            }

            console.error(
                JSON.stringify({
                    timestamp: new Date().toISOString(),
                    endpoint,
                    method: "POST",
                    level: "info",
                    message: "Fetch movie request completed successfully",
                    movie_id: movieId,
                    job_id: jobId,
                    status: "queued",
                })
            );

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
            const jobResult = await c.env.MOVIES_D1.prepare(
                `SELECT * FROM jobs WHERE job_id = ?`
            )
                .bind(jobId)
                .first();
            const job = jobResult as JobRow | undefined;

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
                const results = result.results ?? [];
                jobs = results as JobRow[];
            } else {
                // Get all active jobs (exclude deleted)
                const result = await c.env.MOVIES_D1.prepare(
                    `SELECT * FROM jobs WHERE status IN ('queued', 'downloading', 'preparing', 'ready', 'error') 
                     ORDER BY updated_at DESC LIMIT 50`
                ).all();
                const results = result.results ?? [];
                jobs = results as JobRow[];
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

export default app;

