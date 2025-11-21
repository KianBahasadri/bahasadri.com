"use client";

/**
 * Controls Component
 *
 * Media controls for video conferencing (mute, video toggle, leave).
 *
 * Type: Client Component (requires interactivity)
 *
 * @see [PLAN.md](../../PLAN.md) - Planning and documentation
 * @see [docs/COMPONENTS.md](../../../../../docs/COMPONENTS.md) - Component patterns
 * @see [docs/AI_AGENT_STANDARDS.md](../../../../../docs/AI_AGENT_STANDARDS.md) - AI agent standards
 */

import styles from "./Controls.module.css";

/**
 * Controls Component Props
 */
interface ControlsProps {
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    onToggleVideo: () => void;
    onToggleAudio: () => void;
    onLeave: () => void;
}

/**
 * Controls Component
 *
 * Renders media control buttons for video conferencing.
 *
 * @param props - Component props
 * @param props.isVideoEnabled - Whether video is currently enabled
 * @param props.isAudioEnabled - Whether audio is currently enabled
 * @param props.onToggleVideo - Callback to toggle video on/off
 * @param props.onToggleAudio - Callback to toggle audio on/off
 * @param props.onLeave - Callback to leave the room
 * @returns JSX element representing the controls
 */
export default function Controls({
    isVideoEnabled,
    isAudioEnabled,
    onToggleVideo,
    onToggleAudio,
    onLeave,
}: ControlsProps) {
    return (
        <div className={styles.controls}>
            <button
                onClick={onToggleVideo}
                className={`${styles.controlButton} ${
                    !isVideoEnabled ? styles.controlButtonActive : ""
                }`}
                aria-label={isVideoEnabled ? "Turn off video" : "Turn on video"}
            >
                {isVideoEnabled ? "📹" : "📹"}
                <span className={styles.controlLabel}>
                    {isVideoEnabled ? "Video On" : "Video Off"}
                </span>
            </button>

            <button
                onClick={onToggleAudio}
                className={`${styles.controlButton} ${
                    !isAudioEnabled ? styles.controlButtonActive : ""
                }`}
                aria-label={isAudioEnabled ? "Mute" : "Unmute"}
            >
                {isAudioEnabled ? "🎤" : "🔇"}
                <span className={styles.controlLabel}>
                    {isAudioEnabled ? "Unmuted" : "Muted"}
                </span>
            </button>

            <button
                onClick={onLeave}
                className={`${styles.controlButton} ${styles.leaveButton}`}
                aria-label="Leave room"
            >
                🚪
                <span className={styles.controlLabel}>Leave</span>
            </button>
        </div>
    );
}
