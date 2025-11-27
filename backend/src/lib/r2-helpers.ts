/**
 * Helper functions for R2 bucket operations with proper typing
 * 
 * Cloudflare's R2 types are incomplete (methods return `any`), so we provide
 * typed wrappers that cast through `unknown` to break the `any` chain.
 */

import type { R2Bucket } from "@cloudflare/workers-types";

export interface R2ObjectBody {
    body: ReadableStream;
    size: number;
    httpMetadata: { contentType?: string } | null;
    arrayBuffer: () => Promise<ArrayBuffer>;
}

export interface R2ObjectHead {
    size: number;
    httpMetadata: { contentType?: string } | null;
}

/**
 * Get an object from R2
 */
export async function r2Get(
    bucket: R2Bucket,
    key: string
): Promise<R2ObjectBody | null> {
    // R2.get is typed as any, cast through unknown to break any chain
    return (bucket.get(key) as unknown) as Promise<R2ObjectBody | null>;
}

/**
 * Get an object from R2 with range
 */
export async function r2GetRange(
    bucket: R2Bucket,
    key: string,
    range: { offset: number; length: number }
): Promise<{ body: ReadableStream } | null> {
    // R2.get with range is typed as any, cast through unknown to break any chain
    return (bucket.get(key, { range }) as unknown) as Promise<{ body: ReadableStream } | null>;
}

/**
 * Get object metadata from R2 (head)
 */
export async function r2Head(
    bucket: R2Bucket,
    key: string
): Promise<R2ObjectHead | null> {
    // R2.head is typed as any, cast through unknown to break any chain
    return (bucket.head(key) as unknown) as Promise<R2ObjectHead | null>;
}

/**
 * Put an object to R2
 */
export async function r2Put(
    bucket: R2Bucket,
    key: string,
    body: ArrayBuffer,
    options: { httpMetadata: { contentType: string } }
): Promise<void> {
    // R2.put is typed as any, cast through unknown to break any chain
    await (bucket.put(key, body, options) as unknown as Promise<void>);
}

