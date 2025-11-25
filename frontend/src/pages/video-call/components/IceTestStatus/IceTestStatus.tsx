import React from "react";
import type { IceTestStatus as IceTestStatusType } from "../../hooks/useIceServerTest";
import styles from "./IceTestStatus.module.css";

interface IceTestStatusProps {
    readonly status: IceTestStatusType;
    readonly hasStun: boolean;
    readonly error: string | null;
    readonly isFirefox?: boolean;
    readonly onRetry?: () => void;
}

export default function IceTestStatus({
    status,
    hasStun,
    error,
    isFirefox = false,
    onRetry,
}: IceTestStatusProps): React.JSX.Element {
    const getStatusIcon = (): string => {
        switch (status) {
            case "pending":
            case "testing":
                return "⏳";
            case "success":
                return "✅";
            case "warning":
                return "⚠️";
            case "failed":
                return "❌";
        }
    };

    const getStatusText = (): string => {
        switch (status) {
            case "pending":
                return "Checking network...";
            case "testing":
                return "Testing connectivity...";
            case "success":
                return hasStun ? "Network OK" : "Local network only";
            case "warning":
                return isFirefox
                    ? "Firefox may have issues"
                    : "Limited connectivity";
            case "failed":
                return "Network issue detected";
        }
    };

    const showDetails =
        (status === "success" && !hasStun) || status === "warning";
    const showError = (status === "failed" || status === "warning") && error;

    return (
        <div className={`${styles["container"]} ${styles[status]}`}>
            <span
                className={`${styles["icon"]} ${
                    status === "testing" ? styles["spinner"] : ""
                }`}
            >
                {getStatusIcon()}
            </span>
            <span>{getStatusText()}</span>
            {showDetails && !error ? (
                <span className={styles["details"]}>
                    (STUN unavailable - may have issues on some networks)
                </span>
            ) : null}
            {showError ? (
                <span className={styles["details"]} title={error}>
                    - {error}
                </span>
            ) : null}
            {(status === "failed" || status === "warning") && onRetry ? (
                <button
                    type="button"
                    className={styles["retryButton"]}
                    onClick={onRetry}
                >
                    Retry
                </button>
            ) : null}
        </div>
    );
}
