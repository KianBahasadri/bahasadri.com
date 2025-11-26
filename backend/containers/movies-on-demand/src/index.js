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
    "CALLBACK_URL",
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
    callbackUrl: process.env.CALLBACK_URL,
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
    notify("starting");

    const configPath = "/config/nzbget/nzbget.conf";
    writeNZBConfig(configPath);
    const nzbProcess = spawn("nzbget", ["-D", "-c", configPath], {
        stdio: "inherit",
    });

    nzbProcess.on("error", (err) => {
        throw new Error(`Failed to start nzbget: ${err.message}`);
    });

    await nzbClient.waitForReady();
    await configureServer();

    const nzbId = await addDownload();
    await waitForCompletion(nzbId);

    const videoFile = findVideoFile(config.downloadDir);
    if (!videoFile) {
        throw new Error("Download finished but no video file found");
    }

    const ext = extname(videoFile) || ".mp4";
    const r2Key = `movies/${config.jobId}/movie${ext}`;
    await upload(videoFile, r2Key);

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
    while (true) {
        const history = await nzbClient.call("history", [false]);
        const entry = history.find((item) => item.NZBID === nzbId);
        if (entry) {
            if (entry.Status === "SUCCESS") {
                return;
            }
            throw new Error(`NZB failed: ${entry.Status}`);
        }
        await sleep(5000);
    }
}

async function upload(filePath, key) {
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
    if (!config.callbackUrl) {
        return;
    }

    fetch(config.callbackUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "CF-Access-Client-Id": config.cfId,
            "CF-Access-Client-Secret": config.cfSecret,
        },
        body: JSON.stringify({ job_id: config.jobId, status, ...extra }),
    }).catch((err) => {
        console.warn(`Failed to send callback: ${err.message}`);
    });
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
