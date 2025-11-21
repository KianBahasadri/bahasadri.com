/**
 * File Hosting Utility - R2 Helpers
 *
 * Convenience wrappers for interacting with the R2 bucket used to store file
 * blobs. These helpers ensure consistent error handling and key generation.
 *
 * @see ../../../docs/AI_AGENT_STANDARDS.md
 * @see ../../../docs/ARCHITECTURE.md
 * @see ../../../docs/DEVELOPMENT.md
 */

import type {
    R2Bucket,
    R2ObjectBody,
    R2PutOptions,
} from "@cloudflare/workers-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";

let cachedBucket: R2Bucket | null = null;
let warnedMissingBucket = false;

async function resolveBucket(): Promise<R2Bucket | null> {
    if (cachedBucket) {
        return cachedBucket;
    }

    try {
        const { env } = await getCloudflareContext({ async: true });
        const typedEnv = env as
            | { file_hosting_prod?: R2Bucket; R2_BUCKET?: R2Bucket }
            | undefined;
        const bucket =
            typedEnv?.file_hosting_prod ?? typedEnv?.R2_BUCKET ?? null;

        if (!bucket) {
            throw new Error("R2 bucket binding missing (expected file_hosting_prod or R2_BUCKET)");
        }

        cachedBucket = bucket;
        return bucket;
    } catch (error) {
        if (!warnedMissingBucket) {
            console.warn(
                "File Hosting: R2_BUCKET binding unavailable. File uploads will fail.",
                error instanceof Error ? error.message : error
            );
            warnedMissingBucket = true;
        }

        return null;
    }
}

/**
 * Upload bytes to R2 under the specified object key.
 */
export async function putObject(
    key: string,
    data: ArrayBuffer,
    options?: R2PutOptions
): Promise<void> {
    const bucket = await resolveBucket();
    if (!bucket) {
        throw new Error("R2 bucket binding is missing.");
    }

    await bucket.put(key, data, options);
}

/**
 * Fetch an object from R2.
 */
export async function getObject(key: string): Promise<R2ObjectBody | null> {
    const bucket = await resolveBucket();
    if (!bucket) {
        return null;
    }

    return bucket.get(key);
}

/**
 * Delete an object from R2.
 */
export async function deleteObject(key: string): Promise<void> {
    const bucket = await resolveBucket();
    if (!bucket) {
        return;
    }

    await bucket.delete(key);
}

/**
 * Generate a deterministic object key for a file ID.
 */
export function buildR2Key(fileId: string, fileName: string): string {
    return `files/${fileId}/${fileName}`;
}

/**
 * Build a download URL routed through our API (ensures logging + security).
 */
export function buildDownloadUrl(fileId: string): string {
    return `/api/tools/file-hosting/download/${fileId}`;
}
