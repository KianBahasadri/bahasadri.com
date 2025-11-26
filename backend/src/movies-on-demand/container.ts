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
    // Default port for health checks (the container exposes 8080)
    defaultPort = 8080;

    // Container can run for up to 20 minutes for downloads
    sleepAfter = "20m";

    // Don't auto-start - we start manually with job-specific env vars
    manualStart = true;

    /**
     * Called when the Durable Object receives a fetch request.
     * We use this to start the container with the job details.
     */
    override async fetch(request: Request): Promise<Response> {
        // Parse the job details from the request body
        const jobDetails = (await request.json()) as {
            envVars: Record<string, string>;
        };

        // Start the container with the provided environment variables
        await this.startContainer({
            envVars: jobDetails.envVars,
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
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

        console.log(`Processing job: ${job.job_id} for movie: ${job.movie_id}`);

        try {
            // Get a unique container instance for this job using the job_id as identifier
            const containerId = env.MOVIE_DOWNLOADER.idFromName(job.job_id);
            const containerStub = env.MOVIE_DOWNLOADER.get(containerId);

            // Build callback URL for progress updates
            const callbackUrl = `https://bahasadri.com/api/movies-on-demand/internal/progress`;

            // Build environment variables for the container
            const envVars: Record<string, string> = {
                // Job details
                JOB_ID: job.job_id,
                MOVIE_ID: String(job.movie_id),
                NZB_URL: job.nzb_url,
                RELEASE_TITLE: job.release_title,

                // Worker callback for progress updates
                CALLBACK_URL: callbackUrl,
                CF_ACCESS_CLIENT_ID: env.CONTAINER_SERVICE_TOKEN_ID,
                CF_ACCESS_CLIENT_SECRET: env.CONTAINER_SERVICE_TOKEN_SECRET,

                // Usenet server credentials
                USENET_HOST: env.USENET_HOST,
                USENET_PORT: env.USENET_PORT || "563",
                USENET_USERNAME: env.USENET_USERNAME,
                USENET_PASSWORD: env.USENET_PASSWORD,
                USENET_CONNECTIONS: env.USENET_CONNECTIONS || "10",
                USENET_ENCRYPTION: env.USENET_ENCRYPTION || "true",

                // R2 credentials for upload
                R2_ACCOUNT_ID: env.CLOUDFLARE_ACCOUNT_ID,
                R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
                R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
                R2_BUCKET_NAME: "movies-on-demand",
            };

            // Call the container's fetch method to start it with the job details
            // The container class overrides fetch() to handle starting with env vars
            const response = await containerStub.fetch(
                "https://container.internal/start",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ envVars }),
                }
            );

            if (!response.ok) {
                throw new Error(`Container start failed: ${response.status}`);
            }

            // Acknowledge the message - container will handle the rest
            message.ack();

            console.log(`Container started for job: ${job.job_id}`);
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
