import { spawn } from "node:child_process";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import {
    createReadStream,
    readdirSync,
    existsSync,
    mkdirSync,
    writeFileSync,
} from "node:fs";
import { join, extname } from "node:path";

const REQUIRED_ENV = [
    "JOB_ID",
    "MOVIE_ID",
    "NZB_URL",
    "CF_ACCESS_CLIENT_ID",
    "CF_ACCESS_CLIENT_SECRET",
    "USENET_HOST",
    "USENET_USERNAME",
    "USENET_PASSWORD",
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME",
];

for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
        console.error(`Missing environment variable: ${key}`);
        process.exit(1);
    }
}

const config = {
    jobId: process.env.JOB_ID,
    movieId: process.env.MOVIE_ID,
    nzbUrl: process.env.NZB_URL,
    releaseTitle: process.env.RELEASE_TITLE || "movie",
    callbackUrl: "https://bahasadri.com/api/movies-on-demand/internal/progress",
    cfId: process.env.CF_ACCESS_CLIENT_ID,
    cfSecret: process.env.CF_ACCESS_CLIENT_SECRET,
    usenetHost: process.env.USENET_HOST,
    usenetPort: Number.parseInt(process.env.USENET_PORT || "563", 10),
    usenetUser: process.env.USENET_USERNAME,
    usenetPass: process.env.USENET_PASSWORD,
    usenetConnections: Number.parseInt(
        process.env.USENET_CONNECTIONS || "40",
        10
    ),
    usenetEncryption: process.env.USENET_ENCRYPTION === "true",
    r2Account: process.env.R2_ACCOUNT_ID,
    r2Key: process.env.R2_ACCESS_KEY_ID,
    r2Secret: process.env.R2_SECRET_ACCESS_KEY,
    r2Bucket: process.env.R2_BUCKET_NAME,
    downloadDir: "/downloads/completed",
    tempDir: "/downloads/intermediate",
    nzbPort: 6789,
    nzbUser: "nzbget",
    nzbPass: "tegbzn6789",
};

const videoExtensions = new Set([
    ".mp4",
    ".mkv",
    ".avi",
    ".mov",
    ".wmv",
    ".m4v",
]);

class NZBGetClient {
    constructor(host, port, username, password) {
        this.base = `http://${host}:${port}/jsonrpc`;
        this.auth = Buffer.from(`${username}:${password}`).toString("base64");
    }

    async call(method, parameters = []) {
        const response = await fetch(this.base, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${this.auth}`,
            },
            body: JSON.stringify({
                method,
                params: parameters,
                id: Date.now(),
            }),
        });

        if (!response.ok) {
            throw new Error(`NZBGet RPC failed: ${response.status}`);
        }

        const body = await response.json();
        if (body.error) {
            throw new Error(body.error.message || "Unknown NZBGet error");
        }

        return body.result;
    }

    async waitForReady(attempts = 30) {
        for (let index = 0; index < attempts; index++) {
            try {
                await this.call("version");
                return;
            } catch (error) {
                if (index === attempts - 1) {
                    throw error;
                }
                await sleep(1000);
            }
        }
    }
}

let nzbShutdownExpected = false;

const nzbClient = new NZBGetClient(
    "127.0.0.1",
    config.nzbPort,
    config.nzbUser,
    config.nzbPass
);

const uploader = new S3Client({
    region: "auto",
    endpoint: `https://${config.r2Account}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: config.r2Key,
        secretAccessKey: config.r2Secret,
    },
});

main().catch(async (error) => {
    console.error(error);
    await notify("error", { message: error.message });
    process.exit(1);
});

async function main() {
    console.log("[movies-on-demand] main start");
    await notify("starting");

    const configPath = "/config/nzbget/nzbget.conf";
    console.log("[movies-on-demand] writing NZBGet config");
    writeNZBConfig(configPath);
    console.log("[movies-on-demand] starting NZBGet daemon");
    const nzbProcess = spawn("nzbget", ["-D", "-c", configPath], {
        stdio: "inherit",
    });

    nzbProcess.on("error", (err) => {
        throw new Error(`Failed to start nzbget: ${err.message}`);
    });

    nzbProcess.on("exit", (code, signal) => {
        if (nzbShutdownExpected) {
            console.log("[movies-on-demand] NZBGet shut down as expected");
            return;
        }
        if (code !== null && code !== 0) {
            console.error(
                `[movies-on-demand] NZBGet process exited with code ${code}, signal ${signal}`
            );
            throw new Error(
                `NZBGet process exited unexpectedly with code ${code}`
            );
        }
    });

    console.log("[movies-on-demand] waiting for NZBGet to become ready");
    await nzbClient.waitForReady();
    await configureServer();

    console.log("[movies-on-demand] adding NZB to queue");
    const nzbId = await addDownload();
    console.log(
        `[movies-on-demand] queued NZB ${nzbId}, waiting for completion`
    );
    await waitForCompletion(nzbId);

    console.log("[movies-on-demand] locating downloaded video file");

    // Log all directories to help debug where files ended up
    const completedFiles = listAllFiles(config.downloadDir);
    const intermediateFiles = listAllFiles(config.tempDir);
    const rootDownloadFiles = listAllFiles("/downloads");

    console.log(
        `[movies-on-demand] Files in completed dir (${
            config.downloadDir
        }): ${JSON.stringify(completedFiles)}`
    );
    console.log(
        `[movies-on-demand] Files in intermediate dir (${
            config.tempDir
        }): ${JSON.stringify(intermediateFiles)}`
    );
    console.log(
        `[movies-on-demand] Files in /downloads root: ${JSON.stringify(
            rootDownloadFiles.filter(
                (f) =>
                    !f.startsWith("completed/") &&
                    !f.startsWith("intermediate/")
            )
        )}`
    );

    const videoFile = findVideoFile(config.downloadDir);
    if (!videoFile) {
        // Also check intermediate and root directories
        const videoInIntermediate = findVideoFile(config.tempDir);
        const videoInRoot = findVideoFile("/downloads");

        if (videoInIntermediate) {
            console.error(
                `[movies-on-demand] Video found in intermediate dir instead of completed: ${videoInIntermediate}`
            );
        }
        if (videoInRoot && !videoInIntermediate) {
            console.error(
                `[movies-on-demand] Video found in root /downloads: ${videoInRoot}`
            );
        }

        throw new Error(
            `Download finished but no video file found in ${config.downloadDir}. ` +
                `Completed: ${completedFiles.length} files, Intermediate: ${intermediateFiles.length} files. ` +
                `Files: ${completedFiles.slice(0, 10).join(", ")}${
                    completedFiles.length > 10 ? "..." : ""
                }`
        );
    }

    console.log("[movies-on-demand] uploading video to R2");
    const extension = extname(videoFile) || ".mp4";
    const r2Key = `movies/${config.jobId}/movie${extension}`;
    await upload(videoFile, r2Key);

    console.log(
        "[movies-on-demand] upload complete, sending ready notification"
    );
    await notify("ready", { r2_key: r2Key });
    nzbShutdownExpected = true;
    nzbProcess.kill("SIGTERM");

    // Wait for process to exit gracefully (with timeout)
    await new Promise((resolve) => {
        if (nzbProcess.killed || nzbProcess.exitCode !== null) {
            resolve();
            return;
        }
        nzbProcess.once("exit", resolve);
        setTimeout(resolve, 5000); // Timeout after 5 seconds
    });
}

function writeNZBConfig(configPath) {
    const directory = configPath.split("/").slice(0, -1).join("/");
    if (!existsSync(directory)) {
        mkdirSync(directory, { recursive: true });
    }

    const content = `MainDir=/downloads
DestDir=${config.downloadDir}
InterDir=${config.tempDir}
ControlPort=${config.nzbPort}
ControlIP=127.0.0.1
ControlUsername=${config.nzbUser}
ControlPassword=${config.nzbPass}
LogFile=/downloads/nzbget.log
`; // NZBGet expands missing defaults on boot

    writeFileSync(configPath, content);
}

async function configureServer() {
    // NZBGet configuration is done in two layers:
    // 1. Config file (-c flag): Sets directory paths (MainDir, DestDir, InterDir) at startup
    //    This is written by writeNZBConfig() before NZBGet starts.
    // 2. API saveconfig: Sets Usenet server credentials and unpacking options at runtime.
    //    Server credentials can't be in the config file (they're environment-specific).
    //    Unpacking must be enabled via API because NZBGet's default is to NOT unpack.
    //    Many Usenet releases are RAR archives that need extraction to get the video file.
    //
    // Both are needed - the config file alone doesn't set up the server or enable unpacking.

    // First, check what config NZBGet loaded at startup
    console.log("[movies-on-demand] checking NZBGet initial config...");
    const currentConfig = await nzbClient.call("config", []);
    const relevantSettings = [
        "MainDir",
        "DestDir",
        "InterDir",
        "TempDir",
        "NzbDir",
    ];
    const initialConfig = {};
    for (const setting of currentConfig) {
        if (relevantSettings.includes(setting.Name)) {
            initialConfig[setting.Name] = setting.Value;
        }
    }
    console.log(
        `[movies-on-demand] NZBGet initial config (before our changes): ${JSON.stringify(
            initialConfig
        )}`
    );

    console.log("[movies-on-demand] configuring Usenet server and directories");
    const settings = [
        // Directory settings - ensure NZBGet uses our paths
        { Name: "MainDir", Value: "/downloads" },
        { Name: "DestDir", Value: config.downloadDir },
        { Name: "InterDir", Value: config.tempDir },

        // Unpacking settings - enable RAR extraction
        { Name: "Unpack", Value: "yes" },
        { Name: "DirectUnpack", Value: "yes" },
        { Name: "UnpackCleanupDisk", Value: "yes" },
        // unrar-free is installed in the container
        { Name: "UnrarCmd", Value: "unrar" },
        // Delete archives after successful extraction
        { Name: "UnpackPauseQueue", Value: "no" },

        // Server settings
        { Name: "Server1.Active", Value: "yes" },
        { Name: "Server1.Host", Value: config.usenetHost },
        { Name: "Server1.Port", Value: String(config.usenetPort) },
        {
            Name: "Server1.Encryption",
            Value: config.usenetEncryption ? "yes" : "no",
        },
        {
            Name: "Server1.Connections",
            Value: String(config.usenetConnections),
        },
        { Name: "Server1.Username", Value: config.usenetUser },
        { Name: "Server1.Password", Value: config.usenetPass },
    ];

    await nzbClient.call("saveconfig", [settings]);
    await nzbClient.call("reload");

    // Verify the config was applied
    const updatedConfig = await nzbClient.call("config", []);
    const finalConfig = {};
    for (const setting of updatedConfig) {
        if (relevantSettings.includes(setting.Name)) {
            finalConfig[setting.Name] = setting.Value;
        }
    }
    console.log(
        `[movies-on-demand] NZBGet config after our changes: ${JSON.stringify(
            finalConfig
        )}`
    );
}

async function addDownload() {
    console.log("[movies-on-demand] addDownload invoked");
    const url = decodeHtml(config.nzbUrl);
    const nzbContent = await fetchNzbAsBase64(url);
    const nzbId = await nzbClient.call("append", [
        config.releaseTitle,
        nzbContent,
        "",
        0,
        false,
        false,
        "",
        0,
        "SCORE",
        "",
    ]);

    if (!nzbId) {
        throw new Error("NZBGet did not return an NZBID");
    }

    return nzbId;
}

async function fetchNzbAsBase64(url) {
    console.log(`[movies-on-demand] downloading NZB from ${url}`);
    const response = await fetch(url, {
        headers: {
            "User-Agent": "movies-on-demand-container/1.0",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to download NZB (${response.status})`);
    }

    const text = await response.text();
    const trimmed = text.trim();
    if (!trimmed.startsWith("<?xml") && !trimmed.startsWith("<nzb")) {
        throw new Error("Downloaded content is not an NZB");
    }

    return Buffer.from(text, "utf8").toString("base64");
}

async function waitForCompletion(nzbId) {
    console.log(`[movies-on-demand] waiting for NZB ${nzbId} to finish`);
    let lastProgress = -1;
    let lastStatus = "";

    while (true) {
        try {
            const [history, groups] = await Promise.all([
                nzbClient.call("history", [false]),
                nzbClient.call("listgroups", [0]),
            ]);

            const group = groups.find((g) => g.NZBID === nzbId);
            if (group) {
                const { progress, statusText } = extractProgress(group);
                if (
                    progress !== null &&
                    (Math.abs(progress - lastProgress) >= 1 ||
                        statusText !== lastStatus)
                ) {
                    await notify("downloading", {
                        progress,
                        nzb_status: statusText,
                    });
                    lastProgress = progress;
                    lastStatus = statusText;
                }
            } else if (lastStatus !== "queued") {
                await notify("downloading", {
                    progress: 0,
                    nzb_status: "queued",
                });
                lastStatus = "queued";
            }

            const entry = history.find((item) => item.NZBID === nzbId);
            if (entry) {
                // Log the full history entry for debugging
                console.log(
                    `[movies-on-demand] NZBGet history entry: ${JSON.stringify(
                        entry
                    )}`
                );

                // Check if files were deleted (health check failure, par failure, etc.)
                if (entry.DeleteStatus && entry.DeleteStatus !== "NONE") {
                    const errorDetails = [
                        `Status: ${entry.Status}`,
                        `DeleteStatus: ${entry.DeleteStatus}`,
                        `Health: ${(entry.Health / 10).toFixed(1)}%`,
                        `ParStatus: ${entry.ParStatus || "NONE"}`,
                        `UnpackStatus: ${entry.UnpackStatus || "NONE"}`,
                        `FailedArticles: ${entry.FailedArticles || 0}/${
                            entry.TotalArticles || 0
                        }`,
                    ].join(", ");
                    throw new Error(`NZBGet deleted files: ${errorDetails}`);
                }

                if (entry.Status.startsWith("SUCCESS")) {
                    if (lastProgress < 100) {
                        await notify("downloading", {
                            progress: 100,
                            nzb_status: "complete",
                        });
                    }
                    return;
                }
                // Include detailed NZBGet status info for debugging
                const healthPercent = (entry.Health / 10).toFixed(1);
                const failedArticles = entry.FailedArticles || 0;
                const totalArticles = entry.TotalArticles || 0;
                const errorDetails = [
                    `Status: ${entry.Status}`,
                    `Health: ${healthPercent}%`,
                    `Articles: ${failedArticles}/${totalArticles} failed`,
                    `ParStatus: ${entry.ParStatus || "NONE"}`,
                    `UnpackStatus: ${entry.UnpackStatus || "NONE"}`,
                    `DeleteStatus: ${entry.DeleteStatus || "NONE"}`,
                ].join(", ");
                throw new Error(`NZB failed: ${errorDetails}`);
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            console.error(
                `[movies-on-demand] Error in waitForCompletion loop: ${errorMessage}`
            );
            throw new Error(
                `Failed to monitor download progress: ${errorMessage}`
            );
        }

        await sleep(5000);
    }
}

function extractProgress(group) {
    const total = combineParts(group.FileSizeLo, group.FileSizeHi);
    const remaining = combineParts(
        group.RemainingSizeLo,
        group.RemainingSizeHi
    );

    if (!total) {
        return { progress: null, statusText: group.Status || "unknown" };
    }

    const downloaded = Math.max(total - remaining, 0);
    const percent = Math.min(100, Math.max(0, (downloaded / total) * 100));
    return {
        progress: Number(percent.toFixed(1)),
        statusText: group.Status || "downloading",
    };
}

function combineParts(lo, hi) {
    return (Number(hi) || 0) * 4_294_967_296 + (Number(lo) || 0);
}

async function upload(filePath, key) {
    console.log(`[movies-on-demand] upload started for ${key}`);
    const upload = new Upload({
        client: uploader,
        params: {
            Bucket: config.r2Bucket,
            Key: key,
            Body: createReadStream(filePath),
            ContentType: contentType(filePath),
        },
    });

    await upload.done();
}

function findVideoFile(directory) {
    if (!existsSync(directory)) {
        return null;
    }

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const full = join(directory, entry.name);
        if (entry.isDirectory()) {
            const nested = findVideoFile(full);
            if (nested) return nested;
        } else if (videoExtensions.has(extname(entry.name).toLowerCase())) {
            return full;
        }
    }

    return null;
}

/**
 * List all files in a directory recursively (for debugging)
 */
function listAllFiles(directory, prefix = "") {
    const files = [];
    if (!existsSync(directory)) {
        return files;
    }

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
            files.push(
                ...listAllFiles(join(directory, entry.name), relativePath)
            );
        } else {
            files.push(relativePath);
        }
    }

    return files;
}

function contentType(filePath) {
    const extension = extname(filePath).toLowerCase();
    if (extension === ".mp4") return "video/mp4";
    if (extension === ".mkv") return "video/x-matroska";
    if (extension === ".avi") return "video/x-msvideo";
    if (extension === ".mov") return "video/quicktime";
    return "application/octet-stream";
}

function decodeHtml(string_) {
    return string_
        .replaceAll("&amp;", "&")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replaceAll("&quot;", '"')
        .replaceAll("&#39;", "'");
}

async function notify(status, extra = {}, retries = 3) {
    console.log(`[movies-on-demand] notify -> ${status}`);

    const isCritical = status === "error" || status === "ready";
    const maxRetries = isCritical ? retries : 1;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(
                `[movies-on-demand] sending callback to ${config.callbackUrl} (attempt ${attempt}/${maxRetries}) for job_id: ${config.jobId}`
            );

            const response = await fetch(config.callbackUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "CF-Access-Client-Id": config.cfId,
                    "CF-Access-Client-Secret": config.cfSecret,
                },
                body: JSON.stringify({
                    job_id: config.jobId,
                    status,
                    ...extra,
                }),
            });

            if (response.ok) {
                console.log(
                    `[movies-on-demand] Callback succeeded for status ${status}`
                );
                return;
            }

            const text = await response.text();

            if (response.status === 403) {
                console.error(
                    `[movies-on-demand] Callback failed with 403 Forbidden - authentication error. Check CF-Access service token credentials. Response: ${text}`
                );
                return;
            }

            if (response.status === 302) {
                console.error(
                    `[movies-on-demand] Callback failed with 302 Redirect - authentication error. Cloudflare Zero Trust is redirecting to login. Check CF-Access service token credentials and application policy. Response: ${text}`
                );
                return;
            }

            if (response.status === 404) {
                console.error(
                    `[movies-on-demand] Callback failed with status 404 for job_id: ${config.jobId}. Job not found in database. Response: ${text}`
                );
                return;
            }

            console.error(
                `[movies-on-demand] Callback failed with status ${response.status}: ${text}`
            );

            if (attempt < maxRetries) {
                const delay = attempt * 1000;
                console.log(
                    `[movies-on-demand] Retrying callback in ${delay}ms...`
                );
                await sleep(delay);
                continue;
            }
        } catch (error) {
            console.error(
                `[movies-on-demand] Failed to send callback (attempt ${attempt}/${maxRetries}): ${error.message}`
            );

            if (attempt < maxRetries) {
                const delay = attempt * 1000;
                console.log(
                    `[movies-on-demand] Retrying callback in ${delay}ms...`
                );
                await sleep(delay);
                continue;
            }
        }
    }

    console.error(
        `[movies-on-demand] Callback failed after ${maxRetries} attempts for status ${status}`
    );
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
