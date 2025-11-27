/**
 * Streaming Routes
 * Handles movie streaming endpoints
 */

import { Hono } from "hono";
import type { Env } from "../../types/env";
import { withErrorHandling } from "../../lib/error-handling";
import { validateMovieId, validateJobId } from "../lib/validation";
import type {
    ErrorResponse,
    StreamResponse,
    JobRow,
} from "../types";

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

export default app;

