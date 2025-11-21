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

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./UploadZone.module.css";

interface UploadZoneProps {
    allowedMimeTypes?: readonly string[];
}

export default function UploadZone({ allowedMimeTypes }: UploadZoneProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [status, setStatus] = useState<
        "idle" | "uploading" | "error" | "done"
    >("idle");
    const [message, setMessage] = useState<string>("");
    const [isDragging, setIsDragging] = useState(false);
    const router = useRouter();

    const handleUpload = async (file: File | undefined) => {
        if (!file) {
            setStatus("error");
            setMessage("Pick a file, agent.");
            return;
        }

        if (
            allowedMimeTypes &&
            allowedMimeTypes.length > 0 &&
            !allowedMimeTypes.includes(file.type)
        ) {
            setStatus("error");
            setMessage(`Unsupported file type: ${file.type || "unknown"}`);
            return;
        }

        setStatus("uploading");
        setMessage("Uploading to the arsenal...");

        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch("/api/tools/file-hosting/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.error ?? "Upload failed");
            }

            setStatus("done");
            setMessage("Uploaded. Refreshing list...");
            router.refresh();
        } catch (error) {
            setStatus("error");
            setMessage(
                error instanceof Error ? error.message : "Upload exploded."
            );
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const file = inputRef.current?.files?.[0];
        handleUpload(file);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        handleUpload(file);
    };

    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);

        const file = event.dataTransfer.files?.[0];
        handleUpload(file);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <label
                className={`${styles.dropzone} ${isDragging ? styles.dragging : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
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
