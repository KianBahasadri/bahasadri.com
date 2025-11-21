"use client";

/**
 * ParticipantGrid Component
 *
 * Displays video feeds in a responsive grid layout. Adapts to the number of
 * participants (1, 2, 3, 4+).
 *
 * Type: Client Component (requires video element rendering)
 *
 * @see [PLAN.md](../../PLAN.md) - Planning and documentation
 * @see [docs/COMPONENTS.md](../../../../../docs/COMPONENTS.md) - Component patterns
 * @see [docs/AI_AGENT_STANDARDS.md](../../../../../docs/AI_AGENT_STANDARDS.md) - AI agent standards
 */

import { useEffect, useRef } from "react";
import styles from "./ParticipantGrid.module.css";
import type { Participant } from "../../lib/types";

/**
 * ParticipantGrid Component Props
 */
interface ParticipantGridProps {
    participants: Participant[];
}

/**
 * ParticipantGrid Component
 *
 * Renders video feeds in a grid layout that adapts based on participant count.
 *
 * @param props - Component props
 * @param props.participants - Array of participants to display
 * @returns JSX element representing the participant grid
 */
export default function ParticipantGrid({
    participants,
}: ParticipantGridProps) {
    const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

    /**
     * Sets video element reference
     */
    function setVideoRef(
        participantId: string,
        element: HTMLVideoElement | null
    ): void {
        if (element) {
            videoRefs.current.set(participantId, element);
        } else {
            videoRefs.current.delete(participantId);
        }
    }

    /**
     * Updates video element srcObject when stream changes
     */
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
            <div className={styles.emptyState}>
                <p>No participants yet. Waiting for others to join...</p>
            </div>
        );
    }

    // Determine grid class based on participant count
    const gridClass =
        participants.length === 1
            ? styles.gridSingle
            : participants.length === 2
            ? styles.gridTwo
            : participants.length === 3
            ? styles.gridThree
            : styles.gridMany;

    return (
        <div className={`${styles.grid} ${gridClass}`}>
            {participants.map((participant) => (
                <div key={participant.id} className={styles.participant}>
                    <video
                        ref={(el) => setVideoRef(participant.id, el)}
                        autoPlay
                        playsInline
                        muted={participant.isLocal}
                        className={styles.video}
                    />
                    {!participant.videoEnabled && (
                        <div className={styles.videoPlaceholder}>
                            <span className={styles.placeholderIcon}>📹</span>
                            <span className={styles.placeholderText}>
                                {participant.name}
                            </span>
                        </div>
                    )}
                    <div className={styles.participantInfo}>
                        <span className={styles.participantName}>
                            {participant.name}
                        </span>
                        <div className={styles.statusIcons}>
                            {!participant.audioEnabled && (
                                <span className={styles.mutedIcon}>🔇</span>
                            )}
                            {!participant.videoEnabled && (
                                <span className={styles.videoOffIcon}>📹</span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
