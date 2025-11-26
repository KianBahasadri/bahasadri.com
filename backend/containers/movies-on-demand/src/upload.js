import { createReadStream, statSync } from "fs";
import { basename, extname } from "path";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const [, , filePath, jobId] = process.argv;

if (!filePath || !jobId) {
    console.error("Usage: node upload.js <filePath> <jobId>");
    process.exit(1);
}

const config = {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
};

const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key.toUpperCase());

if (missing.length) {
    console.error(`Missing R2 env vars: ${missing.join(", ")}`);
    process.exit(1);
}

function contentType(targetPath) {
    const map = {
        ".mp4": "video/mp4",
        ".mkv": "video/x-matroska",
        ".avi": "video/x-msvideo",
        ".mov": "video/quicktime",
        ".wmv": "video/x-ms-wmv",
        ".m4v": "video/x-m4v",
    };
    return map[extname(targetPath).toLowerCase()] ?? "application/octet-stream";
}

async function upload() {
    const fileSize = statSync(filePath).size;
    const client = new S3Client({
        region: "auto",
        endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
        },
    });

    const key = `movies/${jobId}/${basename(filePath)}`;
    console.log(`Uploading ${filePath} to r2://${config.bucketName}/${key}`);

    const upload = new Upload({
        client,
        params: {
            Bucket: config.bucketName,
            Key: key,
            Body: createReadStream(filePath),
            ContentType: contentType(filePath),
        },
        partSize: 100 * 1024 * 1024,
        queueSize: 4,
    });

    upload.on("httpUploadProgress", (progress) => {
        if (!progress.loaded) {
            return;
        }
        const percent = ((progress.loaded / fileSize) * 100).toFixed(1);
        process.stdout.write(`\rUpload progress: ${percent}%   `);
    });

    await upload.done();
    process.stdout.write("\nUpload complete.\n");
}

upload().catch((error) => {
    console.error(`Upload failed: ${error.message}`);
    process.exit(1);
});
