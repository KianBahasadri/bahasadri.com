import React from "react";
import { useQuery } from "@tanstack/react-query";
import { listSessions } from "../../../../lib/api";
import type { Session } from "../../../../types/video-call";
import styles from "./SessionList.module.css";

interface SessionListProps {
    readonly onJoinSession: (meetingId: string) => void;
}

function formatDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        return date.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateString;
    }
}

export default function SessionList({
    onJoinSession,
}: SessionListProps): React.JSX.Element {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["video-call", "sessions"],
        queryFn: listSessions,
        refetchInterval: 5000,
    });

    if (isLoading) {
        return (
            <div className={styles["container"]}>
                <div className={styles["loading"]}>Loading sessions... ⏳</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles["container"]}>
                <div className={styles["error"]}>
                    Failed to load sessions
                    <button
                        type="button"
                        className={styles["retryButton"]}
                        onClick={() => {
                            void refetch();
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const sessions = data?.sessions ?? [];

    if (sessions.length === 0) {
        return (
            <div className={styles["container"]}>
                <div className={styles["empty"]}>
                    No ongoing sessions 📭
                </div>
            </div>
        );
    }

    return (
        <div className={styles["container"]}>
            <h3 className={styles["title"]}>Ongoing Sessions 📹</h3>
            <div className={styles["list"]}>
                {sessions.map((session: Session) => (
                    <button
                        key={session.meeting_id}
                        type="button"
                        className={styles["sessionItem"]}
                        onClick={() => {
                            onJoinSession(session.meeting_id);
                        }}
                    >
                        <div className={styles["sessionInfo"]}>
                            <div className={styles["sessionName"]}>
                                {session.name ?? "Unnamed Session"}
                            </div>
                            <div className={styles["sessionMeta"]}>
                                <span className={styles["sessionId"]}>
                                    {session.meeting_id}
                                </span>
                                <span className={styles["sessionDate"]}>
                                    {formatDate(session.created_at)}
                                </span>
                            </div>
                        </div>
                        <div className={styles["joinButton"]}>Join →</div>
                    </button>
                ))}
            </div>
        </div>
    );
}

