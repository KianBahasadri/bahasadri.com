import React, { useRef } from "react";
import type { Participant } from "../../../../types/video-call";
import styles from "./ParticipantGrid.module.css";

interface ParticipantGridProps {
    readonly participants: Participant[];
    readonly onVideoElementRef?: (
        participantId: string,
        element: HTMLVideoElement | null
    ) => void;
}

export default function ParticipantGrid({
    participants,
    onVideoElementRef,
}: ParticipantGridProps): React.JSX.Element {
    const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

    if (participants.length === 0) {
        return (
            <div className={styles["emptyState"]}>
                <div className={styles["emptyMessage"]}>
                    No participants connected yet... 👁️💾
                </div>
            </div>
        );
    }

    let gridCols: 1 | 2 | 3;
    if (participants.length === 1) {
        gridCols = 1;
    } else if (participants.length <= 4) {
        gridCols = 2;
    } else {
        gridCols = 3;
    }

    return (
        <div
            className={styles["grid"]}
            style={{ gridTemplateColumns: `repeat(${String(gridCols)}, 1fr)` }}
        >
            {participants.map((participant) => (
                <div key={participant.id} className={styles["participant"]}>
                    <video
                        ref={(el) => {
                            if (el) {
                                videoRefs.current.set(participant.id, el);
                            } else {
                                videoRefs.current.delete(participant.id);
                            }
                            if (onVideoElementRef) {
                                onVideoElementRef(participant.id, el);
                            }
                        }}
                        autoPlay
                        playsInline
                        muted={participant.id === "local"}
                        className={styles["video"]}
                    >
                        <track kind="captions" />
                    </video>
                    <div className={styles["overlay"]}>
                        <div className={styles["name"]}>
                            {participant.name ?? `Participant ${participant.id}`}
                        </div>
                        <div className={styles["indicators"]}>
                            {!participant.videoEnabled && (
                                <span className={styles["indicator"]}>📹❌</span>
                            )}
                            {!participant.audioEnabled && (
                                <span className={styles["indicator"]}>🎤❌</span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
