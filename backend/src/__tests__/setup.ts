/**
 * Test setup for Cloudflare Workers environment
 */

import { beforeEach, vi } from "vitest";
import type {
    KVNamespace,
    R2Bucket,
    D1Database,
    Queue,
    DurableObjectNamespace,
} from "@cloudflare/workers-types";
import type { Env } from "../types/env";
import type { MovieDownloaderContainer } from "../movies-on-demand/container";

// Mock the container module to avoid Cloudflare Workers runtime requirements in tests
vi.mock("../movies-on-demand/container", () => {
    return {
        MovieDownloaderContainer: class {
            defaultPort = 8080;
            sleepAfter = "20m";
            manualStart = true;
        },
        handleMovieQueue: vi.fn(async () => {
            // Mock implementation
        }),
    };
});

declare global {
    var ENV: Env;
}

// Mock Cloudflare Workers environment
beforeEach(() => {
    // Mock environment bindings
    globalThis.ENV = {
        HOME_CONVERSATIONS: {} as KVNamespace,
        SMS_MESSAGES: {} as KVNamespace,
        WHATSAPP_MESSAGES: {} as KVNamespace,
        OPENROUTER_API_KEY: "test-key",
        TWILIO_ACCOUNT_SID: "test-account-sid",
        TWILIO_AUTH_TOKEN: "test-auth-token",
        TWILIO_PHONE_NUMBER: "test-phone-number",
        TWILIO_WHATSAPP_NUMBER: "test-whatsapp-number",
        ELEVENLABS_API_KEY: "test-elevenlabs-key",
        CLOUDFLARE_ACCOUNT_ID: "test-account-id",
        CLOUDFLARE_REALTIME_ORG_ID: "test-org-id",
        CLOUDFLARE_REALTIME_API_TOKEN: "test-api-token",
        file_hosting_prod: {} as R2Bucket,
        FILE_HOSTING_DB: {} as D1Database,
        // Movies on Demand
        TMDB_API_KEY: "test-tmdb-key",
        NZBGEEK_API_KEY: "test-nzbgeek-key",
        MOVIES_R2: {
            head: vi.fn(),
            get: vi.fn(),
            put: vi.fn(),
        } as unknown as R2Bucket,
        MOVIES_D1: {
            prepare: vi.fn(() => ({
                bind: vi.fn().mockReturnThis(),
                first: vi.fn().mockResolvedValue(undefined),
                all: vi.fn().mockResolvedValue({ results: [] }),
                run: vi.fn().mockResolvedValue({ success: true }),
            })),
        } as unknown as D1Database,
        MOVIES_QUEUE: {
            send: vi.fn().mockResolvedValue(undefined),
        } as unknown as Queue,
        MOVIE_DOWNLOADER: {} as DurableObjectNamespace<MovieDownloaderContainer>,
        CONTAINER_SERVICE_TOKEN_ID: "test-token-id",
        CONTAINER_SERVICE_TOKEN_SECRET: "test-token-secret",
        USENET_HOST: "test-usenet-host",
        USENET_PORT: "563",
        USENET_USERNAME: "test-username",
        USENET_PASSWORD: "test-password-placeholder",
        USENET_CONNECTIONS: "4",
        USENET_ENCRYPTION: "tls",
        R2_ACCESS_KEY_ID: "test-access-key",
        R2_SECRET_ACCESS_KEY: "test-secret-key",
    };
});

