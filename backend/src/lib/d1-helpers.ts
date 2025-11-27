/**
 * Helper functions for D1 database operations with proper typing
 * 
 * Cloudflare's D1 types are incomplete (methods return `any`), so we provide
 * typed wrappers that cast through `unknown` to break the `any` chain.
 */

import type { D1Database } from "@cloudflare/workers-types";

/**
 * Execute a D1 query and return first result
 */
export async function d1First<T>(
    db: D1Database,
    sql: string,
    ...bindings: unknown[]
): Promise<T | null> {
    // D1.prepare().bind().first() is typed as any, cast through unknown to break any chain
    return (db.prepare(sql).bind(...bindings).first() as unknown) as Promise<T | null>;
}

/**
 * Execute a D1 query and return all results
 */
export async function d1All<T>(
    db: D1Database,
    sql: string,
    ...bindings: unknown[]
): Promise<{ results: T[] }> {
    // D1.prepare().bind().all() is typed as any, cast through unknown to break any chain
    return (db.prepare(sql).bind(...bindings).all() as unknown) as Promise<{ results: T[] }>;
}

/**
 * Execute a D1 query (INSERT/UPDATE/DELETE)
 */
export async function d1Run(
    db: D1Database,
    sql: string,
    ...bindings: unknown[]
): Promise<{ success: boolean }> {
    // D1.prepare().bind().run() is typed as any, cast through unknown to break any chain
    return (db.prepare(sql).bind(...bindings).run() as unknown) as Promise<{ success: boolean }>;
}

