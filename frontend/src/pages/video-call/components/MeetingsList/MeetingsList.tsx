import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listSessions } from "../../../../lib/api";
import type { Session } from "../../../../types/video-call";
import styles from "./MeetingsList.module.css";

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

export default function MeetingsList(): React.JSX.Element {
    const navigate = useNavigate();
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["video-call", "sessions"],
        queryFn: listSessions,
        refetchInterval: 5000,
    });

    if (isLoading) {
        return (
            <div className={styles["container"]}>
                <div className={styles["loading"]}>Loading meetings... ⏳</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles["container"]}>
                <div className={styles["error"]}>
                    Failed to load meetings
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

    const sessions: Session[] = data?.sessions ?? [];

    const renderSessionItem = (session: Session): React.JSX.Element => {
        return (
            <button
                key={session.meeting_id}
                type="button"
                className={styles["meetingItem"]}
                onClick={() => {
                    navigate(`/video-call/${session.meeting_id}`);
                }}
            >
                <div className={styles["meetingInfo"]}>
                    <div className={styles["meetingName"]}>
                        {session.name ?? "Unnamed Session"}
                    </div>
                    <div className={styles["meetingMeta"]}>
                        <span className={styles["meetingId"]}>
                            {session.meeting_id}
                        </span>
                        <span className={styles["meetingDate"]}>
                            {formatDate(session.created_at)}
                        </span>
                    </div>
                </div>
                <div className={styles["joinButton"]}>Join →</div>
            </button>
        );
    };

    return (
        <div className={styles["container"]}>
            <div className={styles["section"]}>
                <h3 className={styles["sectionTitle"]}>Live Sessions</h3>
                {sessions.length > 0 ? (
                    <div className={styles["list"]}>
                        {sessions.map((session) => renderSessionItem(session))}
                    </div>
                ) : (
                    <div className={styles["empty"]}>No live sessions</div>
                )}
            </div>
        </div>
    );
}
