import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoRoom from "./components/VideoRoom/VideoRoom";
import NetworkMesh from "./components/NetworkMesh/NetworkMesh";
import styles from "./VideoCall.module.css";

export default function VideoCallRoom(): React.JSX.Element {
    console.log("[VideoCallRoom] Component rendering");
    const { meetingId } = useParams<{ meetingId: string }>();
    console.log("[VideoCallRoom] meetingId from params:", meetingId);
    const navigate = useNavigate();

    const handleLeave = (): void => {
        console.log(
            "[VideoCallRoom] handleLeave: Called, navigating to /video-call"
        );
        navigate("/video-call");
    };

    if (!meetingId) {
        console.log("[VideoCallRoom] No meetingId, navigating to /video-call");
        navigate("/video-call");
        return <></>;
    }

    console.log(
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
