import { spawn } from "node:child_process";
import { extname } from "node:path";
import { writeNZBConfig, configureServers } from "./nzbget-config.js";
import {
    createR2Client,
    uploadToR2,
    findVideoFile,
    listAllFiles,
} from "./upload.js";

const REQUIRED_ENV = [
    "JOB_ID",
    "MOVIE_ID",
    "NZB_URL",
    "CF_ACCESS_CLIENT_ID",
    "CF_ACCESS_CLIENT_SECRET",
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
    // Usenet credentials (shared across all servers)
    usenetUser: process.env.USENET_USERNAME,
    usenetPass: process.env.USENET_PASSWORD,
    // Server 1: Primary US server (Priority 0)
    usenetServer1Host: process.env.USENET_SERVER1_HOST,
    usenetServer1Port: Number.parseInt(process.env.USENET_SERVER1_PORT, 10),
    usenetServer1Connections: Number.parseInt(
        process.env.USENET_SERVER1_CONNECTIONS,
        10
    ),
    usenetServer1Encryption: process.env.USENET_SERVER1_ENCRYPTION === "true",
    // Server 2: EU server (Priority 1) - failover for missing articles
    usenetServer2Host: process.env.USENET_SERVER2_HOST,
    usenetServer2Port: Number.parseInt(process.env.USENET_SERVER2_PORT, 10),
    usenetServer2Connections: Number.parseInt(
        process.env.USENET_SERVER2_CONNECTIONS,
        10
    ),
    usenetServer2Encryption: process.env.USENET_SERVER2_ENCRYPTION === "true",
    // Server 3: Bonus server (Priority 2) - backup for older/missing posts
    usenetServer3Host: process.env.USENET_SERVER3_HOST,
    usenetServer3Port: Number.parseInt(process.env.USENET_SERVER3_PORT, 10),
    usenetServer3Connections: Number.parseInt(
        process.env.USENET_SERVER3_CONNECTIONS,
        10
    ),
    usenetServer3Encryption: process.env.USENET_SERVER3_ENCRYPTION === "true",
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

const r2Client = createR2Client({
    accountId: config.r2Account,
    accessKeyId: config.r2Key,
    secretAccessKey: config.r2Secret,
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
    writeNZBConfig(configPath, {
        downloadDir: config.downloadDir,
        tempDir: config.tempDir,
        port: config.nzbPort,
        username: config.nzbUser,
        password: config.nzbPass,
    });
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
    await configureServers(nzbClient, config);

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
    await uploadToR2(r2Client, {
        filePath: videoFile,
        bucket: config.r2Bucket,
        key: r2Key,
        onProgress: (progress) => notify("uploading", { progress }),
    });

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
