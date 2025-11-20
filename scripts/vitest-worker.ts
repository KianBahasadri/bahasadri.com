/**
 * Minimal Worker script used exclusively by the Vitest Workers pool.
 *
 * The SMS Commander unit tests only need a Workerd isolate with the same
 * compatibility flags as production, so this stub worker keeps the wrangler
 * configuration lightweight and avoids pulling in the full OpenNext build.
 *
 * @see ../docs/AI_AGENT_STANDARDS.md
 * @see ../docs/DEVELOPMENT.md
 */

export default {
    /**
     * Default fetch handler required by Wrangler.
     */
    async fetch(): Promise<Response> {
        return new Response("vitest-worker-ok", { status: 204 });
    },
};

