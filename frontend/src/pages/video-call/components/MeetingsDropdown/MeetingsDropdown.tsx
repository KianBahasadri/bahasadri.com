import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { listAllMeetings } from "../../../../lib/api";
import type { Meeting } from "../../../../types/video-call";
import styles from "./MeetingsDropdown.module.css";

interface MeetingsDropdownProps {
    readonly onSelectMeeting?: (meetingId: string) => void;
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

export default function MeetingsDropdown({
    onSelectMeeting,
}: MeetingsDropdownProps): React.JSX.Element {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ["video-call", "meetings"],
        queryFn: listAllMeetings,
    });

    const meetings: Meeting[] = data?.data ?? [];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return (): void => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleToggle = (): void => {
        setIsOpen(!isOpen);
    };

    const handleSelectMeeting = (meetingId: string): void => {
        if (onSelectMeeting) {
            onSelectMeeting(meetingId);
        }
        setIsOpen(false);
    };

    const renderDropdownContent = (): React.JSX.Element => {
        if (isLoading) {
            return (
                <div className={styles["emptyState"]}>
                    Loading meetings... ⏳
                </div>
            );
        }

        if (error) {
            return (
                <div className={styles["emptyState"]}>
                    Failed to load meetings
                </div>
            );
        }

        if (meetings.length === 0) {
            return (
                <div className={styles["emptyState"]}>
                    No meetings available
                </div>
            );
        }

        return (
            <ul className={styles["meetingsList"]}>
                {meetings.map((meeting) => (
                    <li key={meeting.id}>
                        <button
                            type="button"
                            className={styles["meetingItem"]}
                            onClick={() => {
                                handleSelectMeeting(meeting.id);
                            }}
                        >
                            <div className={styles["meetingName"]}>
                                {meeting.title ?? "Unnamed Meeting"}
                            </div>
                            <div className={styles["meetingMeta"]}>
                                {formatDate(meeting.created_at)}
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className={styles["dropdownContainer"]} ref={dropdownRef}>
            <button
                type="button"
                className={styles["dropdownButton"]}
                onClick={handleToggle}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <span>Meeting Preset</span>
                <span className={styles["arrow"]}>{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen ? (
                <div className={styles["dropdownMenu"]}>
                    {renderDropdownContent()}
                </div>
            ) : null}
        </div>
    );
}

