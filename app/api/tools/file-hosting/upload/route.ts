/**
 * File Hosting - Upload Route
 *
 * Handles multipart uploads, stores files in R2, and persists metadata in D1.
 *
 * @see ../../../../docs/AI_AGENT_STANDARDS.md
 * @see ../../../../docs/ARCHITECTURE.md
 * @see ../../../../docs/DEVELOPMENT.md
 */

import { NextResponse } from "next/server";
import { insertFile } from "../../../../tools/file-hosting/lib/database";
import {
    buildDownloadUrl,
    buildR2Key,
    putObject,
} from "../../../../tools/file-hosting/lib/r2";
import {
    sanitizeFileName,
    validateFile,
} from "../../../../tools/file-hosting/lib/validation";

const DEFAULT_MIME = "application/octet-stream";

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
        return NextResponse.json(
            { error: "Missing file payload." },
            { status: 400 }
        );
    }

    const validation = validateFile(file);
    if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const safeName = sanitizeFileName(file.name || "upload.bin");
    const mimeType = file.type || DEFAULT_MIME;
    const r2Key = buildR2Key(id, safeName);

    const buffer = await file.arrayBuffer();
    await putObject(r2Key, buffer, {
        httpMetadata: {
            contentType: mimeType,
        },
    });

    await insertFile({
        id,
        name: safeName,
        originalSize: file.size,
        mimeType,
        originalUrl: r2Key,
    });

    return NextResponse.json({
        fileId: id,
        downloadUrl: buildDownloadUrl(id),
        compressionStatus: "pending",
    });
}

