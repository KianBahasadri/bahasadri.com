/**
 * R2 Upload Module
 *
 * Handles uploading video files to Cloudflare R2:
 * - S3-compatible client setup
 * - Multipart upload with progress tracking
 * - Video file discovery in downloaded directories
 */

import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream, readdirSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const videoExtensions = new Set([
    ".mp4",
    ".mkv",
    ".avi",
    ".mov",
    ".wmv",
    ".m4v",
]);

/**
 * Create an S3-compatible client for Cloudflare R2.
 *
 * @param {object} options - R2 credentials
 * @param {string} options.accountId - Cloudflare account ID
 * @param {string} options.accessKeyId - R2 access key ID
 * @param {string} options.secretAccessKey - R2 secret access key
 * @returns {S3Client} Configured S3 client
 */
export function createR2Client(options) {
    return new S3Client({
        region: "auto",
        endpoint: `https://${options.accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: options.accessKeyId,
            secretAccessKey: options.secretAccessKey,
        },
    });
}

/**
 * Upload a file to R2 with progress tracking.
 *
 * @param {S3Client} client - S3-compatible client
 * @param {object} options - Upload options
 * @param {string} options.filePath - Local file path to upload
 * @param {string} options.bucket - R2 bucket name
 * @param {string} options.key - Destination key in the bucket
 * @param {function} options.onProgress - Progress callback (percent: number) => Promise<void>
 */
export async function uploadToR2(client, options) {
    const { filePath, bucket, key, onProgress } = options;

    console.log(`[movies-on-demand] upload started for ${key}`);

    // Get file size for progress tracking
    const fileStats = statSync(filePath);
    const fileSize = fileStats.size;
    let lastProgressPercent = -1;

    // Notify initial progress
    if (onProgress) {
        await onProgress(0);
    }

    const upload = new Upload({
        client,
        params: {
            Bucket: bucket,
            Key: key,
            Body: createReadStream(filePath),
            ContentType: getContentType(filePath),
        },
    });

    // Track upload progress
    upload.on("httpUploadProgress", (progress) => {
        if (fileSize > 0 && onProgress) {
            const uploaded = progress.loaded || 0;
            const progressPercent = Math.min(
                100,
                Math.max(0, (uploaded / fileSize) * 100)
            );

            // Only send progress updates when it changes by at least 1%
            if (Math.abs(progressPercent - lastProgressPercent) >= 1) {
                onProgress(Number(progressPercent.toFixed(1))).catch(
                    (error) => {
                        console.error(
                            `[movies-on-demand] Failed to send upload progress: ${error.message}`
                        );
                    }
                );
                lastProgressPercent = progressPercent;
            }
        }
    });

    await upload.done();
}

/**
 * Find a video file in a directory (recursively).
 *
 * @param {string} directory - Directory to search
 * @returns {string|null} Path to the first video file found, or null
 */
export function findVideoFile(directory) {
    if (!existsSync(directory)) {
        return null;
    }

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const full = join(directory, entry.name);
        if (entry.isDirectory()) {
            const nested = findVideoFile(full);
            if (nested) return nested;
        } else if (videoExtensions.has(extname(entry.name).toLowerCase())) {
            return full;
        }
    }

    return null;
}

/**
 * List all files in a directory recursively (for debugging).
 *
 * @param {string} directory - Directory to list
 * @param {string} prefix - Path prefix for recursion
 * @returns {string[]} Array of relative file paths
 */
export function listAllFiles(directory, prefix = "") {
    const files = [];
    if (!existsSync(directory)) {
        return files;
    }

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
            files.push(
                ...listAllFiles(join(directory, entry.name), relativePath)
            );
        } else {
            files.push(relativePath);
        }
    }

    return files;
}

/**
 * Get MIME content type for a video file.
 *
 * @param {string} filePath - File path
 * @returns {string} MIME type
 */
export function getContentType(filePath) {
    const extension = extname(filePath).toLowerCase();
    switch (extension) {
        case ".mp4":
            return "video/mp4";
        case ".mkv":
            return "video/x-matroska";
        case ".avi":
            return "video/x-msvideo";
        case ".mov":
            return "video/quicktime";
        default:
            return "application/octet-stream";
    }
}
