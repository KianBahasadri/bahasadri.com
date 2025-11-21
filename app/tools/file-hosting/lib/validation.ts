/**
 * File Hosting Utility - Validation Helpers
 *
 * Utility functions for validating uploads and formatting file metadata for the
 * UI. Keeps business logic decoupled from API routes.
 *
 * @see ../../../docs/AI_AGENT_STANDARDS.md
 * @see ../../../docs/DEVELOPMENT.md
 */

/**
 * Default maximum file size for uploads (100MB).
 *
 * This limit is set to 100MB to avoid issues with the Workers runtime,
 * which may have trouble handling larger payloads. This is a prototype
 * constraint and may be adjusted in the future as platform capabilities
 * or requirements change.
 *
 * See also: UploadZone.tsx, line 121 ("Keep it under 100MB so the Workers runtime doesn't scream")
 */
const DEFAULT_MAX_BYTES = 1024 * 1024 * 100; // 100MB prototype limit

export interface FileValidationOptions {
    maxBytes?: number;
    allowedMimeTypes?: readonly string[];
}

export interface FileValidationResult {
    ok: boolean;
    error?: string;
}

/**
 * Validate whether the uploaded file fits within size and MIME constraints.
 */
export function validateFile(
    file: File,
    options: FileValidationOptions = {}
): FileValidationResult {
    const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
    if (file.size > maxBytes) {
        return {
            ok: false,
            error: `File is too large (${formatBytes(file.size)}). Max allowed is ${formatBytes(
                maxBytes
            )}.`,
        };
    }

    if (
        options.allowedMimeTypes &&
        options.allowedMimeTypes.length > 0 &&
        !options.allowedMimeTypes.includes(file.type)
    ) {
        return {
            ok: false,
            error: `Unsupported file type ${file.type}.`,
        };
    }

    return { ok: true };
}

/**
 * Human readable file size formatter.
 */
export function formatBytes(bytes: number, decimals = 1): string {
    if (!Number.isFinite(bytes) || bytes < 0) {
        return "0 B";
    }

    if (bytes === 0) {
        return "0 B";
    }

    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
    );
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(decimals)} ${units[index]}`;
}

/**
 * Normalize filenames by collapsing whitespace and removing path separators.
 */
export function sanitizeFileName(name: string): string {
    return name.replace(/[/\\]/g, "-").replace(/\s+/g, " ").trim();
}

