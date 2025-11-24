import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAllMeetings, deleteMeeting } from "../../../../lib/api";
import type { Meeting } from "../../../../types/video-call";
import styles from "./AllMeetingsList.module.css";

interface AllMeetingsListProps {
    readonly onJoinMeeting: (meetingId: string) => void;
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

export default function AllMeetingsList({
    onJoinMeeting,
}: AllMeetingsListProps): React.JSX.Element {
    const queryClient = useQueryClient();
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["video-call", "meetings"],
        queryFn: listAllMeetings,
        refetchInterval: 5000,
    });

    const deleteMeetingMutation = useMutation({
        mutationFn: deleteMeeting,
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ["video-call", "meetings"],
            });
        },
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

    const meetings: Meeting[] = (data?.data ?? []).filter(
        (meeting) => meeting.status !== "INACTIVE"
    );

    const handleDelete = async (
        event: React.MouseEvent<HTMLButtonElement>,
        meetingId: string
    ): Promise<void> => {
        event.stopPropagation();
        try {
            await deleteMeetingMutation.mutateAsync(meetingId);
        } catch {
            // Error is handled by the mutation
        }
    };

    const renderMeetingItem = (meeting: Meeting): React.JSX.Element => {
        return (
            <div key={meeting.id} className={styles["meetingItem"]}>
                <button
                    type="button"
                    className={styles["meetingContent"]}
                    onClick={() => {
                        onJoinMeeting(meeting.id);
                    }}
                >
                    <div className={styles["meetingInfo"]}>
                        <div className={styles["meetingName"]}>
                            {meeting.title ?? "Unnamed Meeting"}
                        </div>
                        <div className={styles["meetingMeta"]}>
                            <span className={styles["meetingId"]}>
                                {meeting.id}
                            </span>
                            <span className={styles["meetingDate"]}>
                                {formatDate(meeting.created_at)}
                            </span>
                            {meeting.status ? (
                                <span className={styles["meetingStatus"]}>
                                    {meeting.status}
                                </span>
                            ) : null}
                        </div>
                    </div>
                    <div className={styles["joinButton"]}>Join →</div>
                </button>
                <button
                    type="button"
                    className={styles["deleteButton"]}
                    onClick={(e) => {
                        void handleDelete(e, meeting.id);
                    }}
                    disabled={deleteMeetingMutation.isPending}
                    aria-label="Delete meeting"
                >
                    {deleteMeetingMutation.isPending ? "..." : "🗑️"}
                </button>
            </div>
        );
    };

    return (
        <div className={styles["container"]}>
            <div className={styles["section"]}>
                <h3 className={styles["sectionTitle"]}>Meetings</h3>
                {meetings.length > 0 ? (
                    <div className={styles["list"]}>
                        {meetings.map((meeting) => renderMeetingItem(meeting))}
                    </div>
                ) : (
                    <div className={styles["empty"]}>No meetings</div>
                )}
            </div>
        </div>
    );
}
