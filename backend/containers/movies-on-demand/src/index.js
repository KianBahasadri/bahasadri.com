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
import { createReadStream, statSync, readdirSync, existsSync } from "fs";
import { join, extname } from "path";

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
        // Set server configuration via JSON-RPC
        // Matches format:
        // Server1.Active=yes
        // Server1.Name=name
        // Server1.Level=0
        // Server1.Host=host
        // Server1.Port=563
        // Server1.Encryption=yes
        // Server1.Username=user
        // Server1.Password=pass
        // Server1.Connections=50
        const settings = [
            ["Server1.Active", "yes"],
            ["Server1.Name", "usenet"],
            ["Server1.Level", "0"],
            ["Server1.Host", serverConfig.host],
            ["Server1.Port", String(serverConfig.port)],
            ["Server1.Encryption", serverConfig.encryption ? "yes" : "no"],
            ["Server1.Username", serverConfig.username],
            ["Server1.Password", serverConfig.password],
            ["Server1.Connections", String(serverConfig.connections)],
        ];

        for (const [name, value] of settings) {
            await this.call("config", [name, value]);
        }

        // Reload config
        await this.call("reload");
    }

    async addNzb(url, title) {
        // Download NZB from URL and add to queue
        // NZBGet append method signature:
        // append(NZBFilename, URL, Category, Priority, AddToTop, AddPaused, DupeKey, DupeScore, DupeMode, PPParameters)
        // For URL-based downloads, NZBFilename can be empty string
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
            console.error(`Failed to report progress: ${error.message}`);
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
        // Step 1: Start NZBGet daemon
        console.log("Starting NZBGet daemon...");
        await reporter.report("downloading", 0);

        const nzbgetProcess = spawn(
            "/app/nzbget/nzbget",
            ["-D", "-c", "/app/nzbget/share/nzbget/nzbget.conf"],
            {
                stdio: "inherit",
                env: {
                    ...process.env,
                    // Override NZBGet config via environment
                    NZBOP_MAINDIR: "/downloads",
                    NZBOP_DESTDIR: config.nzbgetDownloadDir,
                    NZBOP_INTERDIR: config.nzbgetTempDir,
                    NZBOP_CONTROLPORT: String(config.nzbgetPort),
                    NZBOP_CONTROLIP: "127.0.0.1",
                    NZBOP_CONTROLUSERNAME: config.nzbgetUsername,
                    NZBOP_CONTROLPASSWORD: config.nzbgetPassword,
                },
            }
        );

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

        // Step 2: Configure Usenet server
        console.log("Configuring Usenet server...");
        await nzbget.configureServer({
            host: config.usenetHost,
            port: config.usenetPort,
            username: config.usenetUsername,
            password: config.usenetPassword,
            encryption: config.usenetEncryption,
            connections: config.usenetConnections,
        });

        // Step 3: Add NZB download
        console.log(`Adding NZB: ${config.nzbUrl}`);
        const nzbId = await nzbget.addNzb(config.nzbUrl, config.releaseTitle);
        console.log(`NZB added with ID: ${nzbId}`);

        // Step 4: Monitor download progress
        console.log("Monitoring download progress...");
        let downloadComplete = false;
        let lastStatus = "";

        while (!downloadComplete) {
            await sleep(5000); // Check every 5 seconds

            const status = await nzbget.getStatus();
            const groups = await nzbget.getGroups();

            // Find our download in the queue
            const ourGroup = groups.find(
                (g) =>
                    g.NZBID === nzbId || g.NZBName.includes(config.releaseTitle)
            );

            if (ourGroup) {
                // Calculate progress
                const totalMB = ourGroup.FileSizeMB;
                const remainingMB = ourGroup.RemainingSizeMB;
                const downloadedMB = totalMB - remainingMB;
                const progress =
                    totalMB > 0 ? (downloadedMB / totalMB) * 100 : 0;

                const statusText = `Downloading: ${downloadedMB.toFixed(
                    0
                )}/${totalMB.toFixed(0)} MB (${
                    status.DownloadRate / 1024 / 1024
                } MB/s)`;
                if (statusText !== lastStatus) {
                    console.log(statusText);
                    lastStatus = statusText;
                }

                await reporter.report("downloading", Math.min(progress, 99));
            } else {
                // Group not found - might be queued or just added
                // Log debug info on first few iterations
                if (groups.length > 0) {
                    console.log(
                        `Group not found. Looking for NZBID: ${nzbId}, Release: ${
                            config.releaseTitle
                        }. Found ${groups.length} group(s): ${groups
                            .map((g) => `NZBID=${g.NZBID}, Name=${g.NZBName}`)
                            .join("; ")}`
                    );
                } else {
                    console.log(
                        `No groups found yet. Looking for NZBID: ${nzbId}, Release: ${config.releaseTitle}`
                    );
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

        // Step 5: Find the downloaded video file
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

        // Step 6: Upload to R2
        console.log("Uploading to R2...");
        const ext = extname(videoFile).toLowerCase() || ".mp4";
        const r2Key = `movies/${config.jobId}/movie${ext}`;

        await uploader.upload(videoFile, r2Key, (percent) => {
            console.log(`Upload progress: ${percent.toFixed(1)}%`);
            reporter.report("preparing", percent);
        });

        console.log(`Upload complete: ${r2Key}`);

        // Step 7: Report success
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
