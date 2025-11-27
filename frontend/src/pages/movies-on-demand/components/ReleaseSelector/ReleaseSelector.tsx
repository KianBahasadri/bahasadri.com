import React from "react";
import type { UsenetRelease } from "../../../../types/movies-on-demand";
import styles from "./ReleaseSelector.module.css";

interface ReleaseSelectorProps {
    readonly releases: UsenetRelease[];
    readonly isLoading: boolean;
    readonly onSelect: (release: UsenetRelease) => void;
    readonly onCancel: () => void;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${String(bytes)} B`;
    if (bytes < 1024 * 1024) return `${String((bytes / 1024).toFixed(2))} KB`;
    if (bytes < 1024 * 1024 * 1024)
        return `${String((bytes / (1024 * 1024)).toFixed(2))} MB`;
    return `${String((bytes / (1024 * 1024 * 1024)).toFixed(2))} GB`;
}

export default function ReleaseSelector({
    releases,
    isLoading,
    onSelect,
    onCancel,
}: ReleaseSelectorProps): React.JSX.Element {
    if (isLoading) {
        return (
            <div className={styles["modal"]}>
                <div className={styles["content"]}>
                    <h2>Loading releases...</h2>
                </div>
            </div>
        );
    }

    if (releases.length === 0) {
        return (
            <div className={styles["modal"]}>
                <div className={styles["content"]}>
                    <h2>No releases found</h2>
                    <p>No Usenet releases available for this movie.</p>
                    <button className={styles["cancelButton"]} onClick={onCancel}>
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={styles["modal"]}
            onClick={onCancel}
            onKeyDown={(e) => {
                if (e.key === "Escape") {
                    onCancel();
                }
            }}
            role="button"
            tabIndex={0}
        >
            <div
                className={styles["content"]}
                onClick={(e) => {
                    e.stopPropagation();
                }}
                onKeyDown={(e) => {
                    e.stopPropagation();
                }}
                role="button"
                tabIndex={0}
            >
                <h2>Select Release</h2>
                <div className={styles["releasesList"]}>
                    {releases.map((release) => (
                        <div
                            key={release.id}
                            className={styles["releaseItem"]}
                            onClick={() => {
                                onSelect(release);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onSelect(release);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                        >
                            <div className={styles["releaseHeader"]}>
                                <h3 className={styles["releaseTitle"]}>
                                    {release.title}
                                </h3>
                                {release.quality ? <span className={styles["qualityBadge"]}>
                                        {release.quality}
                                    </span> : null}
                            </div>
                            <div className={styles["releaseDetails"]}>
                                <span className={styles["size"]}>
                                    {formatFileSize(release.size)}
                                </span>
                                {release.codec ? <span className={styles["codec"]}>
                                        {release.codec}
                                    </span> : null}
                                {release.source ? <span className={styles["source"]}>
                                        {release.source}
                                    </span> : null}
                                {release.group ? <span className={styles["group"]}>
                                        {release.group}
                                    </span> : null}
                            </div>
                        </div>
                    ))}
                </div>
                <button className={styles["cancelButton"]} onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
}

