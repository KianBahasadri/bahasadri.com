"use client";

/**
 * UploadZone Component
 *
 * Client component responsible for handling drag-and-drop uploads for the File
 * Arsenal utility.
 *
 * @see ../../../../docs/AI_AGENT_STANDARDS.md
 * @see ../../../../docs/COMPONENTS.md
 */

import { useCallback, useRef, useState } from "react";
import styles from "./UploadZone.module.css";

interface UploadZoneProps {
    allowedMimeTypes?: readonly string[];
}

async function uploadFilePayload(file: File) {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/tools/file-hosting/upload", {
        method: "POST",
        body,
    });

    if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Upload failed");
    }
}

export default function UploadZone({ allowedMimeTypes }: UploadZoneProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [status, setStatus] = useState<"idle" | "uploading" | "error" | "done">(
        "idle"
    );
    const [message, setMessage] = useState<string>("");

    const handleFileUpload = useCallback(
        async (file: File) => {
            if (
                allowedMimeTypes &&
                allowedMimeTypes.length > 0 &&
                !allowedMimeTypes.includes(file.type)
            ) {
                throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
            }
            await uploadFilePayload(file);
        },
        [allowedMimeTypes]
    );

    const setUploading = useCallback(() => {
        setStatus("uploading");
        setMessage("Uploading to the arsenal...");
    }, []);

    const handleSuccess = useCallback(() => {
        setStatus("done");
        setMessage("Uploaded. Refreshing list...");
        setTimeout(() => window.location.reload(), 500);
    }, []);

    const handleError = useCallback((error: unknown) => {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Upload exploded.");
    }, []);

    const submit = useCallback(
        async (file: File | undefined) => {
            if (!file) {
                setStatus("error");
                setMessage("Pick a file, agent.");
                return;
            }

            setUploading();

            try {
                await handleFileUpload(file);
                handleSuccess();
            } catch (error) {
                handleError(error);
            }
        },
        [handleFileUpload, handleSuccess, handleError, setUploading]
    );

    const handleSubmit = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const file = inputRef.current?.files?.[0];
            submit(file);
        },
        [submit]
    );

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            submit(file);
        },
        [submit]
    );

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.dropzone}>
                <input
                    ref={inputRef}
                    type="file"
                    name="file"
                    className={styles.input}
                    onChange={handleChange}
                />
                <div className={styles.instructions}>
                    <p className={styles.title}>Drag files here</p>
                    <p className={styles.subtitle}>
                        Or click to upload. Keep it under 100MB so the Workers
                        runtime doesn&apos;t scream.
                    </p>
                </div>
            </label>
            <button
                type="submit"
                className={styles.button}
                disabled={status === "uploading"}
            >
                {status === "uploading" ? "Uploading..." : "Launch Upload"}
            </button>
            {message ? (
                <p
                    className={
                        status === "error" ? styles.error : styles.helperText
                    }
                >
                    {message}
                </p>
            ) : null}
        </form>
    );
}
