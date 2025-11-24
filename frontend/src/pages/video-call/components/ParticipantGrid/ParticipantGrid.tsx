import React, { useEffect, useRef } from "react";
import type { Participant } from "../../../../types/video-call";
import styles from "./ParticipantGrid.module.css";

interface ParticipantGridProps {
    participants: Participant[];
}

export default function ParticipantGrid({
    participants,
}: ParticipantGridProps): React.JSX.Element {
    const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

    useEffect(() => {
        participants.forEach((participant) => {
            const videoElement = videoRefs.current.get(participant.id);
            if (videoElement && participant.stream) {
                videoElement.srcObject = participant.stream;
            }
        });
    }, [participants]);

    if (participants.length === 0) {
        return (
            <div className={styles["emptyState"]}>
                <div className={styles["emptyMessage"]}>
                    No participants connected yet... 👁️💾
                </div>
            </div>
        );
    }

    const gridCols = participants.length === 1 ? 1 : participants.length <= 4 ? 2 : 3;

    return (
        <div
            className={styles["grid"]}
            style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
        >
            {participants.map((participant) => (
                <div key={participant.id} className={styles["participant"]}>
                    <video
                        ref={(el) => {
                            if (el) {
                                videoRefs.current.set(participant.id, el);
                                if (participant.stream) {
                                    el.srcObject = participant.stream;
                                }
                            } else {
                                videoRefs.current.delete(participant.id);
                            }
                        }}
                        autoPlay
                        playsInline
                        muted={participant.id === "local"}
                        className={styles["video"]}
                    />
                    <div className={styles["overlay"]}>
                        <div className={styles["name"]}>
                            {participant.name || `Participant ${participant.id}`}
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

