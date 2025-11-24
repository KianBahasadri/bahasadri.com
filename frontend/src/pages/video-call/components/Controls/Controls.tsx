import React from "react";
import styles from "./Controls.module.css";

interface ControlsProps {
    videoEnabled: boolean;
    audioEnabled: boolean;
    onToggleVideo: () => void;
    onToggleAudio: () => void;
    onLeave: () => void;
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
                className={`${styles["button"]} ${styles["videoButton"]} ${
                    !videoEnabled ? styles["disabled"] : ""
                }`}
                onClick={onToggleVideo}
                aria-label={videoEnabled ? "Turn off camera" : "Turn on camera"}
            >
                {videoEnabled ? "📹" : "📹❌"}
            </button>
            <button
                type="button"
                className={`${styles["button"]} ${styles["audioButton"]} ${
                    !audioEnabled ? styles["disabled"] : ""
                }`}
                onClick={onToggleAudio}
                aria-label={audioEnabled ? "Mute microphone" : "Unmute microphone"}
            >
                {audioEnabled ? "🎤" : "🎤❌"}
            </button>
            <button
                type="button"
                className={`${styles["button"]} ${styles["leaveButton"]}`}
                onClick={onLeave}
                aria-label="Leave call"
            >
                Leave
            </button>
        </div>
    );
}

