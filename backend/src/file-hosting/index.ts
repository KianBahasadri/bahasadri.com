import { Hono } from "hono";
import type { Env } from "../types/env";
import { withErrorHandling } from "../lib/error-handling";
import {
    validateFile,
    validateFileId,
    sanitizeFilename,
    parseBooleanFormField,
} from "./lib/validation";
import type { FileRow } from "./types";

const app = new Hono<{ Bindings: Env }>();

/**
 * POST /api/file-hosting/upload
 * Upload a file via multipart form data
 */
app.post(
    "/upload",
    withErrorHandling(
        async (c) => {
            const env = c.env;

            // Parse multipart form data
            const formData = await c.req.formData();
            const file = formData.get("file");

            // Validate file
            const fileValidation = validateFile(
                file instanceof File ? file : undefined
            );
            if (!fileValidation.ok) {
                return c.json(
                    {
                        error: fileValidation.error ?? "Invalid file",
                    },
                    400
                );
            }

            const fileObj = file as File;

            // Extract isPublic field (default to true)
            const isPublic = parseBooleanFormField(
                formData.get("isPublic"),
                true
            );

            // Generate unique file ID
            const fileId = crypto.randomUUID();

            // Sanitize filename
            const sanitizedName = sanitizeFilename(fileObj.name);

            // Create R2 key: {fileId}/{sanitized-filename}
            const r2Key = `${fileId}/${sanitizedName}`;

            // Get file buffer
            const fileBuffer = await fileObj.arrayBuffer();

            // Upload to R2
            const contentType = fileObj.type || "application/octet-stream";
            await env.file_hosting_prod.put(r2Key, fileBuffer, {
                httpMetadata: {
                    contentType,
                },
            });

            // Get base URL for download URL
            const url = new URL(c.req.url);
            const baseUrl = `${url.protocol}//${url.host}`;
            const downloadUrl = `${baseUrl}/api/file-hosting/download/${fileId}`;

            // Store metadata in D1
            await env.FILE_HOSTING_DB.prepare(
                `INSERT INTO files (
                    id, name, original_size, mime_type, original_url, 
                    compression_status, is_public
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`
            )
                .bind(
                    fileId,
                    sanitizedName,
                    fileObj.size,
                    fileObj.type ?? "application/octet-stream",
                    r2Key,
                    "pending",
                    isPublic ? 1 : 0
                )
                .run();

            // Return response per API contract
            return c.json(
                {
                    fileId,
                    downloadUrl,
                    compressionStatus: "pending",
                },
                200
            );
        },
        "/api/file-hosting/upload",
        "POST"
    )
);

/**
 * GET /api/file-hosting/files
 * List all uploaded files with pagination
 */
app.get(
    "/files",
    withErrorHandling(
        async (c) => {
            const env = c.env;

            // Parse query parameters
            const cursor = c.req.query("cursor");
            const limitParam = c.req.query("limit");
            const limit = limitParam ? Number.parseInt(limitParam, 10) : 50;

            // Validate limit
            if (Number.isNaN(limit) || limit < 1 || limit > 100) {
                return c.json(
                    {
                        error: "Invalid limit parameter (must be between 1 and 100)",
                    },
                    400
                );
            }

            // Query files (exclude deleted)
            let query = `SELECT * FROM files WHERE deleted = 0 ORDER BY upload_time DESC LIMIT ?`;
            const params: (string | number)[] = [limit + 1]; // Fetch one extra to check if there's a next page

            if (cursor) {
                // Simple cursor-based pagination using upload_time
                query = `SELECT * FROM files WHERE deleted = 0 AND upload_time < ? ORDER BY upload_time DESC LIMIT ?`;
                params.unshift(cursor);
            }

            const result = await env.FILE_HOSTING_DB.prepare(query)
                .bind(...params)
                .all();

            const files = (result.results as FileRow[]) ?? [];
            const hasMore = files.length > limit;
            const filesToReturn = hasMore ? files.slice(0, limit) : files;

            // Format files per API contract
            const urlBase = c.req.url.split("/api")[0];
            const formattedFiles = filesToReturn.map((file: FileRow) => ({
                id: file.id,
                name: file.name,
                originalSize: file.original_size,
                compressedSize: file.compressed_size,
                mimeType: file.mime_type,
                uploadTime: file.upload_time,
                compressionStatus: file.compression_status,
                originalUrl: `${urlBase}/api/file-hosting/download/${file.id}`,
                compressedUrl: file.compressed_url
                    ? `${urlBase}/api/file-hosting/download/${file.id}?compressed=true`
                    : undefined,
                compressionRatio: file.compression_ratio,
                accessCount: file.access_count,
                lastAccessed: file.last_accessed,
                deleted: file.deleted === 1,
                isPublic: file.is_public === 1,
            }));

            // Generate next cursor (use upload_time of last item)
            const nextCursor =
                hasMore && filesToReturn.length > 0
                    ? filesToReturn.at(-1)?.upload_time
                    : undefined;

            return c.json(
                {
                    files: formattedFiles,
                    ...(nextCursor && { nextCursor }),
                },
                200
            );
        },
        "/api/file-hosting/files",
        "GET"
    )
);

/**
 * GET /api/file-hosting/download/[fileId]
 * Download a file with access logging
 */
app.get(
    "/download/:fileId",
    withErrorHandling(
        async (c) => {
            const env = c.env;
            const fileId = c.req.param("fileId");

            // Validate fileId format
            const fileIdValidation = validateFileId(fileId);
            if (!fileIdValidation.ok) {
                return c.json(
                    {
                        error: fileIdValidation.error ?? "Invalid file ID",
                    },
                    400
                );
            }

            // Check if compressed version requested
            const compressed = c.req.query("compressed") === "true";
            const uiAccess = c.req.query("uiAccess") === "true";

            // Query D1 for file metadata
            const fileResult = (await env.FILE_HOSTING_DB.prepare(
                `SELECT * FROM files WHERE id = ? AND deleted = 0`
            )
                .bind(fileId)
                .first()) as FileRow | undefined;

            if (!fileResult) {
                return c.json(
                    {
                        error: "File doesn't exist",
                    },
                    404
                );
            }

            // Check access permissions
            if (fileResult.is_public === 0 && !uiAccess) {
                return c.json(
                    {
                        error: "Private file accessed without UI access",
                    },
                    403
                );
            }

            // Determine which file to serve (original or compressed)
            const r2Key = compressed && fileResult.compressed_url
                ? fileResult.compressed_url
                : fileResult.original_url;

            // Get file from R2
            const object = await env.file_hosting_prod.get(r2Key);

            if (!object) {
                return c.json(
                    {
                        error: "File not found in storage",
                    },
                    404
                );
            }

            // Increment access count
            await env.FILE_HOSTING_DB.prepare(
                `UPDATE files 
                SET access_count = access_count + 1, 
                    last_accessed = CURRENT_TIMESTAMP 
                WHERE id = ?`
            )
                .bind(fileId)
                .run();

            // Log access (basic logging - WHOIS enrichment can be added later)
            const accessLogId = crypto.randomUUID();
            const ipAddress =
                c.req.header("CF-Connecting-IP") ??
                c.req.header("X-Forwarded-For") ??
                "unknown";
            const userAgent = c.req.header("User-Agent") ?? undefined;
            const referrer = c.req.header("Referer") ?? undefined;

            await env.FILE_HOSTING_DB.prepare(
                `INSERT INTO access_logs (
                    id, file_id, ip_address, user_agent, referrer
                ) VALUES (?, ?, ?, ?, ?)`
            )
                .bind(accessLogId, fileId, ipAddress, userAgent, referrer)
                .run();

            // Get file body
            const fileBody = await object.arrayBuffer();

            // Get content type from object metadata or use stored mime type
            const contentType =
                object.httpMetadata?.contentType ??
                fileResult.mime_type ??
                "application/octet-stream";

            // Return file with proper headers
            return new Response(fileBody, {
                status: 200,
                headers: {
                    "Content-Type": contentType,
                    "Content-Disposition": `attachment; filename="${fileResult.name}"`,
                    "Content-Length": fileBody.byteLength.toString(),
                },
            });
        },
        "/api/file-hosting/download/:fileId",
        "GET"
    )
);

export default app;

