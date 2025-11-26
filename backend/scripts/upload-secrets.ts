#!/usr/bin/env tsx
/**
 * Script to upload all secrets from .env to Cloudflare production
 * 
 * This script reads the .env file from the project root and uploads
 * each environment variable as a Cloudflare Worker secret using wrangler.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const PROJECT_ROOT = path.resolve(path.join(__dirname, "../.."));
const ENV_FILE = path.resolve(path.join(PROJECT_ROOT, ".env"));

// Environment variables that should NOT be uploaded to Cloudflare
// These are local-only configuration variables
const EXCLUDED_KEYS = new Set([
    "CALLBACK_URL", // Local testing override, not needed in production
]);

interface EnvEntry {
    key: string;
    value: string;
}

function validatePathWithinDirectory(
    filePath: string,
    allowedDir: string
): string {
    const resolvedPath = path.resolve(filePath);
    const resolvedDir = path.resolve(allowedDir);
    if (!resolvedPath.startsWith(resolvedDir)) {
        throw new Error(
            `Path ${resolvedPath} is not within allowed directory ${resolvedDir}`
        );
    }
    return resolvedPath;
}

function parseEnvFile(filePath: string): EnvEntry[] {
    const validatedPath = validatePathWithinDirectory(filePath, PROJECT_ROOT);
    const content = readFileSync(validatedPath, "utf8");
    const entries: EnvEntry[] = [];

    for (const line of content.split("\n")) {
        const trimmed = line.trim();
        
        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith("#")) {
            continue;
        }

        // Parse KEY=VALUE format
        const equalIndex = trimmed.indexOf("=");
        if (equalIndex === -1) {
            continue;
        }

        const key = trimmed.slice(0, equalIndex).trim();
        let value = trimmed.slice(equalIndex + 1).trim();

        // Remove quotes if present
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        if (key && value && !EXCLUDED_KEYS.has(key)) {
            entries.push({ key, value });
        }
    }

    return entries;
}

async function uploadSecret(key: string, value: string): Promise<void> {
    process.stdout.write(`Uploading secret: ${key}...\n`);
    
    const wranglerPath = path.join(PROJECT_ROOT, "backend", "node_modules", ".bin", "wrangler");
    
    await new Promise<void>((resolve, reject) => {
        const wrangler = spawn(wranglerPath, ["secret", "put", key], {
            cwd: path.join(PROJECT_ROOT, "backend"),
            stdio: ["pipe", "inherit", "inherit"],
        });

        wrangler.stdin.write(value);
        wrangler.stdin.end();

        wrangler.on("close", (code) => {
            if (code === 0) {
                process.stdout.write(`✓ Successfully uploaded ${key}\n\n`);
                resolve();
            } else {
                const codeString = code === null ? "null" : String(code);
                const error = new Error(`Failed to upload ${key} (exit code: ${codeString})`);
                console.error(`✗ ${error.message}\n`);
                reject(error);
            }
        });

        wrangler.on("error", (error) => {
            console.error(`✗ Failed to upload ${key}:`, error);
            reject(error);
        });
    });
}

async function main(): Promise<void> {
    process.stdout.write("Reading .env file...\n\n");

    let entries: EnvEntry[];
    try {
        entries = parseEnvFile(ENV_FILE);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Failed to read .env file at ${ENV_FILE}:`, errorMessage);
        process.exit(1);
    }

    if (entries.length === 0) {
        console.error("No environment variables found in .env file");
        process.exit(1);
    }

    const countString = String(entries.length);
    const excludedCount = EXCLUDED_KEYS.size;
    process.stdout.write(`Found ${countString} environment variable(s) to upload`);
    if (excludedCount > 0) {
        process.stdout.write(` (${excludedCount} excluded: ${Array.from(EXCLUDED_KEYS).join(", ")})\n\n`);
    } else {
        process.stdout.write(`\n\n`);
    }

    for (const entry of entries) {
        await uploadSecret(entry.key, entry.value);
    }

    process.stdout.write("✓ All secrets uploaded successfully!\n");
}

// Top-level await not supported by tsx with CJS output format
void main().catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Fatal error:", errorMessage);
    process.exit(1);
});

