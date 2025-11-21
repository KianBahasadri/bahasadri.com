/**
 * Cloudflare secret synchronization utility.
 *
 * Mirrors the sensitive values defined in the local `.env` file to Cloudflare
 * Workers secrets via Wrangler so deployments no longer require manual updates
 * through the dashboard UI. The script intentionally writes secrets via stdin
 * to avoid leaking credentials to process listings or shell history.
 *
 * Usage:
 * ```bash
 * pnpm sync:cloudflare-secrets -- --env production
 * pnpm sync:cloudflare-secrets -- --keys TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN
 * pnpm sync:cloudflare-secrets -- --dry-run
 * ```
 *
 * @see ../docs/AI_AGENT_STANDARDS.md - Mandatory repository standards
 * @see ../docs/DEVELOPMENT.md - Tooling and workflow documentation
 * @see ../docs/DEPLOYMENT.md - Deployment and Wrangler guidance
 */

import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import dotenv from "dotenv";

const DEFAULT_SECRET_KEYS = [
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_REALTIME_APP_ID",
    "CLOUDFLARE_REALTIME_API_TOKEN",
] as const;

interface CliOptions {
    targetEnv?: string;
    keys: string[];
    syncAll: boolean;
    dryRun: boolean;
}

interface SyncResult {
    key: string;
    success: boolean;
}

const HELP_TEXT = `
Synchronize Cloudflare secrets from the local .env file.

Options:
  --env, -e <name>    Target Wrangler environment (e.g., production)
  --keys <k1,k2>      Comma-separated list of keys to sync
  --all               Sync every key present in the .env file
  --dry-run           Print the planned operations without invoking Wrangler
  --help, -h          Show this message
`.trim();

function parseCliOptions(argv: string[]): CliOptions {
    const options: CliOptions = { keys: [], syncAll: false, dryRun: false };

    for (let i = 0; i < argv.length; i += 1) {
        const current = argv[i];
        const next = argv[i + 1];

        if (current === "--env" || current === "-e") {
            if (!next) {
                throw new Error("Missing value for --env flag.");
            }
            options.targetEnv = next;
            i += 1;
        } else if (current.startsWith("--env=")) {
            options.targetEnv = current.split("=")[1];
        } else if (current === "--keys") {
            if (!next) {
                throw new Error("Missing value for --keys flag.");
            }
            options.keys.push(...splitKeys(next));
            i += 1;
        } else if (current.startsWith("--keys=")) {
            options.keys.push(...splitKeys(current.split("=")[1]));
        } else if (current === "--all") {
            options.syncAll = true;
        } else if (current === "--dry-run") {
            options.dryRun = true;
        } else if (current === "--help" || current === "-h") {
            console.log(HELP_TEXT);
            process.exit(0);
        }
    }

    options.keys = Array.from(new Set(options.keys.filter(Boolean)));

    return options;
}

function splitKeys(value: string): string[] {
    return value
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
}

function resolveEnvFilePath(): string {
    const envPath = path.resolve(process.cwd(), ".env");
    if (!existsSync(envPath)) {
        throw new Error(
            "Missing .env file. Create one at the repository root before syncing secrets."
        );
    }
    return envPath;
}

function loadEnvFile(envPath: string): Record<string, string> {
    const contents = readFileSync(envPath, "utf8");
    const parsed = dotenv.parse(contents);
    return parsed;
}

function determineKeysToSync(
    envMap: Record<string, string>,
    options: CliOptions
): string[] {
    if (options.syncAll) {
        return Object.keys(envMap).filter((key) => envMap[key]);
    }

    if (options.keys.length > 0) {
        return options.keys;
    }

    return [...DEFAULT_SECRET_KEYS];
}

function validateKeysPresent(
    envMap: Record<string, string>,
    keys: string[]
): void {
    const missing = keys.filter((key) => !envMap[key]);
    if (missing.length > 0) {
        throw new Error(
            `The following secrets are missing from .env: ${missing.join(", ")}`
        );
    }
}

function resolveWranglerExecutable(): string {
    const binary = process.platform === "win32" ? "wrangler.cmd" : "wrangler";
    const localPath = path.resolve(
        process.cwd(),
        "node_modules",
        ".bin",
        binary
    );

    if (existsSync(localPath)) {
        return localPath;
    }

    return binary;
}

async function writeSecret(
    key: string,
    value: string,
    options: CliOptions
): Promise<SyncResult> {
    const args = ["secret", "put", key];

    if (options.targetEnv) {
        args.push("--env", options.targetEnv);
    }

    const wranglerPath = resolveWranglerExecutable();

    return new Promise<SyncResult>((resolve, reject) => {
        const child = spawn(wranglerPath, args, {
            stdio: ["pipe", "inherit", "inherit"],
            env: process.env,
        });

        child.on("error", (error) => {
            reject(error);
        });

        child.on("exit", (code) => {
            if (code === 0) {
                resolve({ key, success: true });
            } else {
                reject(
                    new Error(
                        `Wrangler exited with status ${code} while syncing ${key}`
                    )
                );
            }
        });

        child.stdin.write(value);
        child.stdin.end();
    });
}

async function main(): Promise<void> {
    const cliOptions = parseCliOptions(process.argv.slice(2));
    const envPath = resolveEnvFilePath();
    const envMap = loadEnvFile(envPath);
    const keysToSync = determineKeysToSync(envMap, cliOptions);

    if (keysToSync.length === 0) {
        console.log("No secrets selected for synchronization. Exiting.");
        return;
    }

    validateKeysPresent(envMap, keysToSync);

    console.log(
        `Syncing ${keysToSync.length} secret${
            keysToSync.length === 1 ? "" : "s"
        } from ${envPath}${
            cliOptions.targetEnv
                ? ` → environment "${cliOptions.targetEnv}"`
                : ""
        }`
    );

    if (cliOptions.dryRun) {
        console.log(
            "Dry run enabled. The following keys would be updated:\n- " +
                keysToSync.join("\n- ")
        );
        return;
    }

    const results: SyncResult[] = [];

    for (const key of keysToSync) {
        const value = envMap[key];
        try {
            const result = await writeSecret(key, value, cliOptions);
            results.push(result);
        } catch (error) {
            console.error(`Failed to sync ${key}:`);
            console.error(error instanceof Error ? error.message : error);
            process.exit(1);
        }
    }

    console.log(
        `Successfully synced ${results.length} secret${
            results.length === 1 ? "" : "s"
        }.`
    );
}

main().catch((error) => {
    console.error("Failed to synchronize Cloudflare secrets:", error);
    process.exit(1);
});
