/**
 * File Hosting - Download Route
 *
 * Logs access metadata and redirects to the R2 asset key.
 *
 * @see ../../../../../../docs/AI_AGENT_STANDARDS.md
 * @see ../../../../../../docs/ARCHITECTURE.md
 */

import {
    getFileById,
    incrementAccessCount,
    insertAccessLog,
} from "../../../../../tools/file-hosting/lib/database";
import { getObject } from "../../../../../tools/file-hosting/lib/r2";
import { buildContentDisposition } from "../../../../../tools/file-hosting/lib/validation";
import { NextRequest } from "next/server";

function getClientIp(headers: Headers): string {
    return (
        headers.get("cf-connecting-ip") ||
        headers.get("x-forwarded-for") ||
        headers.get("x-real-ip") ||
        "0.0.0.0"
    );
}

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ fileId: string }> }
) {
    const { fileId } = await context.params;
    const file = await getFileById(fileId);
    if (!file || file.deleted) {
        return new Response("File missing.", { status: 404 });
    }

    await incrementAccessCount(file.id);

    const headers = new Headers(_request.headers);
    const ipAddress = getClientIp(headers);

    await insertAccessLog({
        id: crypto.randomUUID(),
        fileId: file.id,
        ipAddress,
        userAgent: headers.get("user-agent") ?? undefined,
        referrer: headers.get("referer") ?? undefined,
    });

    const object = await getObject(file.originalUrl);
    if (!object) {
        return new Response("File missing in storage.", { status: 404 });
    }

    return new Response(object.body as BodyInit, {
        headers: {
            "Content-Type":
                object.httpMetadata?.contentType ?? "application/octet-stream",
            "Content-Disposition": buildContentDisposition(file.name),
        },
    });
}

