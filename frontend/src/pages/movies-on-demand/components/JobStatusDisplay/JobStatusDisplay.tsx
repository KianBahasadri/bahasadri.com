import React from "react";
import type { JobStatus } from "../../../../types/movies-on-demand";
import styles from "./JobStatusDisplay.module.css";

interface JobStatusDisplayProps {
    job: JobStatus | null;
    isLoading: boolean;
    onWatchClick?: () => void;
}

function getStatusColor(status: JobStatus["status"]): string {
    switch (status) {
        case "queued":
            return "var(--syringe-metal)";
        case "downloading":
            return "var(--terminal-cyan)";
        case "preparing":
            return "var(--warning-yellow)";
        case "ready":
            return "var(--terminal-green)";
        case "error":
            return "var(--error-red)";
        case "deleted":
            return "var(--syringe-metal)";
        default:
            return "var(--syringe-metal)";
    }
}

function getStatusLabel(status: JobStatus["status"]): string {
    switch (status) {
        case "queued":
            return "Queued";
        case "downloading":
            return "Downloading";
        case "preparing":
            return "Preparing";
        case "ready":
            return "Ready";
        case "error":
            return "Error";
        case "deleted":
            return "Deleted";
        default:
            return "Unknown";
    }
}

export default function JobStatusDisplay({
    job,
    isLoading,
    onWatchClick,
}: JobStatusDisplayProps): React.JSX.Element {
    if (isLoading) {
        return (
            <div className={styles["container"]}>
                <p>Loading job status...</p>
            </div>
        );
    }

    if (!job) {
        return <></>;
    }

    const statusColor = getStatusColor(job.status);
    const statusLabel = getStatusLabel(job.status);
    const showProgress =
        job.status === "downloading" && job.progress !== null && job.progress !== undefined;

    return (
        <div className={styles["container"]}>
            <div className={styles["statusHeader"]}>
                <span
                    className={styles["statusBadge"]}
                    style={{ backgroundColor: statusColor }}
                >
                    {statusLabel}
                </span>
                {job.release_title && (
                    <span className={styles["releaseTitle"]}>
                        {job.release_title}
                    </span>
                )}
            </div>
            {showProgress && (
                <div className={styles["progressContainer"]}>
                    <div className={styles["progressBar"]}>
                        <div
                            className={styles["progressFill"]}
                            style={{
                                width: `${job.progress}%`,
                                backgroundColor: statusColor,
                            }}
                        />
                    </div>
                    <span className={styles["progressText"]}>
                        {job.progress !== null && job.progress !== undefined
                            ? `${job.progress.toFixed(1)}%`
                            : "0%"}
                    </span>
                </div>
            )}
            {job.status === "error" && job.error_message && (
                <div className={styles["errorMessage"]}>
                    <strong>Error:</strong> {job.error_message}
                </div>
            )}
            {job.status === "ready" && onWatchClick && (
                <button
                    className={styles["watchButton"]}
                    onClick={onWatchClick}
                >
                    Watch
                </button>
            )}
        </div>
    );
}

