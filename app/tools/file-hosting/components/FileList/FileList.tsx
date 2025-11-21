/**
 * FileList Component
 *
 * Server component that renders a list of uploaded files with basic metadata.
 *
 * @see ../../../../docs/AI_AGENT_STANDARDS.md
 * @see ../../../../docs/COMPONENTS.md
 */

import Link from "next/link";
import type { FileMetadata } from "../../lib/types";
import { formatBytes } from "../../lib/validation";
import styles from "./FileList.module.css";

interface FileListProps {
    files: FileMetadata[];
}

export default function FileList({ files }: FileListProps) {
    if (files.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>No files yet. Upload something cursed.</p>
            </div>
        );
    }

    return (
        <div className={styles.list}>
            {files.map((file) => (
                <article key={file.id} className={styles.card}>
                    <div>
                        <h3 className={styles.filename}>{file.name}</h3>
                        <p className={styles.meta}>
                            {formatBytes(file.originalSize)} ·{" "}
                            {file.mimeType || "unknown mime"}
                        </p>
                    </div>
                    <div className={styles.actions}>
                        <Link
                            href={`/api/tools/file-hosting/download/${file.id}`}
                            className={styles.link}
                        >
                            Download
                        </Link>
                        <span className={styles.counter}>
                            {file.accessCount} hits
                        </span>
                    </div>
                </article>
            ))}
        </div>
    );
}

