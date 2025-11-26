import { spawn } from "child_process";
import { createServer } from "http";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import {
    createReadStream,
    statSync,
    readdirSync,
    existsSync,
    mkdirSync,
    writeFileSync,
} from "fs";
import { join, extname } from "path";

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
    callbackUrl: resolveCallbackUrl(),
    cfId: process.env.CF_ACCESS_CLIENT_ID,
    cfSecret: process.env.CF_ACCESS_CLIENT_SECRET,
    usenetHost: process.env.USENET_HOST,
    usenetPort: parseInt(process.env.USENET_PORT || "563", 10),
    usenetUser: process.env.USENET_USERNAME,
    usenetPass: process.env.USENET_PASSWORD,
    usenetConnections: parseInt(process.env.USENET_CONNECTIONS || "10", 10),
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

    async call(method, params = []) {
        const res = await fetch(this.base, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${this.auth}`,
            },
            body: JSON.stringify({ method, params, id: Date.now() }),
        });

        if (!res.ok) {
            throw new Error(`NZBGet RPC failed: ${res.status}`);
        }

        const body = await res.json();
        if (body.error) {
            throw new Error(body.error.message || "Unknown NZBGet error");
        }

        return body.result;
    }

    async waitForReady(attempts = 30) {
        for (let i = 0; i < attempts; i++) {
            try {
                await this.call("version");
                return;
            } catch (err) {
                if (i === attempts - 1) {
                    throw err;
                }
                await sleep(1000);
            }
        }
    }
}

startHealthServer();

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

main().catch((error) => {
    console.error(error);
    notify("error", { message: error.message });
    process.exit(1);
});

async function main() {
    console.log("[movies-on-demand] main start");
    notify("starting");

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
    const videoFile = findVideoFile(config.downloadDir);
    if (!videoFile) {
        throw new Error("Download finished but no video file found");
    }

    console.log("[movies-on-demand] uploading video to R2");
    const ext = extname(videoFile) || ".mp4";
    const r2Key = `movies/${config.jobId}/movie${ext}`;
    await upload(videoFile, r2Key);

    console.log(
        "[movies-on-demand] upload complete, sending ready notification"
    );
    notify("ready", { r2_key: r2Key });
    nzbProcess.kill("SIGTERM");
}

function writeNZBConfig(configPath) {
    const dir = configPath.split("/").slice(0, -1).join("/");
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
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
    console.log("[movies-on-demand] configuring Usenet server");
    const settings = [
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

    return Buffer.from(text, "utf-8").toString("base64");
}

async function waitForCompletion(nzbId) {
    console.log(`[movies-on-demand] waiting for NZB ${nzbId} to finish`);
    let lastProgress = -1;
    let lastStatus = "";

    while (true) {
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
                notify("downloading", {
                    progress,
                    nzb_status: statusText,
                });
                lastProgress = progress;
                lastStatus = statusText;
            }
        } else if (lastStatus !== "queued") {
            notify("downloading", { progress: 0, nzb_status: "queued" });
            lastStatus = "queued";
        }

        const entry = history.find((item) => item.NZBID === nzbId);
        if (entry) {
            if (entry.Status === "SUCCESS") {
                if (lastProgress < 100) {
                    notify("downloading", {
                        progress: 100,
                        nzb_status: "complete",
                    });
                }
                return;
            }
            throw new Error(`NZB failed: ${entry.Status}`);
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
    return (Number(hi) || 0) * 4294967296 + (Number(lo) || 0);
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

function startHealthServer() {
    console.log("[movies-on-demand] starting health server");
    const server = createServer((_, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, jobId: config.jobId }));
    });

    server.listen(8080, "0.0.0.0", () => {
        console.log("Health server listening on 8080");
    });
}

function findVideoFile(dir) {
    if (!existsSync(dir)) {
        return null;
    }

    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            const nested = findVideoFile(full);
            if (nested) return nested;
        } else if (videoExtensions.has(extname(entry.name).toLowerCase())) {
            return full;
        }
    }

    return null;
}

function contentType(filePath) {
    const ext = extname(filePath).toLowerCase();
    if (ext === ".mp4") return "video/mp4";
    if (ext === ".mkv") return "video/x-matroska";
    if (ext === ".avi") return "video/x-msvideo";
    if (ext === ".mov") return "video/quicktime";
    return "application/octet-stream";
}

function decodeHtml(str) {
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

function notify(status, extra = {}) {
    console.log(`[movies-on-demand] notify -> ${status}`);
    if (!config.callbackUrl) {
        console.log("No callback URL configured!!!");
        return;
    }

    console.log(`[movies-on-demand] sending callback to ${config.callbackUrl}`);
    fetch(config.callbackUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "CF-Access-Client-Id": config.cfId,
            "CF-Access-Client-Secret": config.cfSecret,
        },
        body: JSON.stringify({ job_id: config.jobId, status, ...extra }),
    })
        .then(async (res) => {
            if (!res.ok) {
                const text = await res.text();
                console.error(
                    `[movies-on-demand] Callback failed with status ${res.status}: ${text}`
                );
            } else {
                console.log(
                    `[movies-on-demand] Callback succeeded for status ${status}`
                );
            }
        })
        .catch((err) => {
            console.error(
                `[movies-on-demand] Failed to send callback: ${err.message}`,
                err
            );
        });
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveCallbackUrl() {
    // CALLBACK_URL is always set by the worker (container.ts)
    // The worker determines the URL based on ENVIRONMENT before passing it here
    return (
        process.env.CALLBACK_URL ||
        "https://bahasadri.com/api/movies-on-demand/internal/progress"
    );
}
