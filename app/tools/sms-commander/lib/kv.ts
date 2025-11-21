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

/**
 * Resolve the `SMS_MESSAGES` KV binding. Throws an error if the binding is not
 * available, ensuring development and production use the same code path.
 */
export async function getSmsKvNamespace(): Promise<KVNamespace> {
    const { env } = await getCloudflareContext({ async: true });
    const kv = (env as { SMS_MESSAGES?: KVNamespace } | undefined)
        ?.SMS_MESSAGES;

    if (!kv) {
        throw new Error("SMS Commander: SMS_MESSAGES KV binding unavailable. This application requires the SMS_MESSAGES KV binding to be configured.");
    }

    return kv;
}
