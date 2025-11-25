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
    console.log("[MeetingsList] Component rendering");
    const navigate = useNavigate();
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["video-call", "sessions"],
        queryFn: async () => {
            console.log("[MeetingsList] listSessions: Fetching sessions...");
            try {
                const result = await listSessions();
                console.log(
                    "[MeetingsList] listSessions: Success, sessions:",
                    result
                );
                return result;
            } catch (err) {
                console.error("[MeetingsList] listSessions: Error:", err);
                throw err;
            }
        },
        refetchInterval: 5000,
    });
    console.log("[MeetingsList] Query state:", {
        isLoading,
        hasError: !!error,
        hasData: !!data,
    });

    if (isLoading) {
        console.log("[MeetingsList] Render: Loading state");
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
                            console.log("[MeetingsList] Retry button clicked");
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
    console.log(
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
                        {session.live_participants !== undefined ? (
                            <span className={styles["participantCount"]}>
                                {session.live_participants} active
                                {session.live_participants === 1
                                    ? " participant"
                                    : " participants"}
                            </span>
                        ) : null}
                    </div>
                </div>
                <div className={styles["joinButtons"]}>
                    <button
                        type="button"
                        className={styles["joinButton"]}
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log(
                                "[MeetingsList] Basic join clicked:",
                                session.meeting_id
                            );
                            navigate(`/video-call/basic/${session.meeting_id}`);
                        }}
                    >
                        Basic
                    </button>
                    <button
                        type="button"
                        className={styles["joinButton"]}
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log(
                                "[MeetingsList] Custom join clicked:",
                                session.meeting_id
                            );
                            navigate(`/video-call/${session.meeting_id}`);
                        }}
                    >
                        Custom
                    </button>
                </div>
            </div>
        );
    };

    console.log("[MeetingsList] Render: Rendering sessions list");
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
