import React from "react";
import styles from "./Controls.module.css";

interface ControlsProps {
    readonly videoEnabled: boolean;
    readonly audioEnabled: boolean;
    readonly onToggleVideo: () => void;
    readonly onToggleAudio: () => void;
    readonly onLeave: () => void;
}

export default function Controls({
    videoEnabled,
    audioEnabled,
    onToggleVideo,
    onToggleAudio,
    onLeave,
}: ControlsProps): React.JSX.Element {
    return (
        <div className={styles["controls"]}>
            <button
                type="button"
                className={`${String(styles["button"])} ${String(styles["videoButton"])} ${
                    videoEnabled ? "" : String(styles["disabled"])
                }`}
                onClick={onToggleVideo}
                aria-label={videoEnabled ? "Turn off camera" : "Turn on camera"}
            >
                {videoEnabled ? "📹" : "📹❌"}
            </button>
            <button
                type="button"
                className={`${String(styles["button"])} ${String(styles["audioButton"])} ${
                    audioEnabled ? "" : String(styles["disabled"])
                }`}
                onClick={onToggleAudio}
                aria-label={audioEnabled ? "Mute microphone" : "Unmute microphone"}
            >
                {audioEnabled ? "🎤" : "🎤❌"}
            </button>
            <button
                type="button"
                className={`${String(styles["button"])} ${String(styles["leaveButton"])}`}
                onClick={onLeave}
                aria-label="Leave call"
            >
                Leave
            </button>
        </div>
    );
}

