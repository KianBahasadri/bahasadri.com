/**
 * Streaming Routes
 * Handles movie streaming endpoints
 */

import { Hono } from "hono";
import type { Env } from "../../types/env";
import { withErrorHandling } from "../../lib/error-handling";
import { validateMovieId, validateJobId } from "../lib/validation";
import type { ErrorResponse, StreamResponse, JobRow } from "../types";

const app = new Hono<{ Bindings: Env }>();

/**
 * GET /api/movies-on-demand/movies/:id/stream
 * Get movie stream URL
 */
app.get(
    "/movies/:id/stream",
    withErrorHandling(
        async (c) => {
            const idParam = c.req.param("id");
            const logStreamBadRequest = (message: string) => {
                console.warn(
                    `[movies-on-demand] GET /api/movies-on-demand/movies/${idParam}/stream 400 Bad Request - ${message}`
                );
            };

            let job: JobRow | undefined;

            // Determine if ID is job_id or movie_id
            if (idParam.startsWith("job_")) {
                // It's a job ID
                // D1.prepare().bind().first() is typed as any, cast through unknown to break any chain
                const jobResult = await (c.env.MOVIES_D1.prepare(
                    `SELECT * FROM jobs WHERE job_id = ?`
                )
                    .bind(idParam)
                    .first() as unknown as Promise<JobRow | null>);
                job = jobResult ?? undefined;
            } else {
                // It's a movie ID - get latest job
                const movieIdValidation = validateMovieId(idParam);
                if (!movieIdValidation.ok) {
                    const reason =
                        movieIdValidation.error ?? "Invalid movie ID";
                    logStreamBadRequest(reason);
                    return c.json<ErrorResponse>(
                        { error: reason, code: "INVALID_INPUT" },
                        400
                    );
                }

                const movieId = movieIdValidation.id;
                if (!movieId) {
                    logStreamBadRequest(
                        "Invalid movie ID (missing after validation)"
                    );
                    return c.json<ErrorResponse>(
                        {
                            error: "Invalid movie ID",
                            code: "INVALID_INPUT",
                        },
                        400
                    );
                }

                // D1.prepare().bind().first() is typed as any, cast through unknown to break any chain
                const jobResult = await (c.env.MOVIES_D1.prepare(
                    `SELECT * FROM jobs WHERE movie_id = ? ORDER BY created_at DESC LIMIT 1`
                )
                    .bind(movieId)
                    .first() as unknown as Promise<JobRow | null>);
                job = jobResult ?? undefined;
            }

            if (!job) {
                return c.json<ErrorResponse>(
                    { error: "Job not found", code: "NOT_FOUND" },
                    404
                );
            }

            // Verify job status is "ready"
            if (job.status !== "ready") {
                logStreamBadRequest(
                    `Movie not ready for streaming. Current status: ${job.status} (job_id=${job.job_id})`
                );
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
            // D1.prepare().bind().run() is typed as any, cast through unknown to break any chain
            await (c.env.MOVIES_D1.prepare(
                `UPDATE jobs SET last_watched_at = ?, updated_at = ? WHERE job_id = ?`
            )
                .bind(now, now, job.job_id)
                .run() as unknown as Promise<{ success: boolean }>);

            // Get movie file metadata from R2
            // Use r2_key from database if available, otherwise fall back to default path
            const r2Key = job.r2_key ?? `movies/${job.job_id}/movie.mp4`;
            // R2.head is typed as any, cast through unknown to break any chain
            const object = await (c.env.MOVIES_R2.head(
                r2Key
            ) as unknown as Promise<{
                size: number;
                httpMetadata: { contentType?: string } | null;
            } | null>);

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
            // D1.prepare().bind().first() is typed as any, cast through unknown to break any chain
            const jobResult = await (c.env.MOVIES_D1.prepare(
                `SELECT * FROM jobs WHERE job_id = ? AND status = 'ready'`
            )
                .bind(jobId)
                .first() as unknown as Promise<JobRow | null>);
            const job = jobResult as JobRow | undefined;

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
            // Use r2_key from database if available, otherwise fall back to default path
            const r2Key = job.r2_key ?? `movies/${jobId}/movie.mp4`;
            // R2.get is typed as any, cast through unknown to break any chain
            const object = await (c.env.MOVIES_R2.get(
                r2Key
            ) as unknown as Promise<{
                body: ReadableStream;
                size: number;
                httpMetadata: { contentType?: string } | null;
            } | null>);

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
                const rangeRegex = /bytes=(\d+)-(\d*)/;
                const match = rangeRegex.exec(rangeHeader);
                if (match) {
                    const start = Number.parseInt(match[1], 10);
                    const end = match[2]
                        ? Number.parseInt(match[2], 10)
                        : fileSize - 1;
                    const contentLength = end - start + 1;

                    // Get partial content from R2
                    // R2.get with range is typed as any, cast through unknown to break any chain
                    const partialObject = await (c.env.MOVIES_R2.get(r2Key, {
                        range: { offset: start, length: contentLength },
                    }) as unknown as Promise<{
                        body: ReadableStream;
                    } | null>);

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
                            "Content-Length": String(contentLength),
                            "Content-Range": `bytes ${String(start)}-${String(
                                end
                            )}/${String(fileSize)}`,
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
                    "Content-Length": String(fileSize),
                    "Accept-Ranges": "bytes",
                },
            });
        },
        "/api/movies-on-demand/stream/:jobId",
        "GET"
    )
);

export default app;
