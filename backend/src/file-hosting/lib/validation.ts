/**
 * Validation utilities for file hosting
 */

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export interface ValidationResult {
    ok: boolean;
    error?: string;
}

/**
 * Validate file size and presence
 */
export function validateFile(file: File | undefined): ValidationResult {
    if (!file) {
        return { ok: false, error: "Missing file or invalid file payload" };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            ok: false,
            error: `File size exceeds maximum allowed size of ${String(MAX_FILE_SIZE)} bytes`,
        };
    }

    if (file.size === 0) {
        return { ok: false, error: "File cannot be empty" };
    }

    return { ok: true };
}

/**
 * Validate file ID format (UUID)
 */
export function validateFileId(fileId: string): ValidationResult {
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(fileId)) {
        return { ok: false, error: "Invalid file ID format" };
    }
    return { ok: true };
}

/**
 * Sanitize filename to prevent path traversal and special characters
 */
export function sanitizeFilename(filename: string): string {
    // Remove path components
    const basename = filename.split("/").pop() ?? filename;
    // Remove or replace dangerous characters
    return basename
        .replaceAll(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/^\.+/, "") // Remove leading dots
        .slice(0, 255); // Limit length
}

/**
 * Extract boolean from form data string
 */
export function parseBooleanFormField(
    value: FormDataEntryValue | null,
    defaultValue = true
): boolean {
    if (!value) {
        return defaultValue;
    }
    if (typeof value === "string") {
        return value.toLowerCase() === "true" || value === "1";
    }
    return defaultValue;
}

