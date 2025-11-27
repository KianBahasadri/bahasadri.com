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
    console.warn("[MeetingsList] Component rendering");
    const navigate = useNavigate();
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["video-call", "sessions"],
        queryFn: async () => {
            console.warn("[MeetingsList] listSessions: Fetching sessions...");
            try {
                const result = await listSessions();
                console.warn(
                    "[MeetingsList] listSessions: Success, sessions:",
                    result
                );
                return result;
            } catch (error_) {
                console.error("[MeetingsList] listSessions: Error:", error_);
                throw error_;
            }
        },
        refetchInterval: 5000,
    });
    console.warn("[MeetingsList] Query state:", {
        isLoading,
        hasError: !!error,
        hasData: !!data,
    });

    if (isLoading) {
        console.warn("[MeetingsList] Render: Loading state");
        return (
            <div className={styles["container"]}>
                <div className={styles["loading"]}>Loading meetings... ⏳</div>
            </div>
        );
    }

    if (error) {
        console.error("[MeetingsList] Render: Error state:", error);
        return (
            <div className={styles["container"]}>
                <div className={styles["error"]}>
                    Failed to load meetings
                    <button
                        type="button"
                        className={styles["retryButton"]}
                        onClick={() => {
                            console.warn("[MeetingsList] Retry button clicked");
                            refetch().catch(() => {
                                // Error handled by query
                            });
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const sessions: Session[] = data?.sessions ?? [];
    console.warn(
        "[MeetingsList] Render: Rendering sessions list, count:",
        sessions.length
    );

    const renderSessionItem = (session: Session): React.JSX.Element => {
        return (
            <div key={session.meeting_id} className={styles["meetingItem"]}>
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
                        {session.live_participants === undefined ? null : (
                            <span className={styles["participantCount"]}>
                                {session.live_participants} active
                                {session.live_participants === 1
                                    ? " participant"
                                    : " participants"}
                            </span>
                        )}
                    </div>
                </div>
                <div className={styles["joinButtons"]}>
                    <button
                        type="button"
                        className={styles["joinButton"]}
                        onClick={(e) => {
                            e.stopPropagation();
                            console.warn(
                                "[MeetingsList] Join clicked:",
                                session.meeting_id
                            );
                            navigate(`/video-call/${session.meeting_id}`);
                        }}
                    >
                        Join
                    </button>
                </div>
            </div>
        );
    };

    console.warn("[MeetingsList] Render: Rendering sessions list");
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
