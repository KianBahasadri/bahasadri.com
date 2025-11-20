/**
 * Shared helper for accessing the SMS Commander KV namespace.
 *
 * Centralizing this logic avoids duplicated error handling across message and
 * contact storage modules while keeping the binding lookup consistent between
 * server components, route handlers, and tests.
 *
 * @see ../../../../docs/AI_AGENT_STANDARDS.md - Repository-wide standards
 * @see ../../PLAN.md - SMS Commander planning document
 */

import type { KVNamespace } from "@cloudflare/workers-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";

let loggedMissingBinding = false;

/**
 * Resolve the `SMS_MESSAGES` KV binding. Returns `null` when the binding is not
 * available (e.g., during `next dev` without Wrangler), allowing callers to
 * gracefully fall back to in-memory storage.
 */
export async function getSmsKvNamespace(): Promise<KVNamespace | null> {
    try {
        const { env } = await getCloudflareContext({ async: true });
        const kv = (env as { SMS_MESSAGES?: KVNamespace } | undefined)
            ?.SMS_MESSAGES;

        if (!kv) {
            throw new Error("SMS_MESSAGES binding missing");
        }

        return kv;
    } catch (error) {
        if (!loggedMissingBinding) {
            console.warn(
                "SMS Commander: SMS_MESSAGES KV binding unavailable. Falling back to in-memory storage.",
                error instanceof Error ? error.message : error
            );
            loggedMissingBinding = true;
        }

        return null;
    }
}
