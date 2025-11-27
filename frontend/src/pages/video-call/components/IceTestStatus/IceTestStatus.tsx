import React from "react";
import type { IceTestStatus as IceTestStatusType } from "../../hooks/use-ice-server-test";
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
            case "testing": {
                return "⏳";
            }
            case "success": {
                return "✅";
            }
            case "warning": {
                return "⚠️";
            }
            case "failed": {
                return "❌";
            }
        }
    };

    const getStatusText = (): string => {
        switch (status) {
            case "pending": {
                return "Checking network...";
            }
            case "testing": {
                return "Testing connectivity...";
            }
            case "success": {
                return hasStun ? "Network OK" : "Local network only";
            }
            case "warning": {
                return isFirefox
                    ? "Firefox may have issues"
                    : "Limited connectivity";
            }
            case "failed": {
                return "Network issue detected";
            }
        }
    };

    const showDetails =
        (status === "success" && !hasStun) || status === "warning";
    const showError = (status === "failed" || status === "warning") && error;

    const containerClass = `${styles["container"] ?? ""} ${styles[status] ?? ""}`;
    const iconClass = status === "testing" ? `${styles["icon"] ?? ""} ${styles["spinner"] ?? ""}` : (styles["icon"] ?? "");
    const errorTitle = error ?? undefined;
    const errorText = error ?? "";

    return (
        <div className={containerClass}>
            <span className={iconClass}>
                {getStatusIcon()}
            </span>
            <span>{getStatusText()}</span>
            {showDetails && !error ? (
                <span className={styles["details"]}>
                    (STUN unavailable - may have issues on some networks)
                </span>
            ) : null}
            {showError ? (
                <span className={styles["details"]} title={errorTitle}>
                    - {errorText}
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
