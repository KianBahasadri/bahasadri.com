/**
 * Movies on Demand - Container Class and Queue Consumer
 *
 * This module exports:
 * 1. MovieDownloaderContainer - Cloudflare Container class for NZBGet
 * 2. Queue handler for processing movie download jobs
 */

import { Container } from "@cloudflare/containers";
import type { MessageBatch } from "@cloudflare/workers-types";
import type { Env } from "../types/env";
import type { JobQueueMessage } from "./types";

// ============================================================================
// Container Class Definition
// ============================================================================

/**
 * MovieDownloaderContainer extends the Cloudflare Container class.
 * It runs NZBGet with a Node.js wrapper to download movies from Usenet.
 *
 * The container is started with manualStart=true so we can pass job-specific
 * environment variables when processing each queue message.
 */
export class MovieDownloaderContainer extends Container<Env> {
    // Container can run for up to 5 minutes for downloads
    sleepAfter = "5m";

    // Don't auto-start - we start manually with job-specific env vars
    manualStart = true;

    /**
     * Start the container with job-specific environment variables.
     * This is called from the queue handler via Durable Object RPC.
     */
    async startWithEnvVars(envVars: Record<string, string>): Promise<void> {
        // Use the public start() method from the Container class
        await this.start({
            envVars,
        });
    }
}

// ============================================================================
// Queue Consumer Handler
// ============================================================================

/**
 * Process a batch of movie download jobs from the queue.
 * Each message triggers a new container instance to download the movie.
 */
export async function handleMovieQueue(
    batch: MessageBatch<JobQueueMessage>,
    env: Env
): Promise<void> {
    for (const message of batch.messages) {
        const job = message.body;

        console.log(
            `Processing job: ${job.job_id} for movie: ${String(job.movie_id)}`
        );

        try {
            // Get a unique container instance for this job using the job_id as identifier
            const containerId = env.MOVIE_DOWNLOADER.idFromName(job.job_id);
            const containerStub = env.MOVIE_DOWNLOADER.get(containerId);

            // Detect dev mode (local development) - for connection count adjustment
            const isDev = env.ENVIRONMENT === "development";

            // Build environment variables for the container
            const envVars: Record<string, string> = {
                // Job details
                JOB_ID: job.job_id,
                MOVIE_ID: String(job.movie_id),
                NZB_URL: job.nzb_url,
                RELEASE_TITLE: job.release_title,

                // Worker callback for progress updates (hardcoded to production)
                CF_ACCESS_CLIENT_ID: env.CONTAINER_SERVICE_TOKEN_ID,
                CF_ACCESS_CLIENT_SECRET: env.CONTAINER_SERVICE_TOKEN_SECRET,

                // Usenet server credentials
                USENET_HOST: env.USENET_HOST,
                USENET_PORT: env.USENET_PORT || "563",
                USENET_USERNAME: env.USENET_USERNAME,
                USENET_PASSWORD: env.USENET_PASSWORD,
                // Use fewer connections in dev mode to reduce resource usage
                USENET_CONNECTIONS: isDev
                    ? "5"
                    : env.USENET_CONNECTIONS || "40",
                USENET_ENCRYPTION: env.USENET_ENCRYPTION || "true",

                // R2 credentials for upload
                R2_ACCOUNT_ID: env.CLOUDFLARE_ACCOUNT_ID,
                R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
                R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
                R2_BUCKET_NAME: "movies-on-demand",
            };

            // Update job status to "downloading" immediately when container starts
            // This ensures the UI shows progress even if the first callback fails
            const now = new Date().toISOString();
            await env.MOVIES_D1.prepare(
                `UPDATE jobs SET status = 'downloading', progress = 0, updated_at = ? WHERE job_id = ?`
            )
                .bind(now, job.job_id)
                .run();

            // Call the container's startWithEnvVars method via Durable Object RPC
            await containerStub.startWithEnvVars(envVars);

            // Acknowledge the message - container will handle the rest
            message.ack();

            console.log(
                `Container started for job: ${job.job_id}, status updated to downloading`
            );
        } catch (error) {
            console.error(
                `Failed to start container for job ${job.job_id}:`,
                error
            );

            // Update job status to error in D1
            const now = new Date().toISOString();
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to start container";

            await env.MOVIES_D1.prepare(
                `UPDATE jobs SET status = 'error', error_message = ?, updated_at = ? WHERE job_id = ?`
            )
                .bind(errorMessage, now, job.job_id)
                .run();

            // Retry the message (will go to DLQ after max_retries)
            message.retry();
        }
    }
}
