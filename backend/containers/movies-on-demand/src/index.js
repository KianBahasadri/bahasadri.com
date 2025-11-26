/**
 * Movies on Demand - NZBGet Container Wrapper
 *
 * This script orchestrates the movie download process:
 * 1. Reads job details from environment variables (passed via Queue message)
 * 2. Starts NZBGet in daemon mode
 * 3. Configures Usenet server via JSON-RPC API
 * 4. Adds NZB download and monitors progress
 * 5. Reports progress to Worker via HTTP callback
 * 6. Uploads completed file to R2 via S3 API
 */

import { spawn } from "child_process";
import { createServer } from "http";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import {
    createReadStream,
    statSync,
    readdirSync,
    existsSync,
    writeFileSync,
    mkdirSync,
} from "fs";
import { join, extname, dirname } from "path";

// ============================================================================
// Configuration from Environment (passed via Queue message)
// ============================================================================

const config = {
    // Job details
    jobId: process.env.JOB_ID,
    movieId: process.env.MOVIE_ID,
    nzbUrl: process.env.NZB_URL,
    releaseTitle: process.env.RELEASE_TITLE,

    // Worker callback
    callbackUrl: process.env.CALLBACK_URL,
    cfAccessClientId: process.env.CF_ACCESS_CLIENT_ID,
    cfAccessClientSecret: process.env.CF_ACCESS_CLIENT_SECRET,

    // Usenet server credentials
    usenetHost: process.env.USENET_HOST,
    usenetPort: parseInt(process.env.USENET_PORT || "563", 10),
    usenetUsername: process.env.USENET_USERNAME,
    usenetPassword: process.env.USENET_PASSWORD,
    usenetConnections: parseInt(process.env.USENET_CONNECTIONS || "10", 10),
    usenetEncryption: process.env.USENET_ENCRYPTION === "true",

    // R2 credentials
    r2AccountId: process.env.R2_ACCOUNT_ID,
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    r2BucketName: process.env.R2_BUCKET_NAME,

    // NZBGet settings
    nzbgetDownloadDir: "/downloads/completed",
    nzbgetTempDir: "/downloads/intermediate",
    nzbgetPort: 6789,
    nzbgetUsername: "nzbget",
    nzbgetPassword: "tegbzn6789",
};

// Validate required config
const requiredFields = [
    "jobId",
    "movieId",
    "nzbUrl",
    "callbackUrl",
    "cfAccessClientId",
    "cfAccessClientSecret",
    "usenetHost",
    "usenetUsername",
    "usenetPassword",
    "r2AccountId",
    "r2AccessKeyId",
    "r2SecretAccessKey",
    "r2BucketName",
];

for (const field of requiredFields) {
    if (!config[field]) {
        console.error(
            `Missing required environment variable: ${field.toUpperCase()}`
        );
        process.exit(1);
    }
}

// ============================================================================
// NZBGet JSON-RPC Client
// ============================================================================

class NZBGetClient {
    constructor(host, port, username, password) {
        this.baseUrl = `http://${host}:${port}/jsonrpc`;
        this.auth = Buffer.from(`${username}:${password}`).toString("base64");
    }

    async call(method, params = []) {
        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${this.auth}`,
            },
            body: JSON.stringify({
                method,
                params,
                id: Date.now(),
            }),
        });

        if (!response.ok) {
            throw new Error(
                `NZBGet RPC error: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(`NZBGet RPC error: ${data.error.message}`);
        }

        return data.result;
    }

    async waitForReady(maxAttempts = 30, delayMs = 1000) {
        for (let i = 0; i < maxAttempts; i++) {
            try {
                await this.call("version");
                return true;
            } catch {
                await sleep(delayMs);
            }
        }
        throw new Error("NZBGet failed to start");
    }

    async configureServer(serverConfig) {
        // Set server configuration via JSON-RPC saveconfig method
        // saveconfig expects an array of option objects with Name and Value properties
        const options = [
            { Name: "Server1.Active", Value: "yes" },
            { Name: "Server1.Name", Value: "usenet" },
            { Name: "Server1.Level", Value: "0" },
            { Name: "Server1.Host", Value: serverConfig.host },
            { Name: "Server1.Port", Value: String(serverConfig.port) },
            {
                Name: "Server1.Encryption",
                Value: serverConfig.encryption ? "yes" : "no",
            },
            { Name: "Server1.Username", Value: serverConfig.username },
            { Name: "Server1.Password", Value: serverConfig.password },
            {
                Name: "Server1.Connections",
                Value: String(serverConfig.connections),
            },
        ];

        await this.call("saveconfig", [options]);

        // Reload config to apply changes
        await this.call("reload");
    }

    async addNzb(url, title) {
        // Download NZB from URL first, then pass as base64 content
        // This is more reliable than passing the URL directly
        // NZBGet append method signature:
        // append(NZBFilename, NZBContent, Category, Priority, AddToTop, AddPaused, DupeKey, DupeScore, DupeMode, PPParameters)
        // NZBContent can be base64-encoded NZB content or URL
        // We use base64 content for better reliability

        console.log(`Downloading NZB from URL: ${url}`);
        let nzbContent;
        try {
            const response = await fetch(url, {
                headers: {
                    "User-Agent": "NZBGet-Container/1.0",
                },
            });
            if (!response.ok) {
                throw new Error(
                    `Failed to download NZB: ${response.status} ${response.statusText}`
                );
            }
            const xmlContent = await response.text();

            // Validate that we got XML content
            if (
                !xmlContent.trim().startsWith("<?xml") &&
                !xmlContent.trim().startsWith("<nzb")
            ) {
                throw new Error(
                    "Downloaded content does not appear to be a valid NZB file"
                );
            }

            // Convert to base64
            nzbContent = Buffer.from(xmlContent, "utf-8").toString("base64");
            console.log(
                `NZB downloaded successfully, size: ${xmlContent.length} bytes (base64: ${nzbContent.length} chars)`
            );
        } catch (error) {
            console.error(`Failed to download NZB from URL: ${error.message}`);
            console.error(`Error details: ${error.stack || error}`);
            // Fallback: try passing URL directly (NZBGet might handle it)
            console.log("Falling back to URL-based download...");
            try {
                const result = await this.call("append", [
                    "", // NZBFilename (empty for URL downloads)
                    url, // URL to download NZB from
                    "", // Category
                    0, // Priority (0 = normal)
                    false, // AddToTop
                    false, // AddPaused
                    "", // DupeKey
                    0, // DupeScore
                    "SCORE", // DupeMode
                    "", // PPParameters (empty string, not array)
                ]);
                return result;
            } catch (fallbackError) {
                throw new Error(
                    `Both base64 and URL methods failed. Base64 error: ${error.message}. URL error: ${fallbackError.message}`
                );
            }
        }

        // Use base64 content
        const result = await this.call("append", [
            title || "download.nzb", // NZBFilename
            nzbContent, // Base64-encoded NZB content
            "", // Category
            0, // Priority (0 = normal)
            false, // AddToTop
            false, // AddPaused
            "", // DupeKey
            0, // DupeScore
            "SCORE", // DupeMode
            "", // PPParameters (empty string, not array)
        ]);
        return result; // Returns NZBID
    }

    async getStatus() {
        return await this.call("status");
    }

    async getHistory(hidden = false) {
        return await this.call("history", [hidden]);
    }

    async getGroups() {
        return await this.call("listgroups", [0]); // 0 = NumberOfLogEntries
    }

    async getLog(limit = 50) {
        // log method: log(ID, Limit)
        // ID: 0 for main log, or NZBID for download-specific log
        // Limit: number of entries to return
        try {
            return await this.call("log", [0, limit]);
        } catch (error) {
            // If log method fails, return empty array
            console.warn(`Failed to get NZBGet logs: ${error.message}`);
            return [];
        }
    }

    async testServer() {
        // Test server connection
        // testserver() - Tests the configured Server1
        // Returns: { Success: bool, Message: string }
        // Note: Some NZBGet versions may not support this method or may require different parameters
        try {
            // Try without parameters first (tests Server1 by default)
            return await this.call("testserver", []);
        } catch (error) {
            // If that fails, try with server number 1
            try {
                return await this.call("testserver", [1]);
            } catch (error2) {
                return {
                    Success: false,
                    Message: error.message || error2.message,
                };
            }
        }
    }
}

// ============================================================================
// Progress Reporter
// ============================================================================

class ProgressReporter {
    constructor(callbackUrl, clientId, clientSecret, jobId) {
        this.callbackUrl = callbackUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.jobId = jobId;
        this.lastReportedProgress = -1;
    }

    async report(status, progress = null, errorMessage = null) {
        // Only report if progress changed significantly (avoid spamming)
        if (
            progress !== null &&
            Math.abs(progress - this.lastReportedProgress) < 1
        ) {
            return;
        }

        try {
            const response = await fetch(this.callbackUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "CF-Access-Client-Id": this.clientId,
                    "CF-Access-Client-Secret": this.clientSecret,
                },
                body: JSON.stringify({
                    job_id: this.jobId,
                    status,
                    progress,
                    error_message: errorMessage,
                }),
            });

            if (!response.ok) {
                console.error(`Failed to report progress: ${response.status}`);
            } else {
                this.lastReportedProgress =
                    progress ?? this.lastReportedProgress;
            }
        } catch (error) {
            // Don't spam errors for callback failures - this is expected if the Worker isn't running
            // Only log once per job to avoid cluttering logs
            if (!this._callbackErrorLogged) {
                console.warn(
                    `Failed to report progress to callback URL (this is expected if Worker is not running): ${error.message}`
                );
                this._callbackErrorLogged = true;
            }
        }
    }
}

// ============================================================================
// R2 Uploader
// ============================================================================

class R2Uploader {
    constructor(accountId, accessKeyId, secretAccessKey, bucketName) {
        this.client = new S3Client({
            region: "auto",
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
        this.bucketName = bucketName;
    }

    async upload(filePath, key, onProgress) {
        const fileSize = statSync(filePath).size;
        const fileStream = createReadStream(filePath);

        const upload = new Upload({
            client: this.client,
            params: {
                Bucket: this.bucketName,
                Key: key,
                Body: fileStream,
                ContentType: getContentType(filePath),
            },
            queueSize: 4, // Concurrent parts
            partSize: 1024 * 1024 * 100, // 100MB parts for large files
        });

        upload.on("httpUploadProgress", (progress) => {
            if (onProgress && progress.loaded && fileSize) {
                const percent = (progress.loaded / fileSize) * 100;
                onProgress(percent);
            }
        });

        await upload.done();
        return { size: fileSize, key };
    }

    async exists(key) {
        try {
            await this.client.send(
                new HeadObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                })
            );
            return true;
        } catch {
            return false;
        }
    }
}

// ============================================================================
// Utility Functions
// ============================================================================

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args, {
            stdio: options.stdio || "pipe",
            ...options,
        });

        let stdout = "";
        let stderr = "";

        if (process.stdout) {
            process.stdout.on("data", (data) => {
                stdout += data.toString();
            });
        }

        if (process.stderr) {
            process.stderr.on("data", (data) => {
                stderr += data.toString();
            });
        }

        process.on("close", (code) => {
            if (code === 0) {
                resolve({ stdout, stderr });
            } else {
                reject(
                    new Error(
                        `Command failed with code ${code}: ${stderr || stdout}`
                    )
                );
            }
        });

        process.on("error", (error) => {
            reject(error);
        });
    });
}

async function initializeNZBGetConfig(configPath, settings) {
    // Ensure config directory exists
    const configDir = dirname(configPath);
    if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
    }

    // If config file doesn't exist, create a minimal one
    // NZBGet will expand it with defaults when it starts
    if (!existsSync(configPath)) {
        // Create minimal config file - NZBGet will fill in defaults
        const minimalConfig = `# NZBGet Configuration File
# This file was auto-generated
# NZBGet will expand this with defaults on first run

`;
        writeFileSync(configPath, minimalConfig);
        console.log("Created NZBGet config file");
    }

    // Write config file directly to avoid command-line parsing issues
    // This is especially important for passwords with special characters
    // that might get truncated when passed via -o flags
    let configContent = `# NZBGet Configuration File
# This file was auto-generated

`;

    // Write all settings to the config file
    // NZBGet config format: Key=Value (no quotes needed unless value has spaces)
    for (const [key, value] of Object.entries(settings)) {
        // Escape special characters if needed
        let escapedValue = String(value);
        // If value contains spaces or special chars, wrap in quotes
        if (
            escapedValue.includes(" ") ||
            escapedValue.includes("#") ||
            escapedValue.includes("=")
        ) {
            // Escape quotes and wrap in quotes
            escapedValue = `"${escapedValue.replace(/"/g, '\\"')}"`;
        }
        configContent += `${key}=${escapedValue}\n`;
    }

    writeFileSync(configPath, configContent);
    console.log("NZBGet config file written with settings");
}

function getContentType(filePath) {
    const ext = extname(filePath).toLowerCase();
    const types = {
        ".mp4": "video/mp4",
        ".mkv": "video/x-matroska",
        ".avi": "video/x-msvideo",
        ".mov": "video/quicktime",
        ".wmv": "video/x-ms-wmv",
        ".m4v": "video/x-m4v",
    };
    return types[ext] || "application/octet-stream";
}

function findVideoFile(directory) {
    const videoExtensions = [".mp4", ".mkv", ".avi", ".mov", ".wmv", ".m4v"];

    if (!existsSync(directory)) {
        return null;
    }

    const entries = readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(directory, entry.name);

        if (entry.isDirectory()) {
            // Recursively search subdirectories
            const found = findVideoFile(fullPath);
            if (found) return found;
        } else if (entry.isFile()) {
            const ext = extname(entry.name).toLowerCase();
            if (videoExtensions.includes(ext)) {
                return fullPath;
            }
        }
    }

    return null;
}

// ============================================================================
// Health Check Server
// ============================================================================

/**
 * Start a simple HTTP server on port 8080 for Cloudflare Container health checks.
 * The server responds to any request with 200 OK to indicate the container is ready.
 * This must start immediately so Cloudflare can verify the container is listening.
 */
function startHealthCheckServer() {
    const server = createServer((req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", jobId: config.jobId }));
    });

    const port = 8080;

    // Start listening immediately and log when ready
    // This ensures the port is available as fast as possible for Cloudflare's health checks
    server.listen(port, "0.0.0.0", () => {
        console.log(`Health check server listening on port ${port}`);
        // Emit a custom event to signal readiness (for potential future use)
        server.emit("ready");
    });

    // Make server start listening immediately (don't wait for async operations)
    server.on("error", (error) => {
        console.error(`Health check server error: ${error.message}`);
        // Don't exit - let the main process handle errors
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
        console.log("Shutting down health check server...");
        server.close(() => {
            process.exit(0);
        });
    });

    return server;
}

// Start health check server immediately after validation passes
// This allows Cloudflare to verify the container is ready
const healthCheckServer = startHealthCheckServer();

// ============================================================================
// Main Process
// ============================================================================

async function main() {
    console.log(`Starting job: ${config.jobId}`);
    console.log(`Movie ID: ${config.movieId}`);
    console.log(`Release: ${config.releaseTitle}`);

    const reporter = new ProgressReporter(
        config.callbackUrl,
        config.cfAccessClientId,
        config.cfAccessClientSecret,
        config.jobId
    );

    const uploader = new R2Uploader(
        config.r2AccountId,
        config.r2AccessKeyId,
        config.r2SecretAccessKey,
        config.r2BucketName
    );

    try {
        // Step 1: Initialize NZBGet config file
        console.log("Initializing NZBGet configuration...");
        const configPath = "/config/nzbget/nzbget.conf";
        const nzbgetSettings = {
            MainDir: "/downloads",
            DestDir: config.nzbgetDownloadDir,
            InterDir: config.nzbgetTempDir,
            ControlPort: String(config.nzbgetPort),
            ControlIP: "127.0.0.1",
            ControlUsername: config.nzbgetUsername,
            ControlPassword: config.nzbgetPassword,
            // Log file configuration
            LogFile: "/downloads/nzbget.log",
            LogBufferSize: "1000",
            DetailTarget: "both", // both = log file and stdout
            InfoTarget: "both",
            WarningTarget: "both",
            ErrorTarget: "both",
            DebugTarget: "both",
        };

        await initializeNZBGetConfig(configPath, nzbgetSettings);

        // Step 2: Start NZBGet daemon
        console.log("Starting NZBGet daemon...");
        await reporter.report("downloading", 0);

        const nzbgetProcess = spawn("nzbget", ["-D", "-c", configPath], {
            stdio: "inherit",
        });

        // Handle NZBGet process errors
        nzbgetProcess.on("error", (error) => {
            console.error(`Failed to start NZBGet: ${error.message}`);
            throw error;
        });

        nzbgetProcess.on("exit", (code, signal) => {
            if (code !== null && code !== 0) {
                console.error(
                    `NZBGet process exited with code ${code} and signal ${signal}`
                );
            }
        });

        // Wait for NZBGet to start
        const nzbget = new NZBGetClient(
            "127.0.0.1",
            config.nzbgetPort,
            config.nzbgetUsername,
            config.nzbgetPassword
        );

        await nzbget.waitForReady();
        console.log("NZBGet is ready");

        // Step 3: Configure Usenet server
        console.log("Configuring Usenet server...");
        await nzbget.configureServer({
            host: config.usenetHost,
            port: config.usenetPort,
            username: config.usenetUsername,
            password: config.usenetPassword,
            encryption: config.usenetEncryption,
            connections: config.usenetConnections,
        });

        // Test server connection
        // Wait a moment for config to be fully applied
        await sleep(2000);
        console.log("Testing Usenet server connection...");
        const serverTest = await nzbget.testServer(1);
        if (!serverTest.Success) {
            // Log the error but don't fail - sometimes testserver has issues
            // but the actual download will work
            console.warn(
                `Usenet server connection test failed: ${
                    serverTest.Message || "Unknown error"
                }. Continuing anyway - download will verify connectivity.`
            );
        } else {
            console.log(
                `Server connection test passed: ${serverTest.Message || "OK"}`
            );
        }

        // Step 4: Add NZB download
        // Decode HTML entities in URL (e.g., &amp; -> &)
        const decodedUrl = config.nzbUrl
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
        console.log(`Adding NZB: ${decodedUrl}`);
        const nzbId = await nzbget.addNzb(decodedUrl, config.releaseTitle);

        // Check if append failed (returns 0 on failure)
        if (!nzbId || nzbId === 0) {
            // Check logs for error details
            const logs = await nzbget.getLog(10);
            const errorLogs = logs
                .filter((log) => log.Kind === "ERROR" || log.Kind === "WARNING")
                .map((log) => log.Text)
                .join("; ");
            throw new Error(
                `Failed to add NZB to queue. NZBGet returned ID: ${nzbId}. Errors: ${
                    errorLogs || "None"
                }`
            );
        }

        console.log(`NZB added with ID: ${nzbId}`);

        // Verify the NZB is actually in the queue
        await sleep(2000);
        const groupsAfterAdd = await nzbget.getGroups();
        const ourGroupAfterAdd = groupsAfterAdd.find(
            (g) => g.NZBID === nzbId || g.NZBName.includes(config.releaseTitle)
        );
        if (!ourGroupAfterAdd) {
            // Check history to see if it failed immediately
            const history = await nzbget.getHistory();
            const ourHistory = history.find(
                (h) => h.NZBID === nzbId || h.Name.includes(config.releaseTitle)
            );
            if (ourHistory) {
                throw new Error(
                    `NZB was added but immediately moved to history with status: ${ourHistory.Status}`
                );
            }
            // Check logs for why it disappeared
            const logs = await nzbget.getLog(20);
            const recentLogs = logs.slice(0, 10).map((log) => log.Text);
            throw new Error(
                `NZB was added (ID: ${nzbId}) but not found in queue. Recent logs: ${recentLogs.join(
                    "; "
                )}`
            );
        }
        console.log(
            `NZB verified in queue: ${ourGroupAfterAdd.NZBName} (Status: ${ourGroupAfterAdd.Status})`
        );

        // Step 5: Monitor download progress
        console.log("Monitoring download progress...");
        let downloadComplete = false;
        let lastStatus = "";
        let iterationsWithoutGroup = 0;
        let stalledIterations = 0;
        let lastDownloadedBytes = 0;

        while (!downloadComplete) {
            await sleep(5000); // Check every 5 seconds

            const status = await nzbget.getStatus();
            const groups = await nzbget.getGroups();

            // Check if download is paused globally
            if (status.DownloadPaused) {
                console.log("Download is paused. Attempting to resume...");
                try {
                    await nzbget.call("resumedownload");
                    console.log("Download resumed");
                } catch (error) {
                    console.error(
                        `Failed to resume download: ${error.message}`
                    );
                }
            }

            // Find our download in the queue
            const ourGroup = groups.find(
                (g) =>
                    g.NZBID === nzbId || g.NZBName.includes(config.releaseTitle)
            );

            if (ourGroup) {
                // Debug: log group properties on first iteration
                if (lastStatus === "") {
                    console.log(
                        `Found group: NZBID=${ourGroup.NZBID}, Status=${ourGroup.Status}, FileSizeLo=${ourGroup.FileSizeLo}, FileSizeHi=${ourGroup.FileSizeHi}, RemainingSizeLo=${ourGroup.RemainingSizeLo}, RemainingSizeHi=${ourGroup.RemainingSizeHi}`
                    );
                }

                // Calculate file sizes from 32-bit parts
                // FileSizeLo/FileSizeHi and RemainingSizeLo/RemainingSizeHi are 32-bit parts
                // Combine them: (Hi * 2^32) + Lo
                const totalBytes =
                    Number(ourGroup.FileSizeHi || 0) * 4294967296 +
                        Number(ourGroup.FileSizeLo || 0) || 0;
                const remainingBytes =
                    Number(ourGroup.RemainingSizeHi || 0) * 4294967296 +
                        Number(ourGroup.RemainingSizeLo || 0) || 0;

                const totalMB = totalBytes / 1024 / 1024;
                const remainingMB = remainingBytes / 1024 / 1024;
                const downloadedMB = totalMB - remainingMB;

                // Handle QUEUED state - NZB is being parsed, sizes not available yet
                if (
                    ourGroup.Status === "QUEUED" &&
                    totalBytes === 0 &&
                    remainingBytes === 0
                ) {
                    const statusText = `Parsing NZB file... (Status: ${ourGroup.Status})`;
                    if (statusText !== lastStatus) {
                        console.log(statusText);
                        lastStatus = statusText;
                    }
                    // Report small progress to show activity
                    await reporter.report("downloading", 1);
                    continue; // Skip to next iteration
                }

                // If we have file sizes, calculate progress
                const progress =
                    totalMB > 0 ? (downloadedMB / totalMB) * 100 : 0;

                const downloadRateMBps =
                    (status.DownloadRate || 0) / 1024 / 1024;

                // Calculate downloaded bytes from status (more accurate than group)
                const downloadedBytes =
                    Number(status.DownloadedSizeHi || 0) * 4294967296 +
                        Number(status.DownloadedSizeLo || 0) || 0;

                // Detect stalled downloads (no progress for 2 minutes)
                if (
                    downloadRateMBps === 0 &&
                    downloadedBytes === lastDownloadedBytes
                ) {
                    stalledIterations++;
                    if (stalledIterations >= 24) {
                        // 24 iterations * 5 seconds = 2 minutes
                        console.warn(
                            `Download appears stalled (0 KB/s for 2 minutes). Checking server status...`
                        );
                        // Check server status and logs
                        const logs = await nzbget.getLog(30);
                        const errorLogs = logs
                            .filter((log) => log.Kind === "ERROR")
                            .slice(0, 10)
                            .map((log) => log.Text);
                        if (errorLogs.length > 0) {
                            console.error(
                                `Server errors detected: ${errorLogs.join(
                                    "; "
                                )}`
                            );
                        }

                        // Check if server is on standby
                        if (status.ServerStandBy) {
                            console.warn(
                                "Server is on standby. This may indicate connection issues."
                            );
                        }

                        // Reset counter to avoid spamming
                        stalledIterations = 0;
                    }
                } else {
                    stalledIterations = 0;
                    lastDownloadedBytes = downloadedBytes;
                }

                const statusText = `Downloading: ${downloadedMB.toFixed(
                    0
                )}/${totalMB.toFixed(0)} MB (${downloadRateMBps.toFixed(
                    2
                )} MB/s) [${ourGroup.Status}]`;
                if (statusText !== lastStatus) {
                    console.log(statusText);
                    lastStatus = statusText;
                }

                await reporter.report("downloading", Math.min(progress, 99));
            } else {
                iterationsWithoutGroup++;
                // Group not found - might be queued or just added
                // Log debug info periodically
                if (iterationsWithoutGroup % 3 === 0) {
                    // Every 15 seconds (3 iterations)
                    if (groups.length > 0) {
                        console.log(
                            `Group not found. Looking for NZBID: ${nzbId}, Release: ${
                                config.releaseTitle
                            }. Found ${groups.length} group(s): ${groups
                                .map(
                                    (g) =>
                                        `NZBID=${g.NZBID}, Name=${g.NZBName}, Status=${g.Status}`
                                )
                                .join("; ")}`
                        );
                    } else {
                        console.log(
                            `No groups found yet. Looking for NZBID: ${nzbId}, Release: ${config.releaseTitle}`
                        );
                    }

                    // Check logs for errors
                    const logs = await nzbget.getLog(20);
                    const errorLogs = logs
                        .filter((log) => log.Kind === "ERROR")
                        .slice(0, 5)
                        .map((log) => log.Text);
                    if (errorLogs.length > 0) {
                        console.log(
                            `Recent NZBGet errors: ${errorLogs.join("; ")}`
                        );
                    }
                }

                // If we've been waiting too long (5 minutes), check if NZB failed
                if (iterationsWithoutGroup > 60) {
                    // 60 iterations * 5 seconds = 5 minutes
                    const logs = await nzbget.getLog(50);
                    const errorLogs = logs
                        .filter(
                            (log) =>
                                log.Kind === "ERROR" &&
                                (log.Text.includes("NZB") ||
                                    log.Text.includes("download") ||
                                    log.Text.includes("server"))
                        )
                        .map((log) => log.Text);
                    if (errorLogs.length > 0) {
                        throw new Error(
                            `NZB download failed to start after 5 minutes. Errors: ${errorLogs.join(
                                "; "
                            )}`
                        );
                    }
                }

                // Report small progress to indicate we're waiting for the download to start
                // This ensures the frontend shows the progress bar
                await reporter.report("downloading", 0);

                // Check history for completion
                const history = await nzbget.getHistory();
                const ourHistory = history.find(
                    (h) =>
                        h.NZBID === nzbId ||
                        h.Name.includes(config.releaseTitle)
                );

                if (ourHistory) {
                    if (ourHistory.Status === "SUCCESS") {
                        console.log("Download completed successfully");
                        downloadComplete = true;
                    } else if (
                        ourHistory.Status.startsWith("FAILURE") ||
                        ourHistory.Status === "DELETED"
                    ) {
                        throw new Error(
                            `Download failed: ${ourHistory.Status}`
                        );
                    }
                }
            }

            // Check for stalled download (no progress for 10 minutes)
            if (status.DownloadPaused && groups.length === 0) {
                const history = await nzbget.getHistory();
                if (history.length > 0 && history[0].Status === "SUCCESS") {
                    downloadComplete = true;
                }
            }
        }

        // Step 6: Find the downloaded video file
        console.log("Looking for downloaded video file...");
        await reporter.report("preparing", 0);

        // Wait a moment for post-processing
        await sleep(5000);

        const videoFile = findVideoFile(config.nzbgetDownloadDir);
        if (!videoFile) {
            throw new Error("No video file found in download directory");
        }

        console.log(`Found video file: ${videoFile}`);
        const fileSize = statSync(videoFile).size;
        console.log(
            `File size: ${(fileSize / 1024 / 1024 / 1024).toFixed(2)} GB`
        );

        // Step 7: Upload to R2
        console.log("Uploading to R2...");
        const ext = extname(videoFile).toLowerCase() || ".mp4";
        const r2Key = `movies/${config.jobId}/movie${ext}`;

        await uploader.upload(videoFile, r2Key, (percent) => {
            console.log(`Upload progress: ${percent.toFixed(1)}%`);
            reporter.report("preparing", percent);
        });

        console.log(`Upload complete: ${r2Key}`);

        // Step 8: Report success
        await reporter.report("ready", 100);
        console.log("Job completed successfully!");

        // Cleanup: stop NZBGet
        nzbgetProcess.kill("SIGTERM");

        process.exit(0);
    } catch (error) {
        console.error(`Job failed: ${error.message}`);
        await reporter.report("error", null, error.message);
        process.exit(1);
    }
}

// Run main process
main().catch((error) => {
    console.error(`Unhandled error: ${error.message}`);
    process.exit(1);
});
