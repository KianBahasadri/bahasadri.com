import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoRoom from "./components/VideoRoom/VideoRoom";
import NetworkMesh from "./components/NetworkMesh/NetworkMesh";
import styles from "./VideoCall.module.css";

export default function VideoCallRoom(): React.JSX.Element {
    console.warn("[VideoCallRoom] Component rendering");
    const { meetingId } = useParams<{ meetingId: string }>();
    console.warn("[VideoCallRoom] meetingId from params:", meetingId);
    const navigate = useNavigate();

    const handleLeave = (): void => {
        console.warn(
            "[VideoCallRoom] handleLeave: Called, navigating to /video-call"
        );
        const result = navigate("/video-call");
        if (result instanceof Promise) {
            result.catch(() => {
                // Navigation errors are handled by React Router
            });
        }
    };

    if (!meetingId) {
        console.warn("[VideoCallRoom] No meetingId, navigating to /video-call");
        const result = navigate("/video-call");
        if (result instanceof Promise) {
            result.catch(() => {
                // Navigation errors are handled by React Router
            });
        }
        return <div />;
    }

    console.warn(
        "[VideoCallRoom] Render: Rendering VideoRoom with meetingId:",
        meetingId
    );
    return (
        <div className={styles["page"]}>
            <NetworkMesh />
            <VideoRoom meetingId={meetingId} onLeave={handleLeave} />
        </div>
    );
}
