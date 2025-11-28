/**
 * Internal Routes (Container Callbacks)
 * Handles internal endpoints for container callbacks
 */

import { Hono } from "hono";
import type { Env } from "../../types/env";
import { withErrorHandling } from "../../lib/error-handling";
import type { ErrorResponse, JobRow, JobStatus } from "../types";

const app = new Hono<{ Bindings: Env }>();

/**
 * POST /api/movies-on-demand/internal/progress
 * Internal endpoint for Container to report job progress
 * Protected by Cloudflare Zero Trust (Access policies configured externally)
 */
app.post(
    "/progress",
    withErrorHandling(
        async (c) => {
            // Log incoming request for debugging
            const ip = c.req.header("CF-Connecting-IP") ?? "unknown";
            console.log(
                JSON.stringify({
                    timestamp: new Date().toISOString(),
                    endpoint: "/api/movies-on-demand/internal/progress",
                    method: "POST",
                    level: "info",
                    message: "Received callback request",
                    ip,
                })
            );

            // Parse request body
            const body = await c.req.json<{
                job_id: string;
                status: JobStatus;
                progress?: number | null;
                error_message?: string | null;
            }>();

            // Log the complete request body for debugging
            console.log(
                JSON.stringify({
                    timestamp: new Date().toISOString(),
                    endpoint: "/api/movies-on-demand/internal/progress",
                    method: "POST",
                    level: "info",
                    message: "Received callback data",
                    request_body: {
                        job_id: body.job_id,
                        status: body.status,
                        progress: body.progress,
                        error_message: body.error_message,
                    },
                })
            );

            // Validate required fields
            // body.job_id and body.status are typed as string | undefined from Hono
            if (body.job_id === undefined || body.status === undefined) {
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
                "starting",
                "downloading",
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
            // D1.prepare().bind().first() returns any, but we know the structure
            const existingJobRaw = await (c.env.MOVIES_D1.prepare(
                `SELECT job_id, status FROM jobs WHERE job_id = ?`
            )
                .bind(body.job_id)
                .first() as Promise<{ job_id: string; status: string } | null>);
            const existingJob = existingJobRaw as JobRow | undefined;

            if (!existingJob) {
                console.error(
                    JSON.stringify({
                        timestamp: new Date().toISOString(),
                        endpoint: "/api/movies-on-demand/internal/progress",
                        method: "POST",
                        level: "error",
                        message: "Job not found in database",
                        job_id: body.job_id,
                        status: body.status,
                    })
                );
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

            return c.json<{ success: boolean }>({ success: true }, 200);
        },
        "/api/movies-on-demand/internal/progress",
        "POST"
    )
);

export default app;
