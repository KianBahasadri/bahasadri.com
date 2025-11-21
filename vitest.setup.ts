/**
 * Global Vitest setup for Workers-friendly SMS Commander tests.
 *
 * Seeds deterministic Cloudflare `env` bindings and wraps `fetch` with a guard
 * that throws whenever code attempts to reach Twilio's real REST API. This
 * keeps the suite from making network calls while still running inside the
 * Workers runtime.
 *
 * @see ./docs/AI_AGENT_STANDARDS.md - Mandatory quality requirements
 * @see ./docs/DEVELOPMENT.md - Local development workflow and tooling
 * @see ./app/tools/sms-commander/TESTING_PLAN.md - Detailed testing goals
 */

import { afterAll } from "vitest";

const TWILIO_ENV_KEYS: TwilioEnvKey[] = [
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
];

const DEFAULT_ENV: Record<TwilioEnvKey, string> = {
    TWILIO_ACCOUNT_SID: "AC00000000000000000000000000000000",
    TWILIO_AUTH_TOKEN: "test-auth-token",
    TWILIO_PHONE_NUMBER: "+15555550123",
};

const OPTIONAL_ENV: Record<string, string> = {
    SMS_COMMANDER_WS_SECRET: "test-ws-secret",
};

const originalFetch = globalThis.fetch;
const GUARDED_ORIGIN = "https://api.twilio.com/";

if (typeof originalFetch === "function") {
    const guardedFetch: typeof fetch = async (...args) => {
        const [input] = args;
        const targetUrl =
            typeof input === "string"
                ? input
                : input instanceof Request
                  ? input.url
                  : input.toString();
        if (targetUrl.startsWith(GUARDED_ORIGIN)) {
            throw new Error("Twilio HTTP calls are blocked in tests. Please mock the SDK.");
        }
        return originalFetch(...args);
    };

    globalThis.fetch = guardedFetch;
}

seedEnvBindings();

afterAll(() => {
    if (typeof originalFetch === "function") {
        globalThis.fetch = originalFetch;
    }
});

/**
 * Provide deterministic Workers-style bindings so modules can rely on known
 * Twilio credentials during tests.
 */
function seedEnvBindings(): void {
    const globalEnv = (globalThis.env ?? null) as CloudflareEnv | null;

    if (!globalEnv) {
        globalThis.env = {
            ...DEFAULT_ENV,
            ...OPTIONAL_ENV,
        } as CloudflareEnv;
    } else {
        for (const key of TWILIO_ENV_KEYS) {
            globalEnv[key] ??= DEFAULT_ENV[key];
        }
        for (const [optionalKey, value] of Object.entries(OPTIONAL_ENV)) {
            (globalEnv as unknown as Record<string, string>)[optionalKey] ??= value;
        }
    }

    if (typeof process !== "undefined") {
        for (const key of TWILIO_ENV_KEYS) {
            process.env[key] ??= DEFAULT_ENV[key];
        }
        for (const [optionalKey, value] of Object.entries(OPTIONAL_ENV)) {
            process.env[optionalKey] ??= value;
        }
    }
}


