/**
 * Vitest configuration tuned for the Cloudflare Workers runtime.
 *
 * Ensures the SMS Commander test suite executes inside a Miniflare-powered
 * environment so APIs like `Request`, `Response`, and Web Crypto match the
 * production runtime. Also wires up our shared setup file plus project path
 * aliases so the tests can import application modules without brittle
 * relative paths.
 *
 * @see ./docs/AI_AGENT_STANDARDS.md - Mandatory quality gates for AI agents
 * @see ./docs/DEVELOPMENT.md - Local development workflow and tooling
 */

import path from "node:path";

import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
    test: {
        globals: true,
        include: ["app/tools/sms-commander/**/*.test.ts"],
        setupFiles: ["./vitest.setup.ts"],
        coverage: {
            provider: "v8",
            reportsDirectory: "./.vitest/coverage",
            reporter: ["text", "json-summary"],
        },
        poolOptions: {
            workers: {
                wrangler: {
                    configPath: "./wrangler.vitest.toml",
                },
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "."),
        },
    },
});

